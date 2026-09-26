#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

source .venv/bin/activate

#MODEL="${LOCAL_LLM_MODEL:-mlx-community/Qwen3.5-4B-MLX-4bit}"
#MODEL="${LOCAL_LLM_MODEL:-mlx-community/Qwen3.5-9B-MLX-4bit}"
MODEL="${LOCAL_LLM_MODEL:-Qwen/Qwen3-4B-MLX-6bit}"
HOST="${LOCAL_LLM_HOST:-127.0.0.1}"
PORT="${LOCAL_LLM_PORT:-8080}"

python -m mlx_lm.server \
  --model "$MODEL" \
  --host "$HOST" \
  --port "$PORT" \
  --chat-template-args '{"enable_thinking":true}'
