import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

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
  assert.match(html, /道場を切り替える/);
  assert.match(html, /602<small>語<\/small>/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps the understanding-dojo question set structured and scenario based", async () => {
  const data = await readFile(new URL("../app/understandingQuestions.ts", import.meta.url), "utf8");
  const component = await readFile(new URL("../app/UnderstandingDojo.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const designGuide = await readFile(new URL("../docs/understanding-question-design.md", import.meta.url), "utf8");
  const ids = [...data.matchAll(/\n\s+id: "([^"]+)"/g)].map((match) => match[1]);
  const followUpPromptFor = (id) => {
    const questionStart = data.indexOf(`id: "${id}"`);
    const followUpStart = data.indexOf("followUp: {", questionStart);
    const promptStart = data.indexOf("situation:", followUpStart);
    const promptEnd = data.indexOf("correctIndex:", promptStart);
    return data.slice(promptStart, promptEnd);
  };
  const sourceFile = ts.createSourceFile("understandingQuestions.ts", data, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const property = (object, name) => object.properties.find((item) => ts.isPropertyAssignment(item) && item.name.getText(sourceFile) === name)?.initializer;
  const textValue = (node) => node && ts.isStringLiteral(node) ? node.text : "";
  const textArray = (node) => node && ts.isArrayLiteralExpression(node) ? node.elements.map(textValue) : [];
  let questionArray;
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText(sourceFile) === "understandingQuestions" && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) questionArray = declaration.initializer;
    }
  });

  assert.deepEqual(ids, [
    "web-defense-waf",
    "transaction-non-repeatable-read",
    "evm-schedule-cost-status",
    "crypto-recipient-key-application",
    "digital-signature-authenticity-integrity",
    "certificate-ca-identity-binding",
    "web-attack-xss-identification",
    "password-hash-salt-storage",
    "dmz-public-server-isolation",
    "vpn-remote-access-tunnel",
    "normalization-update-anomaly",
    "join-customer-orders",
    "lock-deadlock-prevention",
    "index-bplus-range-search",
    "napt-shared-global-address",
    "dns-name-to-ip-resolution",
    "subnet-smallest-prefix",
    "rto-rpo-recovery-requirements",
    "backup-incremental-restore-chain",
    "availability-mtbf-mttr",
    "critical-path-project-duration",
    "mes-factory-progress-control",
    "marketing-4p-place-to-4c",
    "authn-authz-access-control",
    "mfa-independent-factors",
    "sql-injection-placeholder",
    "csrf-token-validation",
    "directory-traversal-path-control",
    "ids-ips-automatic-block",
    "tcp-udp-reliability-latency",
    "router-l2-cross-network",
    "vlan-logical-separation",
    "dhcp-client-network-config",
    "dns-record-mail-routing",
    "tcp-three-way-handshake",
    "default-gateway-off-subnet",
    "arp-same-lan-mac-resolution",
  ]);
  assert.match(data, /category: "セキュリティ"/);
  assert.match(data, /category: "データベース"/);
  assert.match(data, /category: "ネットワーク"/);
  assert.match(data, /category: "マネジメント"/);
  assert.match(data, /category: "ストラテジ"/);
  assert.equal((data.match(/^\s+followUp: \{/gm) ?? []).length, 37);
  assert.equal((data.match(/^\s+correctIndex: \d,/gm) ?? []).length, 74);
  assert.equal((data.match(/^\s+choices: \[/gm) ?? []).length, 74);
  assert.equal((data.match(/^\s+skill: "/gm) ?? []).length, 74);
  assert.equal((data.match(/^\s+conditions: \[/gm) ?? []).length, 74);
  assert.equal((data.match(/^\s+clues: \[/gm) ?? []).length, 74);
  assert.equal((data.match(/^\s+comparison: \[/gm) ?? []).length, 74);
  assert.ok(questionArray, "understanding question array is missing");
  for (const element of questionArray.elements) {
    assert.ok(ts.isObjectLiteralExpression(element), "question must be an object");
    const id = textValue(property(element, "id"));
    const mainChoices = textArray(property(element, "choices"));
    const mainCorrectIndex = Number(property(element, "correctIndex")?.getText(sourceFile));
    const followUp = property(element, "followUp");
    assert.equal(mainChoices.length, 4, `${id}: main question must have four choices`);
    assert.ok(Number.isInteger(mainCorrectIndex) && mainCorrectIndex >= 0 && mainCorrectIndex < 4, `${id}: invalid main correctIndex`);
    assert.ok(followUp && ts.isObjectLiteralExpression(followUp), `${id}: follow-up is missing`);
    const followUpChoices = textArray(property(followUp, "choices"));
    const followUpCorrectIndex = Number(property(followUp, "correctIndex")?.getText(sourceFile));
    const followUpPrompt = [textValue(property(followUp, "situation")), ...textArray(property(followUp, "conditions")), textValue(property(followUp, "question")), ...followUpChoices].join(" ");
    assert.equal(followUpChoices.length, 4, `${id}: follow-up must have four choices`);
    assert.ok(Number.isInteger(followUpCorrectIndex) && followUpCorrectIndex >= 0 && followUpCorrectIndex < 4, `${id}: invalid follow-up correctIndex`);
    assert.notDeepEqual([...followUpChoices].sort(), [...mainChoices].sort(), `${id}: follow-up reuses the main choice set`);
    assert.ok(!followUpPrompt.includes(mainChoices[mainCorrectIndex]), `${id}: follow-up exposes the main correct answer`);
    assert.notEqual(textValue(property(element, "skill")), textValue(property(followUp, "skill")), `${id}: follow-up must reverse or deepen the reasoning direction`);
  }
  assert.doesNotMatch(data, /question: "[^"]*(とは|違い)[^"]*"/);
  assert.match(data, /followUp\?: UnderstandingFollowUp/);
  assert.match(data, /skill: string/);
  assert.match(data, /conditions: string\[\]/);
  assert.match(data, /clues: string\[\]/);
  assert.match(component, /ap-understanding-progress-v1/);
  assert.match(component, /"understood" \| "unsure" \| "unclear"/);
  assert.match(component, /const ratingOrder: UnderstandingRating\[\] = \["unclear", "unsure", "understood"\]/);
  assert.match(component, /followUpSelectedIndex !== null/);
  assert.match(component, /確認問題/);
  assert.doesNotMatch(component, /followUpVisible|確認問題へ/);
  assert.match(component, /question\.followUp && <section className="followUpCard"/);
  assert.match(component, /ここまで理解できた？/);
  assert.match(component, /function shuffleChoices\(choices: string\[\]\)/);
  assert.match(component, /const mainChoices = useMemo\(\(\) => shuffleChoices\(question\.choices\), \[question\]\)/);
  assert.match(component, /const followUpChoices = useMemo\(\(\) => question\.followUp \? shuffleChoices\(question\.followUp\.choices\) : \[\], \[question\]\)/);
  assert.match(component, /chooseAnswer\(choice\.originalIndex\)/);
  assert.match(component, /chooseFollowUp\(choice\.originalIndex\)/);
  assert.doesNotMatch(component, /問題文の手掛かり|question\.clues\.map|question\.followUp\.clues\.map/);
  assert.doesNotMatch(component, /className="understandingMeta"|className="understandingTheme"/);
  assert.match(component, /question\.conditions\.map/);
  assert.match(component, /question\.followUp\.comparison\.map/);
  assert.match(component, /<strong>\{position \+ 1\}<\/strong><span>\/ \{activeQuestions\.length\}<\/span>/);
  assert.match(component, /\{understandingQuestions\.length\}テーマ/);
  assert.match(component, /理解度から問題を選ぶ/);
  assert.match(component, /buildUnderstandingRound\(selectedMode, nextCategory, progress, roundIds\)/);
  assert.match(component, /availableCategories\.map/);
  assert.match(component, /分野を選び直す/);
  assert.match(component, /type UnderstandingMode = "all" \| "weak" \| "review" \| "mastered" \| "unseen"/);
  assert.match(component, /retention >= 60 && retention < 75/);
  assert.match(component, /return retention >= 75/);
  assert.match(component, /getRetention\(oldRecord\) \+ \(isCorrect \? 8 : -12\)/);
  assert.match(component, /getRetention\(oldRecord\) \+ \(isCorrect \? 12 : -18\)/);
  assert.match(component, /ratingAdjustment\[nextRating\]/);
  assert.match(component, /\.slice\(0, 5\)/);
  assert.doesNotMatch(component, /3問のプロトタイプ|3問をもう一度|<small>\/3<\/small>/);
  assert.match(page, /activeDojo === "understanding"/);
  assert.match(page, /className="dojoSwitcher"/);
  assert.match(designGuide, /具体的な状況 → 条件を読み取る → 知識を適用する → 選択する/);
  assert.match(designGuide, /themeもskillもほぼ同じなら追加しない/);
  assert.match(designGuide, /数字だけ、選択肢の順番だけを変えた同一問題/);
  assert.match(designGuide, /メイン問題の正解用語は、原則として確認問題の状況・条件・質問・選択肢に出さない/);
  assert.match(designGuide, /特徴的な一文を、そのまま正解選択肢として再利用しない/);
  assert.match(designGuide, /思考方向を変える/);
  assert.doesNotMatch(followUpPromptFor("web-defense-waf"), /WAF/);
  assert.match(followUpPromptFor("web-defense-waf"), /ポート番号だけでは区別できない/);
  assert.doesNotMatch(followUpPromptFor("web-defense-waf"), /詳しく検査すべき情報/);
  assert.doesNotMatch(followUpPromptFor("transaction-non-repeatable-read"), /ダーティリード|ノンリピータブルリード|ファントムリード|デッドロック/);
  assert.match(followUpPromptFor("transaction-non-repeatable-read"), /最も低いトランザクション分離レベル/);
  assert.match(followUpPromptFor("transaction-non-repeatable-read"), /REPEATABLE READ/);
  assert.doesNotMatch(followUpPromptFor("evm-schedule-cost-status"), /\b(?:SPI|CPI|PV|EV|AC)\b/);
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

test("replaces priority and low-quiz tabs with review and mastered category modes", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, />最優先だけ/);
  assert.doesNotMatch(page, />出題少なめ/);
  assert.match(page, />要確認だけ <span className="navCount">\{reviewCount\}<\/span>/);
  assert.match(page, />定着済み <span className="navCount">\{mastered\}<\/span>/);
  assert.match(page, /mode === "review"\) \{ setReviewIds\(buildRound\(name, progress, reviewIds, true, false, false, collectionOverrides, "regular", disabledIds\)\)/);
  assert.match(page, /mode === "mastered"\) \{ setMasteredIds\(buildRound\(name, progress, masteredIds, false, false, false, collectionOverrides, "regular", disabledIds, true\)\)/);
  assert.match(page, /mode === "weak" \|\| mode === "review" \|\| mode === "mastered"/);
});

test("classifies answered terms into weak, review, and mastered ranges", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const helperStart = page.indexOf("function recordAttempts");
  const helperEnd = page.indexOf("function isWeak", helperStart);
  const helperSource = page.slice(helperStart, helperEnd)
    .replace("function recordAttempts(record: Progress[string] | undefined)", "function recordAttempts(record)")
    .replace("function isUnseen(item: Term, savedProgress: Progress)", "function isUnseen(item, savedProgress)");
  const isUnseen = Function(`${helperSource}\nreturn isUnseen;`)();

  assert.match(page, /function isWeak[\s\S]*?isUnseen\(item, savedProgress\)[\s\S]*?getRetention\(item, savedProgress\) < 60;/);
  assert.match(page, /function needsReview[\s\S]*?retention >= 60 && retention < 75;/);
  assert.match(page, /function isMastered[\s\S]*?!isUnseen\(item, savedProgress\) && getRetention\(item, savedProgress\) >= 75;/);
  assert.match(page, /!onlyWeak \|\| isWeak\(item, savedProgress\)/);
  assert.match(page, /!onlyReview \|\| needsReview\(item, savedProgress\)/);
  assert.match(page, /!onlyMastered \|\| isMastered\(item, savedProgress\)/);
  assert.match(page, /定着度60未満を「苦手だけ」にまとめて復習/);
  assert.doesNotMatch(page, /label: "最優先"/);
  assert.equal(isUnseen({ id: "term" }, {}), true);
  assert.equal(isUnseen({ id: "term" }, { term: { correct: 0, wrong: 0, attempts: 1, retention: 23 } }), false);
  assert.equal(isUnseen({ id: "term" }, { term: { correct: 0, wrong: 0, attempts: 0, retention: 25 } }), true);
  assert.equal(isUnseen({ id: "term" }, { term: { correct: 0, wrong: 0, retention: 23 } }), false);
  assert.equal(isUnseen({ id: "term" }, { term: { correct: 0, wrong: 0, retention: 35 } }), true);
  assert.match(page, /attempts: recordAttempts\(progress\[card\.id\]\) \+ 1/);
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
  assert.match(page, /function toggleCollection\(item: Term, preserveSession = false\)/);
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
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /const disabledStorageKey = "ap-study-disabled-ids-v1"/);
  assert.match(page, /const backupKeys = \[[^\n]+disabledStorageKey/);
  assert.match(page, /const backupKeys = \[[^\n]+"ap-understanding-progress-v1"/);
  assert.match(page, /function toggleDisabled\(item: Term, preserveSession = false\)/);
  assert.match(page, /!disabledIds\.includes\(item\.id\)/);
  assert.match(page, /getChoices\(card, questionDifficulty, disabledIds\)/);
  assert.match(page, /collectionFilter === "disabled"/);
  assert.match(page, /function renderQuestionQuickActions\(item: Term\)/);
  assert.equal((page.match(/\{renderQuestionQuickActions\(card\)\}/g) ?? []).length, 2);
  assert.match(page, /toggleCollection\(item, true\)/);
  assert.match(page, /toggleDisabled\(item, true\)/);
  assert.match(page, /refreshRounds\(nextOverrides, disabledIds, !preserveSession\)/);
  assert.match(css, /\.questionQuickActions button \{[^}]*background: transparent;[^}]*font-size: 9px;/);
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

test("keeps follow-up question text as large as the main question", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const mobileStart = css.indexOf("@media (max-width: 520px)");
  const mobileCss = css.slice(mobileStart, css.indexOf("@media (prefers-reduced-motion", mobileStart));

  assert.match(css, /\.situationBox > p \{[^}]*font-size: 17px;/);
  assert.match(css, /\.followUpSituation \{[^}]*font-size: 17px;/);
  assert.match(css, /\.understandingQuestion h2 \{[^}]*font-size: clamp\(21px, 3vw, 30px\);/);
  assert.match(css, /\.followUpCard > h3 \{[^}]*font-size: clamp\(21px, 3vw, 30px\);/);
  assert.doesNotMatch(css, /\.followUpChoices button \{[^}]*font-size:/);
  assert.match(mobileCss, /\.understandingQuestion h2 \{[^}]*font-size: 20px;/);
  assert.match(mobileCss, /\.followUpCard > h3 \{ font-size: 20px;/);
  assert.match(mobileCss, /\.followUpSituation \{[^}]*font-size: 15px;/);
});
