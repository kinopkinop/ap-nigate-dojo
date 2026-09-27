export type UnderstandingCategory = "セキュリティ" | "データベース" | "マネジメント";

export type UnderstandingFollowUp = {
  skill: string;
  situation: string;
  conditions: string[];
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  clues: string[];
  comparison: Array<{ label: string; detail: string }>;
  keyPoint: string;
  metrics?: Array<{ label: string; value: string }>;
};

export type UnderstandingQuestion = {
  id: string;
  category: UnderstandingCategory;
  theme: string;
  skill: string;
  situation: string;
  conditions: string[];
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  clues: string[];
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
    skill: "攻撃内容と検査対象からWebアプリ向け防御策を選ぶ",
    situation: "ECサイトでは、ファイアウォールで接続先ポートを制限している。それでも、Webアプリを狙う不正なHTTPリクエストが到達している。",
    conditions: [
      "HTTPS通信は業務上許可する必要がある",
      "SQLインジェクションやXSSを防ぎたい",
      "URL・ヘッダ・本文などHTTPの内容を検査して遮断したい",
    ],
    question: "追加する対策として最も適切なものはどれ？",
    choices: ["ファイアウォール", "WAF", "IDS", "IPS"],
    correctIndex: 1,
    explanation: "WAFはWebアプリケーションへ届くHTTP通信の内容を検査します。HTTPSを許可したまま、SQLインジェクションやXSSなどの不正なリクエストを遮断したい状況に適しています。",
    clues: ["ファイアウォールは導入済み", "SQLインジェクション・XSS", "HTTPの内容を検査"],
    comparison: [
      { label: "ファイアウォール", detail: "主にIPアドレスやポート番号などを見て通信を制御する。" },
      { label: "IDS", detail: "不正な通信を検知して通知する。通常は自動で遮断しない。" },
      { label: "IPS", detail: "不正な通信を検知して遮断するが、WAFほどWebアプリのHTTP内容に特化していない。" },
    ],
    keyPoint: "「SQLインジェクション」「XSS」「HTTPの中身」がそろったら、まずWAFを疑う。",
    followUp: {
      skill: "既存対策で不足する検査層を見抜いて追加策を選ぶ",
      situation: "取引先向けWeb APIは、ファイアウォールで接続元IPと443番ポートを制限している。しかし、許可済みの接続元から不正なJSONデータが送られ、アプリの処理を悪用されそうになった。",
      conditions: [
        "正規のAPI通信は継続する必要がある",
        "IPアドレスとポート番号の制御だけでは防げなかった",
        "リクエストの中身を調べて自動遮断したい",
      ],
      question: "この要件を補う対策として最も適切なものはどれ？",
      choices: ["WAF", "ファイアウォール", "IDS", "IPS"],
      correctIndex: 0,
      explanation: "接続元とポートは既に制御済みで、必要なのはWeb APIへ届くリクエスト内容の検査です。HTTPを扱うアプリケーション層の攻撃に特化したWAFが適しています。",
      clues: ["ファイアウォール導入済み", "許可済み通信の中身が不正", "JSONデータを検査して遮断"],
      comparison: [
        { label: "ファイアウォール", detail: "IPアドレスやポート番号の制御が中心で、今回既に使われている。" },
        { label: "IDS", detail: "不審な通信の検知・通知が中心で、自動遮断の要件を満たさない。" },
        { label: "IPS", detail: "通信を遮断できるが、Web APIのHTTP内容に特化するならWAFがより適切。" },
      ],
      keyPoint: "入口の制御を通過したWebリクエストの中身を見るならWAF。",
    },
  },
  {
    id: "transaction-non-repeatable-read",
    category: "データベース",
    theme: "トランザクションの読み取り異常",
    skill: "同じ行の再読結果から読み取り異常を判定する",
    situation: "在庫管理システムで、トランザクションAが処理中に同じ商品の価格を二度確認した。",
    conditions: [
      "Aが最初に読んだ価格は100円",
      "途中でBが同じ商品を200円へ更新してCOMMIT",
      "Aが同じ行を再読すると200円になっていた",
    ],
    question: "この場合に起きている現象はどれ？",
    choices: ["ダーティリード", "ノンリピータブルリード", "ファントムリード", "デッドロック"],
    correctIndex: 1,
    explanation: "同じトランザクション内で同じ行を読み直したとき、別トランザクションがコミットした更新によって値が変わっています。これはノンリピータブルリードです。",
    clues: ["同じ行を二度読む", "別トランザクションはCOMMIT済み", "行の値が100円から200円へ変化"],
    comparison: [
      { label: "ダーティリード", detail: "まだCOMMITされていない値を読んでしまう。" },
      { label: "ファントムリード", detail: "同じ条件で再検索したとき、該当する行の数が増減する。" },
      { label: "デッドロック", detail: "互いに相手のロック解除を待ち、処理が進まなくなる。" },
    ],
    keyPoint: "同じ「行」の値が変わるならノンリピータブル。検索結果の「行数」が変わるならファントム。",
    followUp: {
      skill: "検索結果の行数変化から読み取り異常を判定する",
      situation: "受注処理中のトランザクションAが、在庫のある商品を同じ条件で二度検索した。",
      conditions: [
        "最初の検索結果は10行",
        "途中でBが条件に合う商品を追加してCOMMIT",
        "同じ検索をやり直すと11行になった",
      ],
      question: "この場合に起きている現象はどれ？",
      choices: ["ダーティリード", "ノンリピータブルリード", "ファントムリード", "デッドロック"],
      correctIndex: 2,
      explanation: "同じ検索を再実行したとき、別トランザクションが追加した行が現れています。値の変化ではなく検索結果の行数が変わるため、ファントムリードです。",
      clues: ["同じ条件で再検索", "別トランザクションが行を追加してCOMMIT", "結果が10行から11行へ増加"],
      comparison: [
        { label: "ダーティリード", detail: "未COMMITの値を読んだ場合。今回はBがCOMMITしている。" },
        { label: "ノンリピータブルリード", detail: "同じ行の値が変わる場合。今回は検索結果の行が増えている。" },
        { label: "デッドロック", detail: "互いのロック解除待ちで処理が止まる状態。今回は検索を続行できている。" },
      ],
      keyPoint: "同じ行の値が変わるならノンリピータブル。条件に合う行が増減するならファントム。",
    },
  },
  {
    id: "evm-schedule-cost-status",
    category: "マネジメント",
    theme: "EVMの進捗・コスト判断",
    skill: "PV・EV・ACから進捗とコスト効率を判定する",
    situation: "プロジェクトの定例会で、現時点の計画価値・出来高・実コストを使って状況を報告する。",
    conditions: [
      "SPIはEV÷PVで、1未満なら予定より遅れている",
      "CPIはEV÷ACで、1未満ならコスト効率が悪い",
    ],
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
    clues: ["EVがPVより小さい", "EVがACより小さい", "SPI・CPIは1を基準に判定"],
    comparison: [
      { label: "進捗は良い", detail: "SPIが1以上、つまりEVがPV以上の場合。今回は当てはまらない。" },
      { label: "コスト効率は良い", detail: "CPIが1以上、つまりEVがAC以上の場合。今回は当てはまらない。" },
    ],
    keyPoint: "SPIはスケジュール、CPIはコスト。どちらも1を基準に、未満なら悪いと判断する。",
    followUp: {
      skill: "状況の説明からPV・EV・ACの大小関係を逆算する",
      situation: "プロジェクトマネージャが、月次会議で進捗とコストの状態を報告した。",
      conditions: [
        "作業は予定より遅れている",
        "完了した作業に対するコスト効率は良い",
      ],
      question: "この報告と一致するEVM値の関係はどれ？",
      choices: [
        "EV ＜ PV かつ EV ＞ AC",
        "EV ＜ PV かつ EV ＜ AC",
        "EV ＞ PV かつ EV ＞ AC",
        "EV ＞ PV かつ EV ＜ AC",
      ],
      correctIndex: 0,
      explanation: "予定より遅れているならSPI＝EV÷PVは1未満なのでEV＜PVです。コスト効率が良いならCPI＝EV÷ACは1より大きいのでEV＞ACです。",
      clues: ["予定より遅れている", "コスト効率は良い", "SPIとCPIで比較相手が異なる"],
      comparison: [
        { label: "EV＜PV", detail: "SPIが1未満となり、予定より遅れていることを表す。" },
        { label: "EV＞PV", detail: "SPIが1より大きく、予定より進んでいる状態。今回とは逆。" },
        { label: "EV＞AC", detail: "CPIが1より大きく、コスト効率が良いことを表す。" },
        { label: "EV＜AC", detail: "CPIが1未満で、コスト効率が悪い状態。今回とは逆。" },
      ],
      keyPoint: "遅れはEV＜PV、コスト効率良好はEV＞AC。状態から式の大小関係へ戻して考える。",
    },
  },
];
