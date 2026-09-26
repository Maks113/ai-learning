export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export type JsonSchema = Record<string, unknown>;

export interface LlmChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  messages?: LlmChatMessage[];
  maxTokens?: number;
}

export interface StructuredGenerateOptions extends GenerateOptions {
  schemaName?: string;
  schemaDescription?: string;
  strict?: boolean;
}

export interface LlmProvider {
  generate(text: string, options?: GenerateOptions): Promise<unknown>;

  streamGenerate(
    text: string,
    options?: GenerateOptions,
  ): AsyncIterable<string>;

  structuredGenerate<TResponse = unknown>(
    text: string,
    jsonSchema: JsonSchema,
    options?: StructuredGenerateOptions,
  ): Promise<TResponse>;

  streamStructuredGenerate(
    text: string,
    jsonSchema: JsonSchema,
    options?: StructuredGenerateOptions,
  ): AsyncIterable<string>;
}

export type LlmProviderName = 'local' | 'openai';
