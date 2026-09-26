import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class AnalyzeTicketDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  maxTokens?: number;
}
