export interface LocalLlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface LocalLlmChatCompletionMessage {
  /** Роль сообщения в диалоге. */
  role: 'system' | 'user' | 'assistant';

  /** Текстовое содержимое сообщения. */
  content: string;
}

export interface LocalLlmJsonSchemaResponseFormat {
  /** Тип формата ответа: структурированный JSON по JSON Schema. */
  type: 'json_schema';

  /** Настройки JSON Schema, которой должен соответствовать ответ модели. */
  json_schema: {
    /** Имя схемы, используется провайдером как идентификатор формата ответа. */
    name: string;

    /** Описание назначения схемы для модели. */
    description?: string;

    /** JSON Schema, описывающая ожидаемую структуру ответа. */
    schema: Record<string, unknown>;

    /** Требовать строгого соответствия ответа переданной схеме. */
    strict: boolean;
  };
}

export interface LocalLlmChatCompletionBody {
  /** Идентификатор локальной модели, которую нужно использовать для генерации. */
  model: string;

  /** История сообщений, отправляемая в OpenAI-compatible chat completions endpoint. */
  messages: LocalLlmChatCompletionMessage[];

  /** Максимальное количество токенов, которое модель может сгенерировать в ответе. */
  max_tokens?: number;

  /** Температура генерации: чем ниже, тем стабильнее и короче ответ. */
  temperature?: number;

  /** Включить потоковую отдачу ответа по OpenAI-compatible SSE протоколу. */
  stream?: boolean;

  /** Формат, в котором модель должна вернуть ответ. */
  response_format?: LocalLlmJsonSchemaResponseFormat;
}

export interface LocalLlmChatCompletionResponse {
  choices: Array<{
    message?: {
      content?: string | null;
      reasoning?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface LocalLlmChatCompletionStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string | null;
      reasoning?: string | null;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
}
