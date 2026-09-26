import { Module } from '@nestjs/common';
import { LlmProviderModule } from '../llm-provider/llm-provider.module';
import { TicketAnalyzerModule } from '../ticket-analyzer/ticket-analyzer.module';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [LlmProviderModule, TicketAnalyzerModule],
  controllers: [TicketsController],
})
export class ApiModule {}
