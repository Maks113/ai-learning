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
  OpenaiChatCompletionResponse,
  OpenaiChatCompletionStreamChunk,
  OpenaiLlmConfig,
} from './types';

const OPENAI_CHAT_COMPLETIONS_URL =
  'https://api.openai.com/v1/chat/completions';

@Injectable()
export class OpenaiLlmService implements LlmProvider {
  private readonly logger = new Logger(OpenaiLlmService.name);

  constructor(private readonly configService: ConfigService) {}

  getConfig(): OpenaiLlmConfig {
    return {
      apiKey: this.configService.getOrThrow<string>('llm.openai.apiKey'),
      model: this.configService.getOrThrow<string>('llm.openai.model'),
    };
  }

  async generate(text: string, options: GenerateOptions = {}): Promise<string> {
    const response = await this.createChatCompletion({
      messages: this.buildMessages(text, options.messages),
      max_tokens: options.maxTokens,
      temperature: 0,
    });

    return this.extractContent(response);
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
      `OpenAI raw structured response: ${JSON.stringify(response)}`,
    );

    const content = this.extractContent(response);
    this.logger.log(`OpenAI structured content: ${content}`);

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
  ): LlmChatMessage[] {
    return [...messages, { role: 'user', content: text }];
  }

  private async createChatCompletion(
    payload: Record<string, unknown>,
  ): Promise<OpenaiChatCompletionResponse> {
    const config = this.getConfig();
    const body = {
      model: config.model,
      ...payload,
    };
    const startedAt = performance.now();
    this.logger.log(`OpenAI request: ${JSON.stringify(body)}`);

    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
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
        `OpenAI request failed in ${durationMs}ms with status ${response.status}: ${errorBody}`,
      );

      throw new BadGatewayException(
        `OpenAI request failed with status ${response.status}: ${errorBody}`,
      );
    }

    const result = (await response.json()) as OpenaiChatCompletionResponse;
    const durationMs = Math.round(performance.now() - startedAt);
    this.logger.log(
      `OpenAI response received in ${durationMs}ms; ${this.formatUsage(result)}`,
    );

    return result;
  }

  private async *createChatCompletionStream(
    payload: Record<string, unknown>,
  ): AsyncIterable<string> {
    const config = this.getConfig();
    const body = {
      model: config.model,
      ...payload,
    };
    const startedAt = performance.now();
    this.logger.log(`OpenAI stream request: ${JSON.stringify(body)}`);

    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
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
        `OpenAI stream request failed in ${durationMs}ms with status ${response.status}: ${errorBody}`,
      );

      throw new BadGatewayException(
        `OpenAI stream request failed with status ${response.status}: ${errorBody}`,
      );
    }

    if (!response.body) {
      throw new BadGatewayException(
        'OpenAI stream response did not include body',
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
            `OpenAI stream completed in ${durationMs}ms; chunks=${chunkCount}`,
          );
          return;
        }

        const parsed = JSON.parse(event) as OpenaiChatCompletionStreamChunk;
        const content = parsed.choices?.[0]?.delta?.content;

        if (typeof content === 'string') {
          chunkCount += 1;
          yield content;
        }

        if (parsed.usage) {
          this.logger.log(
            `OpenAI stream usage: tokens: prompt=${parsed.usage.prompt_tokens ?? 'unknown'}, completion=${parsed.usage.completion_tokens ?? 'unknown'}, total=${parsed.usage.total_tokens ?? 'unknown'}`,
          );
        }
      }
    }

    const durationMs = Math.round(performance.now() - startedAt);
    this.logger.log(
      `OpenAI stream ended in ${durationMs}ms; chunks=${chunkCount}`,
    );
  }

  private formatUsage(response: OpenaiChatCompletionResponse): string {
    const usage = response.usage;

    if (!usage) {
      return 'tokens: unavailable';
    }

    return `tokens: prompt=${usage.prompt_tokens ?? 'unknown'}, completion=${usage.completion_tokens ?? 'unknown'}, total=${usage.total_tokens ?? 'unknown'}`;
  }

  private extractContent(response: OpenaiChatCompletionResponse): string {
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new BadGatewayException('OpenAI response did not include content');
    }

    return content;
  }
}
