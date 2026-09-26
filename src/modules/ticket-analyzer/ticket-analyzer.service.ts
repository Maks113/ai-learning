import { Inject, Injectable, Logger } from '@nestjs/common';
import { LLM_PROVIDER, type LlmProvider } from '../../common/llm/types';
import type { TicketAnalysis } from '../api/types';
import { PromptOutputValidatorService } from './prompt-output-validator.service';
import { PromptRegistryService } from './prompt-registry.service';

@Injectable()
export class TicketAnalyzerService {
  private readonly logger = new Logger(TicketAnalyzerService.name);

  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
    private readonly promptRegistryService: PromptRegistryService,
    private readonly promptOutputValidatorService: PromptOutputValidatorService,
  ) {}

  async analyze(text: string): Promise<TicketAnalysis> {
    const artifact = await this.promptRegistryService.getAnalyzeTicketPrompt();
    const output = await this.llmProvider.structuredGenerate<TicketAnalysis>(
      `${artifact.prompt}\n\n${text}`,
      artifact.schema,
      {
        schemaName: artifact.metadata.schemaName,
        schemaDescription: artifact.metadata.description,
        maxTokens: artifact.metadata.maxTokens,
      },
    );
    this.logger.log(
      `LLM structured output before validation: ${JSON.stringify(output)}`,
    );

    return this.promptOutputValidatorService.validate<TicketAnalysis>(
      artifact.schema,
      output,
    );
  }

  async streamAnalyze(text: string): Promise<AsyncIterable<string>> {
    const artifact = await this.promptRegistryService.getAnalyzeTicketPrompt();

    return this.llmProvider.streamStructuredGenerate(
      `${artifact.prompt}\n\n${text}`,
      artifact.schema,
      {
        schemaName: artifact.metadata.schemaName,
        schemaDescription: artifact.metadata.description,
        maxTokens: artifact.metadata.maxTokens,
      },
    );
  }
}
