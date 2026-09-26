# Support ticket eval summary

Сводка по прогонам набора из 50 обращений в `POST /tickets/analyze`.

Источник тестовых фраз: [support-ticket-test-phrases.md](support-ticket-test-phrases.md).

## Runs

| Model | Generated at | Successful | Failed | Avg latency | Priority distribution | Comment |
|---|---:|---:|---:|---:|---|---|
| `Qwen/Qwen3-4B-MLX-6bit` | 2026-09-24T12:50:42.958Z | 50 | 0 | 1857ms | high: 35, medium: 11, critical: 4, low: 0 | Быстрее второго прогона и стабильно держит JSON-схему. Слишком агрессивно ставит `requiresHuman: true` во всех 50 случаях и часто выбирает `technical`. |
| `mlx-community/Qwen3.5-4B-MLX-4bit` | 2026-09-24T13:06:04.511Z | 50 | 0 | 2125ms | high: 31, medium: 10, critical: 3, low: 6 | Медленнее первого прогона, но более разнообразно выставляет приоритеты и `requiresHuman`. Есть заметный дефект: summary часто выходит на английском даже для русских обращений. |
| `mlx-community/Qwen3.5-9B-MLX-4bit` | 2026-09-24T13:12:41.623Z | 50 | 0 | 3439ms | high: 26, medium: 14, critical: 3, low: 7 | Самый медленный из трех прогонов. Схему держит стабильно, приоритеты распределяет мягче, но `requiresHuman` почти всегда `true`; summary для русских обращений также часто выходит на английском. |
| `Qwen/Qwen3-4B-MLX-6bit-thinking` | 2026-09-24T13:30:38.918Z | 49 | 1 | 12818ms | high: 18, medium: 22, critical: 8, low: 1, failed: 1 | Thinking резко увеличил latency и дал один schema failure: в кейсе 48 модель вернула `lang` вместо обязательного `language`. Summary чаще остается на языке обращения, но стабильность схемы стала хуже. |

## Category Distribution

| Model | account | billing | technical | general | other | failed |
|---|---:|---:|---:|---:|---:|---:|
| `Qwen/Qwen3-4B-MLX-6bit` | 11 | 7 | 31 | 1 | 0 | 0 |
| `mlx-community/Qwen3.5-4B-MLX-4bit` | 16 | 8 | 25 | 0 | 1 | 0 |
| `mlx-community/Qwen3.5-9B-MLX-4bit` | 16 | 10 | 23 | 0 | 1 | 0 |
| `Qwen/Qwen3-4B-MLX-6bit-thinking` | 15 | 8 | 25 | 0 | 1 | 1 |

## Requires Human

| Model | true | false | failed |
|---|---:|---:|---:|
| `Qwen/Qwen3-4B-MLX-6bit` | 50 | 0 | 0 |
| `mlx-community/Qwen3.5-4B-MLX-4bit` | 37 | 13 | 0 |
| `mlx-community/Qwen3.5-9B-MLX-4bit` | 47 | 3 | 0 |
| `Qwen/Qwen3-4B-MLX-6bit-thinking` | 39 | 10 | 1 |

## Report Files

- [support-ticket-eval-qwen3-4b-mlx-6bit.json](support-ticket-eval-qwen3-4b-mlx-6bit.json)
- [support-ticket-eval-qwen3.5-4b-mlx-4bit.json](support-ticket-eval-qwen3.5-4b-mlx-4bit.json)
- [support-ticket-eval-qwen3.5-9b-mlx-4bit.json](support-ticket-eval-qwen3.5-9b-mlx-4bit.json)
- [support-ticket-eval-qwen3-4b-mlx-6bit-thinking.json](support-ticket-eval-qwen3-4b-mlx-6bit-thinking.json)
