import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  GenerateOptions,
  JsonSchema,
  LlmChatMessage,
  LlmProvider,
  StructuredGenerateOptions,
} from '../../common/llm/types';
import type {
  LocalLlmChatCompletionBody,
  LocalLlmChatCompletionMessage,
  LocalLlmChatCompletionResponse,
  LocalLlmChatCompletionStreamChunk,
  LocalLlmConfig,
} from './types';

@Injectable()
export class LocalLlmService implements LlmProvider {
  private readonly logger = new Logger(LocalLlmService.name);

  constructor(private readonly configService: ConfigService) {}

  getConfig(): LocalLlmConfig {
    return {
      baseUrl: this.configService.getOrThrow<string>('llm.local.baseUrl'),
      apiKey: this.configService.getOrThrow<string>('llm.local.apiKey'),
      model: this.configService.getOrThrow<string>('llm.local.model'),
    };
  }

  generate(
    text: string,
    options: GenerateOptions = {},
  ): Promise<LocalLlmChatCompletionResponse> {
    return this.createChatCompletion({
      messages: this.buildMessages(text, options.messages),
      max_tokens: options.maxTokens,
      temperature: 0,
    });
  }

  streamGenerate(
    text: string,
    options: GenerateOptions = {},
  ): AsyncIterable<string> {
    return this.createChatCompletionStream({
      messages: this.buildMessages(text, options.messages),
      max_tokens: options.maxTokens,
      temperature: 0,
      stream: true,
    });
  }

  async structuredGenerate<TResponse = unknown>(
    text: string,
    jsonSchema: JsonSchema,
    options: StructuredGenerateOptions = {},
  ): Promise<TResponse> {
    const response = await this.createChatCompletion({
      messages: this.buildMessages(text, options.messages),
      max_tokens: options.maxTokens,
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: options.schemaName ?? 'structured_response',
          description: options.schemaDescription,
          schema: jsonSchema,
          strict: options.strict ?? true,
        },
      },
    });
    this.logger.log(
      `Local LLM raw structured response: ${JSON.stringify(response)}`,
    );

    const content = this.extractContent(response);
    this.logger.log(`Local LLM structured content: ${content}`);

    return JSON.parse(content) as TResponse;
  }

  streamStructuredGenerate(
    text: string,
    jsonSchema: JsonSchema,
    options: StructuredGenerateOptions = {},
  ): AsyncIterable<string> {
    return this.createChatCompletionStream({
      messages: this.buildMessages(text, options.messages),
      max_tokens: options.maxTokens,
      temperature: 0,
      stream: true,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: options.schemaName ?? 'structured_response',
          description: options.schemaDescription,
          schema: jsonSchema,
          strict: options.strict ?? true,
        },
      },
    });
  }

  private buildMessages(
    text: string,
    messages: LlmChatMessage[] = [],
  ): LocalLlmChatCompletionMessage[] {
    return [...messages, { role: 'user', content: text }];
  }

  private async createChatCompletion(
    payload: Omit<LocalLlmChatCompletionBody, 'model'>,
  ): Promise<LocalLlmChatCompletionResponse> {
    const config = this.getConfig();
    const baseUrl = config.baseUrl.replace(/\/$/, '');
    const body: LocalLlmChatCompletionBody = {
      model: config.model,
      ...payload,
    };
    const startedAt = performance.now();
    this.logger.log(`Local LLM request: ${JSON.stringify(body)}`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const durationMs = Math.round(performance.now() - startedAt);
      this.logger.error(
        `Local LLM request failed in ${durationMs}ms with status ${response.status}: ${errorBody}`,
      );

      throw new BadGatewayException(
        `Local LLM request failed with status ${response.status}: ${errorBody}`,
      );
    }

    const result = (await response.json()) as LocalLlmChatCompletionResponse;
    const durationMs = Math.round(performance.now() - startedAt);
    this.logger.log(
      `Local LLM response received in ${durationMs}ms; ${this.formatUsage(result)}`,
    );

    return result;
  }

  private async *createChatCompletionStream(
    payload: Omit<LocalLlmChatCompletionBody, 'model'>,
  ): AsyncIterable<string> {
    const config = this.getConfig();
    const baseUrl = config.baseUrl.replace(/\/$/, '');
    const body: LocalLlmChatCompletionBody = {
      model: config.model,
      ...payload,
    };
    const startedAt = performance.now();
    this.logger.log(`Local LLM stream request: ${JSON.stringify(body)}`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const durationMs = Math.round(performance.now() - startedAt);
      this.logger.error(
        `Local LLM stream request failed in ${durationMs}ms with status ${response.status}: ${errorBody}`,
      );

      throw new BadGatewayException(
        `Local LLM stream request failed with status ${response.status}: ${errorBody}`,
      );
    }

    if (!response.body) {
      throw new BadGatewayException(
        'Local LLM stream response did not include body',
      );
    }

    let buffer = '';
    let chunkCount = 0;

    for await (const chunk of response.body) {
      buffer += Buffer.from(chunk).toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const data = line.trim();

        if (!data.startsWith('data:')) {
          continue;
        }

        const event = data.slice('data:'.length).trim();

        if (event === '[DONE]') {
          const durationMs = Math.round(performance.now() - startedAt);
          this.logger.log(
            `Local LLM stream completed in ${durationMs}ms; chunks=${chunkCount}`,
          );
          return;
        }

        const parsed = JSON.parse(event) as LocalLlmChatCompletionStreamChunk;
        const content =
          parsed.choices?.[0]?.delta?.content ??
          parsed.choices?.[0]?.delta?.reasoning;

        if (typeof content === 'string') {
          chunkCount += 1;
          yield content;
        }

        if (parsed.usage) {
          this.logger.log(
            `Local LLM stream usage: tokens: prompt=${parsed.usage.prompt_tokens ?? 'unknown'}, completion=${parsed.usage.completion_tokens ?? 'unknown'}, total=${parsed.usage.total_tokens ?? 'unknown'}`,
          );
        }
      }
    }

    const durationMs = Math.round(performance.now() - startedAt);
    this.logger.log(
      `Local LLM stream ended in ${durationMs}ms; chunks=${chunkCount}`,
    );
  }

  private formatUsage(response: LocalLlmChatCompletionResponse): string {
    const usage = response.usage;

    if (!usage) {
      return 'tokens: unavailable';
    }

    return `tokens: prompt=${usage.prompt_tokens ?? 'unknown'}, completion=${usage.completion_tokens ?? 'unknown'}, total=${usage.total_tokens ?? 'unknown'}`;
  }

  private extractContent(response: LocalLlmChatCompletionResponse): string {
    const message = response.choices[0]?.message;
    const content = message?.content ?? message?.reasoning;

    if (typeof content !== 'string') {
      throw new BadGatewayException(
        'Local LLM response did not include content',
      );
    }

    return content;
  }
}
