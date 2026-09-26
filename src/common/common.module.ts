import { Module } from '@nestjs/common';
import { EnvConfigModule } from './config/env-config.module';

@Module({
  imports: [EnvConfigModule],
  exports: [EnvConfigModule],
})
export class CommonModule {}
