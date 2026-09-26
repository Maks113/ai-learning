import type { LlmProvider } from '../../common/llm/types';
import { BadGatewayException } from '@nestjs/common';
import { TicketCategory, TicketPriority } from '../api/enums';
import type { TicketAnalysis } from '../api/types';
import type { PromptArtifact } from './prompt-artifact.types';
import { PromptOutputValidatorService } from './prompt-output-validator.service';
import type { PromptRegistryService } from './prompt-registry.service';
import { TicketAnalyzerService } from './ticket-analyzer.service';

describe('TicketAnalyzerService', () => {
  const artifact: PromptArtifact = {
    prompt: 'Analyze ticket',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'category',
        'priority',
        'summary',
        'language',
        'requiresHuman',
      ],
      properties: {
        category: {
          type: 'string',
          enum: ['general', 'billing', 'technical', 'account', 'other'],
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
        },
        summary: { type: 'string' },
        language: { type: 'string' },
        requiresHuman: { type: 'boolean' },
      },
    },
    metadata: {
      name: 'ticket_analysis',
      version: '1.0.0',
      description: 'Analyze support ticket.',
      schemaName: 'ticket_analysis',
      maxTokens: 3000,
    },
  };

  let llmProvider: jest.Mocked<LlmProvider>;
  let service: TicketAnalyzerService;

  beforeEach(() => {
    llmProvider = {
      generate: jest.fn(),
      streamGenerate: jest.fn(),
      structuredGenerate: jest.fn(),
      streamStructuredGenerate: jest.fn(),
    };

    const promptRegistryService = {
      getAnalyzeTicketPrompt: jest.fn().mockResolvedValue(artifact),
    } as unknown as PromptRegistryService;

    service = new TicketAnalyzerService(
      llmProvider,
      promptRegistryService,
      new PromptOutputValidatorService(),
    );
  });

  it('returns valid response', async () => {
    const validResponse: TicketAnalysis = {
      category: TicketCategory.Technical,
      priority: TicketPriority.High,
      summary: 'User cannot log in.',
      language: 'en',
      requiresHuman: true,
    };

    llmProvider.structuredGenerate.mockResolvedValue(validResponse);

    await expect(service.analyze('I cannot log in.')).resolves.toEqual(
      validResponse,
    );
    expect(llmProvider.structuredGenerate.mock.calls[0]).toEqual([
      'Analyze ticket\n\nI cannot log in.',
      artifact.schema,
      {
        schemaName: 'ticket_analysis',
        schemaDescription: 'Analyze support ticket.',
        maxTokens: 3000,
      },
    ]);
  });

  it('throws for invalid JSON/schema response', async () => {
    llmProvider.structuredGenerate.mockResolvedValue('not-json');

    await expect(service.analyze('Broken response')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('throws for unknown category', async () => {
    llmProvider.structuredGenerate.mockResolvedValue({
      category: 'shipping',
      priority: 'low',
      summary: 'Question about delivery.',
      language: 'en',
      requiresHuman: false,
    });

    await expect(service.analyze('Where is my order?')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('throws for missing field', async () => {
    llmProvider.structuredGenerate.mockResolvedValue({
      category: 'billing',
      priority: 'medium',
      summary: 'Invoice question.',
      language: 'en',
    });

    await expect(service.analyze('I need my invoice.')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('throws for provider timeout', async () => {
    const error = new Error('Provider timeout');

    llmProvider.structuredGenerate.mockRejectedValue(error);

    await expect(service.analyze('Long ticket')).rejects.toThrow(error);
  });

  it('throws for provider exception', async () => {
    const error = new Error('Provider failed');

    llmProvider.structuredGenerate.mockRejectedValue(error);

    await expect(service.analyze('Any ticket')).rejects.toThrow(error);
  });
});
