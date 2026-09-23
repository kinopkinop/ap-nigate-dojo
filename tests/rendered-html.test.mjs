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

  assert.equal(ids.length, 227);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok((termsBlock.match(/hardPrompt:/g) ?? []).length >= 30);
  for (const id of ["conceptual-schema", "internal-schema", "false-positive", "hot-standby", "cold-standby", "initiating-process-group", "executing-process-group", "closing-process-group"]) {
    assert.ok(ids.includes(id), `missing term: ${id}`);
  }
  for (const id of ids) assert.match(groupsBlock, new RegExp(`"${id}"`), `term has no confusion group: ${id}`);
});

test("opens the weak-only mode from the same all-category pool used by its count", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const weakButtonStart = page.indexOf('<button className={mode === "weak"');
  const weakButtonEnd = page.indexOf("</button>", weakButtonStart);
  const weakButton = page.slice(weakButtonStart, weakButtonEnd);

  assert.ok(weakButtonStart >= 0, "weak-only navigation button is missing");
  assert.match(weakButton, /setCategory\("すべて"\)/);
  assert.match(weakButton, /buildRound\("すべて", progress, weakIds, false, false, true, collectionOverrides, "regular", disabledIds\)/);
});

test("new terms start in the special collection and can be moved individually", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const specialIds = ["tuckman-model", "mes", "scala-language", "delphi-method", "brainstorming", "feasibility-study", "reverse-proxy", "marketing-4p-4c", "immersion-cooling", "iot", "soa", "mm1-queue", "mm1-utilization", "mm1-system-time", "mm1-service-time", "linear-search", "binary-search", "hash-search", "parity-check", "crc-error-check", "hamming-code", "logic-not", "logic-xor", "logic-nand", "logic-nor", "roc-curve", "sampling-theorem", "signal-frequency", "signal-period", "memory-first-fit", "memory-best-fit", "memory-worst-fit"];
  for (const id of specialIds) assert.match(page, new RegExp(`id: "${id}"[^\\n]+collection: "special"`));
  assert.match(page, /id: "signal-frequency"[^\n]+studyPrompt: "周期0\.02秒/);
  assert.match(page, /id: "memory-best-fit"[^\n]+studyPrompt: "空き250・200・400KB/);
  assert.match(page, /studyLabel: card\.studyPrompt \?\?/);
  assert.match(page, /const collectionStorageKey = "ap-study-collections-v1"/);
  assert.match(page, /function toggleCollection\(item: Term\)/);
  assert.match(page, /getCollection\(item, overrides\) === collection/);
});

test("paused questions stay out of rounds and choices, with settings in backups", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /const disabledStorageKey = "ap-study-disabled-ids-v1"/);
  assert.match(page, /const backupKeys = \[[^\n]+disabledStorageKey/);
  assert.match(page, /function toggleDisabled\(item: Term\)/);
  assert.match(page, /!disabledIds\.includes\(item\.id\)/);
  assert.match(page, /getChoices\(card, questionDifficulty, disabledIds\)/);
  assert.match(page, /collectionFilter === "disabled"/);
  for (const line of page.split("\n").filter((line) => line.includes("buildRound(") && !line.includes("function buildRound("))) {
    assert.match(line, /(?:disabledIds|savedDisabledIds|nextDisabledIds)/, `round ignores paused questions: ${line}`);
  }
});

test("does not mask an abbreviation inside its English formal name", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const helperStart = page.indexOf("function maskAnswerTerm");
  const helperEnd = page.indexOf("function getRetention", helperStart);
  const helperSource = page.slice(helperStart, helperEnd)
    .replace("function maskAnswerTerm(text: string, card: Term)", "function maskAnswerTerm(text, card)");
  const maskAnswerTerm = Function(`${helperSource}\nreturn maskAnswerTerm;`)();

  assert.equal(
    maskAnswerTerm("Enterprise Resource Planning。会計・人事・生産・販売などを統合管理する仕組み。", { term: "ERP" }),
    "会計・人事・生産・販売などを統合管理する仕組み。",
  );
  assert.equal(maskAnswerTerm("ERPは企業全体を統合管理する。", { term: "ERP" }), "この用語は企業全体を統合管理する。");
});

test("keeps the revealed answer actions reachable on a phone", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const mobileStart = css.indexOf("@media (max-width: 520px)");
  const mobileCss = css.slice(mobileStart, css.indexOf("@media (prefers-reduced-motion", mobileStart));

  assert.ok(mobileStart >= 0, "phone breakpoint is missing");
  assert.match(mobileCss, /\.flashcard\.revealed \.answerButtons \{[^}]*position: fixed;/);
  assert.match(mobileCss, /bottom: 0;/);
  assert.match(mobileCss, /env\(safe-area-inset-bottom\)/);
  assert.match(mobileCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
});
