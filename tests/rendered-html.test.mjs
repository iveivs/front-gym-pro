import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders Front Gym Pro shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Front Gym Pro/);
  assert.match(html, /платформа подготовки фронтендера/);
  assert.match(html, /Учебник, тренажёр, интервью-база/);
  assert.match(html, /68<!-- --> модулей/);
  assert.match(html, /680<!-- --> вопросов/);
  assert.match(html, /130<!-- --> задач/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton|Your site is taking shape/i);
});

test("product content is wired into the app", async () => {
  const [page, content, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /frontGymProProgress/);
  assert.match(page, /Начать тренировку/);
  assert.match(page, /Копировать задачу/);
  assert.match(content, /Замыкания, область видимости/);
  assert.match(content, /Event loop, Promise/);
  assert.match(content, /Семантика, формы/);
  assert.match(content, /Рендер, состояние/);
  assert.match(content, /RegExp, парсинг строк/);
  assert.match(content, /Браузерный рендеринг/);
  assert.match(content, /CSS Grid глубже/);
  assert.match(content, /Suspense, lazy/);
  assert.equal(content.match(/id: "(?:js|css|html|react)-/g)?.length, 68);
  assert.match(layout, /lang="ru"/);
  assert.match(layout, /Front Gym Pro - платформа подготовки фронтендера/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
