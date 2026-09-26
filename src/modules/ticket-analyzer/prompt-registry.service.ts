import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  PromptArtifact,
  PromptArtifactMetadata,
} from './prompt-artifact.types';

@Injectable()
export class PromptRegistryService {
  async getAnalyzeTicketPrompt(): Promise<PromptArtifact> {
    return this.loadPromptArtifact('analyze-ticket');
  }

  private async loadPromptArtifact(name: string): Promise<PromptArtifact> {
    const basePath = join(
      process.cwd(),
      'src',
      'modules',
      'ticket-analyzer',
      'prompts',
      name,
    );

    const [prompt, schemaContent, metadataContent] = await Promise.all([
      readFile(join(basePath, 'prompt.md'), 'utf8'),
      readFile(join(basePath, 'schema.json'), 'utf8'),
      readFile(join(basePath, 'metadata.json'), 'utf8'),
    ]);

    return {
      prompt: prompt.trim(),
      schema: JSON.parse(schemaContent) as Record<string, unknown>,
      metadata: JSON.parse(metadataContent) as PromptArtifactMetadata,
    };
  }
}
