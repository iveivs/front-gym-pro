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
  assert.match(html, /Системное повторение фронтенда/);
  assert.match(html, /1080<!-- --> модулей/);
  assert.match(html, /10800<!-- --> вопросов/);
  assert.match(html, /3286<!-- --> задач/);
  assert.doesNotMatch(html, /Доки|каталогу Доки|масштаба Доки/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton|Your site is taking shape/i);
});

test("product content is wired into the app", async () => {
  const [page, content, dokaCatalog, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dokaReferenceSeeds.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /frontGymProProgress/);
  assert.match(page, /Начать тренировку/);
  assert.match(page, /Копировать задачу/);
  assert.match(page, /visibleTopicGroups/);
  assert.match(page, /topicGroupHeader/);
  assert.match(content, /Замыкания, область видимости/);
  assert.match(content, /Event loop, Promise/);
  assert.match(content, /Семантика, формы/);
  assert.match(content, /Рендер, состояние/);
  assert.match(content, /RegExp, парсинг строк/);
  assert.match(content, /Браузерный рендеринг/);
  assert.match(content, /CSS Grid глубже/);
  assert.match(content, /Suspense, lazy/);
  assert.match(content, /dokaReferenceTopics/);
  assert.match(content, /makeDokaReferenceTopic/);
  assert.match(content, /Материал написан своими словами/);
  assert.match(content, /авторский Pro-конспект с рабочим примером/);
  assert.match(content, /CSS: раскладки/);
  assert.match(content, /JS: массивы/);
  assert.match(dokaCatalog, /doka-guide\/content/);
  assert.match(dokaCatalog, /Counts: html: 136, css: 335, js: 244, a11y: 163, tools: 90, recipes: 44/);
  assert.match(layout, /lang="ru"/);
  assert.match(layout, /Front Gym Pro - платформа подготовки фронтендера/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
