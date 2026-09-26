import type { JsonSchema } from '../../common/llm/types';

export interface PromptArtifactMetadata {
  name: string;
  version: string;
  description?: string;
  schemaName: string;
  maxTokens?: number;
}

export interface PromptArtifact {
  prompt: string;
  schema: JsonSchema;
  metadata: PromptArtifactMetadata;
}
