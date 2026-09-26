import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LLM_PROVIDER, type LlmProvider } from './../src/common/llm/types';
import { AppModule } from './../src/app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const llmProviderMock: LlmProvider = {
    generate: jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: 'raw response',
          },
        },
      ],
    }),
    streamGenerate: jest.fn(),
    streamStructuredGenerate: jest.fn(),
    structuredGenerate: jest.fn().mockResolvedValue({
      category: 'other',
      priority: 'low',
      summary: '',
      language: '',
      requiresHuman: false,
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LLM_PROVIDER)
      .useValue(llmProviderMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) renders UI', () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    return request(httpServer)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect((response) => {
        expect(response.text).toContain('Ticket Analyzer');
        expect(response.text).toContain("'/tickets/analyze'");
        expect(response.text).toContain("'/tickets/generate'");
        expect(response.text).toContain('id="structured"');
        expect(response.text).toContain('href="/stream"');
      });
  });

  it('/stream (GET) renders streaming UI', () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    return request(httpServer)
      .get('/stream')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect((response) => {
        expect(response.text).toContain('Ticket Structured Stream');
        expect(response.text).toContain("fetch('/tickets/analyze/stream'");
      });
  });

  it('/tickets/analyze (POST)', () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    return request(httpServer)
      .post('/tickets/analyze')
      .send({ text: 'I cannot log in to my account.' })
      .expect(201)
      .expect({
        category: 'other',
        priority: 'low',
        summary: '',
        language: '',
        requiresHuman: false,
      });
  });

  it('/tickets/analyze (POST) rejects empty text', () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    return request(httpServer)
      .post('/tickets/analyze')
      .send({ text: '' })
      .expect(400);
  });

  it('/tickets/analyze (POST) rejects unknown fields', () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    return request(httpServer)
      .post('/tickets/analyze')
      .send({ text: 'Need help', extra: true })
      .expect(400);
  });
});
