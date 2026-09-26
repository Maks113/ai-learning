import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class UiController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getIndex(): string {
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ticket Analyzer</title>
    <style>
      :root {
        color-scheme: light;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
        background: #f6f7f9;
        color: #1f2937;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      main {
        width: min(100%, 920px);
        display: grid;
        gap: 18px;
      }

      .panel {
        background: #ffffff;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 10px 28px rgb(15 23 42 / 8%);
      }

      h1 {
        margin: 0 0 14px;
        font-size: 24px;
        line-height: 1.2;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
      }

      textarea {
        width: 100%;
        min-height: 180px;
        resize: vertical;
        border: 1px solid #c7d0dd;
        border-radius: 8px;
        padding: 12px;
        font: inherit;
        line-height: 1.5;
      }

      textarea:focus {
        outline: 3px solid #b8d4ff;
        border-color: #2563eb;
      }

      input[type="number"] {
        width: 120px;
        min-height: 40px;
        border: 1px solid #c7d0dd;
        border-radius: 8px;
        padding: 0 10px;
        font: inherit;
      }

      input[type="number"]:focus {
        outline: 3px solid #b8d4ff;
        border-color: #2563eb;
      }

      .actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 14px;
      }

      .switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        margin: 0;
        color: #374151;
        font-size: 14px;
        font-weight: 600;
      }

      .switch input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #2563eb;
      }

      button {
        border: 0;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        min-height: 40px;
        padding: 0 16px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      a.button {
        border-radius: 8px;
        background: #4b5563;
        color: white;
        min-height: 40px;
        padding: 0 16px;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        font: inherit;
        font-weight: 700;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }

      .status {
        min-height: 20px;
        font-size: 14px;
        color: #4b5563;
      }

      pre {
        min-height: 180px;
        margin: 0;
        overflow: auto;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        background: #111827;
        color: #e5e7eb;
        padding: 16px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <h1>Ticket Analyzer</h1>
        <form id="form">
          <label for="text">Ticket text</label>
          <textarea id="text" name="text" required placeholder="Paste support ticket text here"></textarea>
          <div class="actions">
            <button id="submit" type="submit">Analyze</button>
            <a class="button" href="/stream">Stream UI</a>
            <label class="switch" for="structured">
              <input id="structured" name="structured" type="checkbox" checked />
              Structured output
            </label>
            <label class="switch" for="maxTokens">
              Max tokens
              <input id="maxTokens" name="maxTokens" type="number" min="1" step="1" value="1536" placeholder="1536" />
            </label>
            <span id="status" class="status" aria-live="polite"></span>
          </div>
        </form>
      </section>

      <section class="panel">
        <h1>Result</h1>
        <pre id="result">{}</pre>
      </section>
    </main>

    <script>
      const form = document.querySelector('#form');
      const text = document.querySelector('#text');
      const structured = document.querySelector('#structured');
      const maxTokens = document.querySelector('#maxTokens');
      const submit = document.querySelector('#submit');
      const status = document.querySelector('#status');
      const result = document.querySelector('#result');

      const formatPayload = (payload) => {
        if (typeof payload === 'string') {
          try {
            return JSON.stringify(JSON.parse(payload), null, 2);
          } catch {
            return payload;
          }
        }

        return JSON.stringify(payload, null, 2);
      };

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        submit.disabled = true;
        status.textContent = 'Analyzing...';
        result.textContent = '{}';

        try {
          const endpoint = structured.checked
            ? '/tickets/analyze'
            : '/tickets/generate';
          const body = { text: text.value };

          if (maxTokens.value) {
            body.maxTokens = Number(maxTokens.value);
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          const contentType = response.headers.get('Content-Type') ?? '';
          const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

          result.textContent = formatPayload(payload);
          status.textContent = response.ok ? 'Done' : 'Request failed';
        } catch (error) {
          status.textContent = 'Network error';
          result.textContent = JSON.stringify(
            { message: error instanceof Error ? error.message : String(error) },
            null,
            2,
          );
        } finally {
          submit.disabled = false;
        }
      });
    </script>
  </body>
</html>`;
  }

  @Get('stream')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getStream(): string {
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ticket Structured Stream</title>
    <style>
      :root {
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
        background: #f6f7f9;
        color: #1f2937;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      main {
        width: min(100%, 920px);
        display: grid;
        gap: 18px;
      }

      .panel {
        background: #ffffff;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 10px 28px rgb(15 23 42 / 8%);
      }

      h1 {
        margin: 0 0 14px;
        font-size: 24px;
        line-height: 1.2;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
      }

      textarea {
        width: 100%;
        min-height: 180px;
        resize: vertical;
        border: 1px solid #c7d0dd;
        border-radius: 8px;
        padding: 12px;
        font: inherit;
        line-height: 1.5;
      }

      input[type="number"] {
        width: 120px;
        min-height: 40px;
        border: 1px solid #c7d0dd;
        border-radius: 8px;
        padding: 0 10px;
        font: inherit;
      }

      textarea:focus,
      input[type="number"]:focus {
        outline: 3px solid #b8d4ff;
        border-color: #2563eb;
      }

      .actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 14px;
      }

      .field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        margin: 0;
        color: #374151;
        font-size: 14px;
        font-weight: 600;
      }

      button,
      a.button {
        border: 0;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        min-height: 40px;
        padding: 0 16px;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      button.secondary {
        background: #4b5563;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }

      .status {
        min-height: 20px;
        font-size: 14px;
        color: #4b5563;
      }

      pre {
        min-height: 260px;
        margin: 0;
        overflow: auto;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        background: #111827;
        color: #e5e7eb;
        padding: 16px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <h1>Ticket Structured Stream</h1>
        <form id="form">
          <label for="text">Prompt</label>
          <textarea id="text" name="text" required placeholder="Paste support ticket text here"></textarea>
          <div class="actions">
            <button id="submit" type="submit">Stream</button>
            <button id="stop" class="secondary" type="button" disabled>Stop</button>
            <label class="field" for="maxTokens">
              Max tokens
              <input id="maxTokens" name="maxTokens" type="number" min="1" step="1" value="1536" placeholder="1536" />
            </label>
            <a class="button" href="/">Analyzer</a>
            <span id="status" class="status" aria-live="polite"></span>
          </div>
        </form>
      </section>

      <section class="panel">
        <h1>Stream result</h1>
        <pre id="result"></pre>
      </section>
    </main>

    <script>
      const form = document.querySelector('#form');
      const text = document.querySelector('#text');
      const maxTokens = document.querySelector('#maxTokens');
      const submit = document.querySelector('#submit');
      const stop = document.querySelector('#stop');
      const status = document.querySelector('#status');
      const result = document.querySelector('#result');
      let abortController = null;

      stop.addEventListener('click', () => {
        abortController?.abort();
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        abortController = new AbortController();
        submit.disabled = true;
        stop.disabled = false;
        status.textContent = 'Streaming...';
        result.textContent = '';

        const body = { text: text.value };

        if (maxTokens.value) {
          body.maxTokens = Number(maxTokens.value);
        }

        try {
          const response = await fetch('/tickets/analyze/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: abortController.signal,
          });

          if (!response.ok || !response.body) {
            result.textContent = await response.text();
            status.textContent = 'Request failed';
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            result.textContent += decoder.decode(value, { stream: true });
            result.scrollTop = result.scrollHeight;
          }

          result.textContent += decoder.decode();
          status.textContent = 'Done';
        } catch (error) {
          status.textContent =
            error instanceof DOMException && error.name === 'AbortError'
              ? 'Stopped'
              : 'Network error';
        } finally {
          submit.disabled = false;
          stop.disabled = true;
          abortController = null;
        }
      });
    </script>
  </body>
</html>`;
  }
}
