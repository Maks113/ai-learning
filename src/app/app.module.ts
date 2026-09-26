import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { CommonModule } from '../common/common.module';
import { LlmModule } from '../infrastructure/llm.module';
import { ApiModule } from '../modules/api/api.module';
import { UiModule } from '../modules/ui/ui.module';

@Module({
  imports: [CommonModule, ApiModule, LlmModule, UiModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
