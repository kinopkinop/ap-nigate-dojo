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

test("server-renders the AP study tool", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>AP 苦手だけ道場｜応用情報の復習ツール<\/title>/i);
  assert.match(html, /応用情報/);
  assert.match(html, /用語チェック/);
  assert.match(html, /4択クイズ/);
  assert.match(html, /195<small>語<\/small>/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps question data stable and fully grouped", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const termsBlock = page.slice(page.indexOf("const terms"), page.indexOf("type Progress"));
  const ids = [...termsBlock.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
  const groupsBlock = page.slice(page.indexOf("const confusionGroups"), page.indexOf("function textBigrams"));

  assert.equal(ids.length, 195);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok((termsBlock.match(/hardPrompt:/g) ?? []).length >= 30);
  for (const id of ["conceptual-schema", "internal-schema", "false-positive", "hot-standby", "cold-standby", "initiating-process-group", "executing-process-group", "closing-process-group"]) {
    assert.ok(ids.includes(id), `missing term: ${id}`);
  }
  for (const id of ids) assert.match(groupsBlock, new RegExp(`"${id}"`), `term has no confusion group: ${id}`);
});
