# Local model

This directory contains scripts for running a local LLM on macOS.

The setup uses `mlx-lm`, so it is intended primarily for Apple Silicon Macs.
The server is started in OpenAI-compatible mode and is expected to be available
at `http://localhost:8080/v1`.

For Qwen-style reasoning models, `start.sh` disables explicit thinking output
with `--chat-template-args '{"enable_thinking":false}'` to reduce latency and
token usage.

## Init

```bash
./init.sh
```

The script runs:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Start

```bash
./start.sh
```

By default it starts:

```text
mlx-community/Qwen3.5-9B-MLX-4bit
```

You can override the model:

```bash
LOCAL_LLM_MODEL="your-model" ./start.sh
```
