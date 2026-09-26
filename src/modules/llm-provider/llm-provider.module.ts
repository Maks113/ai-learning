import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_PROVIDER, type LlmProviderName } from '../../common/llm/types';
import { LocalLlmService } from '../../infrastructure/local-llm/local-llm.service';
import { OpenaiLlmService } from '../../infrastructure/openai-llm/openai-llm.service';

@Module({
  providers: [
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const providerName =
          configService.getOrThrow<LlmProviderName>('llm.provider');

        if (providerName === 'openai') {
          return new OpenaiLlmService(configService);
        }

        return new LocalLlmService(configService);
      },
    },
  ],
  exports: [LLM_PROVIDER],
})
export class LlmProviderModule {}
