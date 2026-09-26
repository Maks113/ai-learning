import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const inputPath = resolve('docs/support-ticket-test-phrases.md');
const outputPath =
  process.argv[2] ??
  resolve('docs/support-ticket-eval-qwen3-4b-mlx-6bit.json');
const endpoint =
  process.env.ANALYZE_ENDPOINT ?? 'http://localhost:3000/tickets/analyze';
const model = process.env.EVAL_MODEL ?? 'Qwen/Qwen3-4B-MLX-6bit';

const markdown = await readFile(inputPath, 'utf8');
const rows = markdown
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => /^\| \d+ \|/.test(line))
  .map((line) => {
    const cells = line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());

    return {
      id: Number(cells[0]),
      phrase: cells[1],
      expectedArea: cells[2],
    };
  });

const results = [];

for (const row of rows) {
  const startedAt = performance.now();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: row.phrase }),
    });
    const rawBody = await response.text();
    const latencyMs = Math.round(performance.now() - startedAt);
    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }

    results.push({
      ...row,
      ok: response.ok,
      status: response.status,
      latencyMs,
      response: body,
    });

    console.log(
      `${row.id.toString().padStart(2, '0')}/50 status=${response.status} latency=${latencyMs}ms`,
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startedAt);

    results.push({
      ...row,
      ok: false,
      status: null,
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    });

    console.log(
      `${row.id.toString().padStart(2, '0')}/50 request_error latency=${latencyMs}ms`,
    );
  }
}

const successful = results.filter((result) => result.ok).length;
const failed = results.length - successful;
const averageLatencyMs =
  results.length === 0
    ? 0
    : Math.round(
        results.reduce((sum, result) => sum + result.latencyMs, 0) /
          results.length,
      );

const report = {
  generatedAt: new Date().toISOString(),
  endpoint,
  model,
  source: inputPath,
  total: results.length,
  successful,
  failed,
  averageLatencyMs,
  results,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(
  `Done: ${successful}/${results.length} successful, avg latency ${averageLatencyMs}ms`,
);
console.log(`Report: ${outputPath}`);
