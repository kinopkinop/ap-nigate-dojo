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
  assert.match(html, /602<small>語<\/small>/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps question data stable and fully grouped", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const termsBlock = page.slice(page.indexOf("const terms"), page.indexOf("type Progress"));
  const ids = [...termsBlock.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
  const groupsBlock = page.slice(page.indexOf("const confusionGroups"), page.indexOf("function textBigrams"));

  assert.equal(ids.length, 613);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok((termsBlock.match(/hardPrompt:/g) ?? []).length >= 30);
  for (const id of ["conceptual-schema", "internal-schema", "false-positive", "hot-standby", "cold-standby", "conceptual-design", "externalization", "initiating-process-group"]) {
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

test("preserves existing special assignments and keeps added vocabulary regular", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const termsBlock = page.slice(page.indexOf("const terms"), page.indexOf("type Progress"));
  const specialIds = ["mm1-queue", "mm1-system-time", "linear-search", "binary-search", "hash-search", "logic-not", "logic-xor", "logic-nand", "logic-nor", "sampling-theorem", "signal-frequency"];
  const actualSpecialIds = termsBlock.split("\n")
    .filter((line) => /collection: "special"/.test(line))
    .map((line) => line.match(/id: "([^"]+)"/)?.[1]);
  const regularIds = ["cpu", "osi-model", "authentication", "relational-database", "scrum", "wbs", "system-audit", "cloud-computing", "five-forces", "break-even-point", "copyright"];
  assert.deepEqual(actualSpecialIds, specialIds);
  for (const id of specialIds) assert.match(page, new RegExp(`id: "${id}"[^\\n]+collection: "special"`));
  for (const id of regularIds) {
    const line = termsBlock.split("\n").find((candidate) => candidate.includes(`id: "${id}"`)) ?? "";
    assert.ok(line, `missing regular term: ${id}`);
    assert.doesNotMatch(line, /collection: "special"/, `term should be regular: ${id}`);
  }
  assert.match(page, /id: "signal-frequency"[^\n]+周波数と周期は互いに逆数/);
  assert.match(page, /studyLabel: card\.studyPrompt \?\?/);
  assert.match(page, /const collectionStorageKey = "ap-study-collections-v1"/);
  assert.match(page, /function toggleCollection\(item: Term\)/);
  assert.match(page, /getCollection\(item, overrides\) === collection/);
});

test("adds broad AP vocabulary coverage without duplicate detail cards", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const termsBlock = page.slice(page.indexOf("const terms"), page.indexOf("type Progress"));
  const importantIds = [
    "binary-number", "set-theory", "big-o-constant", "stack", "quick-sort", "cpu", "virtual-memory", "raid5",
    "osi-model", "tcp", "dns", "waf", "authentication", "aes", "digital-certificate",
    "sql-injection", "zero-trust", "relational-database", "atomicity", "right-join",
    "requirements-definition", "scrum", "uml", "boundary-value-analysis", "wbs",
    "critical-path", "cost-performance-index", "service-desk", "system-audit", "internal-control", "dx", "saas",
    "machine-learning", "five-forces", "kgi", "break-even-point", "npv", "copyright",
    "subcontract-transaction-act", "rfc",
  ];
  for (const id of importantIds) assert.match(termsBlock, new RegExp(`id: "${id}"`), `missing important term: ${id}`);
  for (const id of ["product", "price", "place", "promotion", "ppm-star", "evm-cpi", "evm-spi"]) {
    assert.doesNotMatch(termsBlock, new RegExp(`id: "${id}"`), `duplicate detail card should not be added: ${id}`);
  }
});

test("splits overloaded cards and migrates their saved progress", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const termsBlock = page.slice(page.indexOf("const terms"), page.indexOf("type Progress"));
  const splitIds = ["replication", "sync-replication", "async-replication", "conceptual-design", "logical-design", "physical-design", "read-uncommitted", "read-committed", "repeatable-read", "serializable-isolation", "full-backup", "differential-backup", "incremental-backup", "marketing-4p-4c", "marketing-4c", "memory-first-fit", "memory-best-fit", "memory-worst-fit"];

  for (const id of splitIds) assert.match(termsBlock, new RegExp(`id: "${id}"`), `missing split term: ${id}`);
  assert.doesNotMatch(termsBlock, /id: "index-tradeoff"/);
  assert.match(page, /"index-tradeoff": "database-index"/);
  assert.match(page, /"sync-replication": \["async-replication"\]/);
  assert.match(page, /"conceptual-design": \["logical-design", "physical-design"\]/);
  assert.match(page, /"read-uncommitted": \["read-committed"\]/);
  assert.match(page, /"repeatable-read": \["serializable-isolation"\]/);
  assert.match(page, /"full-backup": \["differential-backup", "incremental-backup"\]/);
  assert.match(page, /"marketing-4p-4c": \["marketing-4c"\]/);
  assert.match(page, /"memory-first-fit": \["memory-best-fit", "memory-worst-fit"\]/);
  assert.match(page, /function migrateProgressRecords/);
  assert.match(page, /function migrateQuestionStats/);
  assert.match(page, /function migrateCollectionOverrides/);
  assert.match(page, /function migrateDisabledIds/);
  assert.match(page, /retention: Math\.min\(recordRetention\(target\), recordRetention\(source\)\)/);
});

test("keeps every answer concise and every hint from revealing the exact term", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const termsBlock = page.slice(page.indexOf("const terms"), page.indexOf("type Progress"));
  const termLines = termsBlock.split("\n").filter((line) => /^\s*\{ id: /.test(line));

  for (const line of termLines) {
    const id = line.match(/id: "([^"]+)"/)?.[1] ?? "unknown";
    const term = line.match(/term: "([^"]+)"/)?.[1] ?? "";
    const hint = line.match(/hint: "([^"]*)"/)?.[1] ?? "";
    const answer = line.match(/answer: "([^"]*)"/)?.[1] ?? "";
    assert.ok(answer, `answer is missing: ${id}`);
    assert.ok(answer.length <= 90, `answer is too long: ${id} (${answer.length})`);
    assert.ok((answer.match(/。/g) ?? []).length <= 2, `answer has more than two sentences: ${id}`);
    assert.ok(!hint.toLocaleUpperCase().includes(term.toLocaleUpperCase()), `hint reveals its term: ${id}`);
  }
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
  assert.match(mobileCss, /\.hint \{ padding: 8px 14px;/);
  assert.match(mobileCss, /\.flashcard\.revealed \.answerSide \{[^}]*padding-top: 12px;[^}]*animation: none;/);
  assert.match(mobileCss, /\.flashcard\.revealed \.answerButtons \{[^}]*position: fixed;/);
  assert.match(mobileCss, /bottom: 0;/);
  assert.match(mobileCss, /env\(safe-area-inset-bottom\)/);
  assert.match(mobileCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
});
