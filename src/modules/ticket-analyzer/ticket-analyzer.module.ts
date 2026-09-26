import { Module } from '@nestjs/common';
import { LlmProviderModule } from '../llm-provider/llm-provider.module';
import { PromptOutputValidatorService } from './prompt-output-validator.service';
import { PromptRegistryService } from './prompt-registry.service';
import { TicketAnalyzerService } from './ticket-analyzer.service';

@Module({
  imports: [LlmProviderModule],
  providers: [
    PromptOutputValidatorService,
    PromptRegistryService,
    TicketAnalyzerService,
  ],
  exports: [TicketAnalyzerService],
})
export class TicketAnalyzerModule {}
