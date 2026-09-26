# AI Learning

NestJS-приложение для анализа support tickets через LLM.

## Возможности

- UI на `/` для отправки текста тикета.
- `POST /tickets/analyze` - структурированный анализ тикета.
- `POST /tickets/generate` - сырой ответ выбранного LLM provider.
- Выбор LLM через `LLM_PROVIDER`: `local` или `openai`.
- Prompt artifacts хранятся в `src/modules/ticket-analyzer/prompts`.

## Запуск

```bash
npm install
npm run start:dev
```

UI будет доступен на:

```text
http://localhost:3000/
```

Локальная модель запускается отдельно:

```bash
cd local-model
./init.sh
./start.sh
```

## Проверки

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

## Схема

PlantUML-схема модулей: [docs/modules.puml](docs/modules.puml).
