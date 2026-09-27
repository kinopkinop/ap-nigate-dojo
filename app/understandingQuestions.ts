export type UnderstandingCategory = "セキュリティ" | "データベース" | "マネジメント";

export type UnderstandingFollowUp = {
  situation?: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  keyPoint: string;
  metrics?: Array<{ label: string; value: string }>;
};

export type UnderstandingQuestion = {
  id: string;
  category: UnderstandingCategory;
  theme: string;
  situation: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  comparison: Array<{ label: string; detail: string }>;
  keyPoint: string;
  metrics?: Array<{ label: string; value: string }>;
  followUp?: UnderstandingFollowUp;
};

export const understandingQuestions: UnderstandingQuestion[] = [
  {
    id: "web-defense-waf",
    category: "セキュリティ",
    theme: "WAF・ファイアウォール・IDS・IPS",
    situation: "ECサイトで、SQLインジェクションやXSSを防ぎたい。Webアプリへ届くHTTPリクエストの内容を検査し、不正な通信を遮断する。",
    question: "この対策に最も適切なものはどれ？",
    choices: ["ファイアウォール", "WAF", "IDS", "IPS"],
    correctIndex: 1,
    explanation: "WAFはWebアプリケーションへ届くHTTP通信の内容を検査します。そのため、SQLインジェクションやXSSなど、Webアプリを狙う攻撃の遮断に向いています。",
    comparison: [
      { label: "ファイアウォール", detail: "主にIPアドレスやポート番号などを見て通信を制御する。" },
      { label: "IDS", detail: "不正な通信を検知して通知する。通常は自動で遮断しない。" },
      { label: "IPS", detail: "不正な通信を検知して遮断するが、WAFほどWebアプリのHTTP内容に特化していない。" },
    ],
    keyPoint: "「SQLインジェクション」「XSS」「HTTPの中身」がそろったら、まずWAFを疑う。",
    followUp: {
      question: "WAFとファイアウォールの違いとして、最も適切なものはどれ？",
      choices: [
        "WAFは主にHTTPの内容を検査し、ファイアウォールは主にIPアドレスやポート番号で制御する",
        "WAFはIPアドレスだけを確認する",
        "ファイアウォールだけがSQLインジェクションを検査する",
        "両者の役割に違いはない",
      ],
      correctIndex: 0,
      explanation: "WAFはWebアプリへ届くHTTP通信の内容を検査します。ファイアウォールは主にIPアドレス、ポート番号、プロトコルなどを基準に通信を制御します。",
      keyPoint: "HTTPの中身を見るのがWAF。通信相手や入口を見るのがファイアウォール。",
    },
  },
  {
    id: "transaction-non-repeatable-read",
    category: "データベース",
    theme: "トランザクションの読み取り異常",
    situation: "トランザクションAが商品の価格を100円で読む。その後、Bが同じ商品を200円へ更新してCOMMIT。Aが同じ行をもう一度読むと200円になっていた。",
    question: "この場合に起きている現象はどれ？",
    choices: ["ダーティリード", "ノンリピータブルリード", "ファントムリード", "デッドロック"],
    correctIndex: 1,
    explanation: "同じトランザクション内で同じ行を読み直したとき、別トランザクションがコミットした更新によって値が変わっています。これはノンリピータブルリードです。",
    comparison: [
      { label: "ダーティリード", detail: "まだCOMMITされていない値を読んでしまう。" },
      { label: "ファントムリード", detail: "同じ条件で再検索したとき、該当する行の数が増減する。" },
      { label: "デッドロック", detail: "互いに相手のロック解除を待ち、処理が進まなくなる。" },
    ],
    keyPoint: "同じ「行」の値が変わるならノンリピータブル。検索結果の「行数」が変わるならファントム。",
    followUp: {
      situation: "Aが「在庫ありの商品」を検索すると10行だった。別トランザクションが条件に合う商品を追加してCOMMIT後、Aが同じ検索をすると11行になった。",
      question: "この場合に起きている現象はどれ？",
      choices: ["ダーティリード", "ノンリピータブルリード", "ファントムリード", "デッドロック"],
      correctIndex: 2,
      explanation: "同じ検索を再実行したとき、別トランザクションが追加した行が現れています。値の変化ではなく検索結果の行数が変わるため、ファントムリードです。",
      keyPoint: "同じ行の値が変わるならノンリピータブル。条件に合う行が増減するならファントム。",
    },
  },
  {
    id: "evm-schedule-cost-status",
    category: "マネジメント",
    theme: "EVMの進捗・コスト判断",
    situation: "ある時点の計画価値・出来高・実コストが次の値だった。進捗とコスト効率を判断する。",
    question: "このプロジェクトの状態として最も適切なものはどれ？",
    choices: [
      "予定より遅れており、コスト効率も悪い",
      "予定より遅れているが、コスト効率は良い",
      "予定より進んでいるが、コスト効率は悪い",
      "予定より進んでおり、コスト効率も良い",
    ],
    correctIndex: 0,
    metrics: [
      { label: "PV", value: "100万円" },
      { label: "EV", value: "80万円" },
      { label: "AC", value: "90万円" },
    ],
    explanation: "SPIはEV÷PV＝0.8で1未満なので、予定より遅れています。CPIはEV÷AC≒0.89で1未満なので、使ったコストに対する出来高が少なく、コスト効率も悪い状態です。",
    comparison: [
      { label: "SPI", detail: "進捗を見る指標。EVとPVを比べ、1未満なら予定より遅れている。" },
      { label: "CPI", detail: "コスト効率を見る指標。EVとACを比べ、1未満なら効率が悪い。" },
    ],
    keyPoint: "SPIはスケジュール、CPIはコスト。どちらも1を基準に、未満なら悪いと判断する。",
    followUp: {
      situation: "進捗とコスト効率を、次の二つの指標から判断する。",
      question: "このプロジェクトの状態として最も適切なものはどれ？",
      choices: [
        "予定より遅れ、コスト効率も悪い",
        "予定より遅れ、コスト効率は良い",
        "予定より進み、コスト効率は悪い",
        "予定より進み、コスト効率も良い",
      ],
      correctIndex: 2,
      metrics: [
        { label: "SPI", value: "1.2" },
        { label: "CPI", value: "0.8" },
      ],
      explanation: "SPIは1より大きいので予定より進んでいます。CPIは1より小さいのでコスト効率は悪い状態です。",
      keyPoint: "SPIとCPIを別々に1と比較する。SPI＞1は進捗良好、CPI＜1はコスト効率不良。",
    },
  },
];
