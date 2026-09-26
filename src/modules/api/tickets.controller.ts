import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LLM_PROVIDER, type LlmProvider } from '../../common/llm/types';
import { TicketAnalyzerService } from '../ticket-analyzer/ticket-analyzer.service';
import { AnalyzeTicketDto } from './dto/analyze-ticket.dto';
import type { TicketAnalysis } from './types';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketAnalyzerService: TicketAnalyzerService,
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {}

  @Post('analyze')
  analyze(@Body() body: AnalyzeTicketDto): Promise<TicketAnalysis> {
    return this.ticketAnalyzerService.analyze(body.text);
  }

  @Post('generate')
  generate(@Body() body: AnalyzeTicketDto): Promise<unknown> {
    return this.llmProvider.generate(body.text, {
      maxTokens: body.maxTokens,
    });
  }

  @Post('generate/stream')
  async streamGenerate(
    @Body() body: AnalyzeTicketDto,
    @Res() response: Response,
  ): Promise<void> {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders();

    try {
      for await (const chunk of this.llmProvider.streamGenerate(body.text, {
        maxTokens: body.maxTokens,
      })) {
        response.write(chunk);
      }

      response.end();
    } catch (error) {
      if (!response.headersSent) {
        response.status(502);
      }

      response.write(
        `\n\n[stream error] ${error instanceof Error ? error.message : String(error)}`,
      );
      response.end();
    }
  }

  @Post('analyze/stream')
  async streamAnalyze(
    @Body() body: AnalyzeTicketDto,
    @Res() response: Response,
  ): Promise<void> {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders();

    try {
      const stream = await this.ticketAnalyzerService.streamAnalyze(body.text);

      for await (const chunk of stream) {
        response.write(chunk);
      }

      response.end();
    } catch (error) {
      if (!response.headersSent) {
        response.status(502);
      }

      response.write(
        `\n\n{"error":"${error instanceof Error ? error.message : String(error)}"}`,
      );
      response.end();
    }
  }
}
