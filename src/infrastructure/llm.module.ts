import { Module } from '@nestjs/common';
import { LlmProviderModule } from '../modules/llm-provider/llm-provider.module';

@Module({
  imports: [LlmProviderModule],
  exports: [LlmProviderModule],
})
export class LlmModule {}
