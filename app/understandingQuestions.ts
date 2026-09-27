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
      skill: "Webアプリ向け防御が検査する情報を判断する",
      situation: "取引先向けWeb APIは、ファイアウォールで接続元IPと443番ポートを制限している。しかし、許可済みの通信に不正な入力値が含まれ、アプリの処理を悪用されそうになった。",
      conditions: [
        "正規のAPI通信は継続する必要がある",
        "IPアドレスとポート番号の制御だけでは防げなかった",
        "アプリへ届く通信の中身を詳しく確認したい",
      ],
      question: "追加の対策で詳しく検査すべき情報はどれ？",
      choices: [
        "HTTPリクエストのURL・ヘッダ・本文",
        "送信元IPアドレスと宛先ポートだけ",
        "サーバのCPU使用率とメモリ使用量",
        "DNSサーバに登録されたゾーン情報",
      ],
      correctIndex: 0,
      explanation: "許可済みの通信にも攻撃内容が含まれるため、URL、ヘッダ、入力値を含む本文など、HTTPリクエストの中身を検査する必要があります。これがWAFの役割です。",
      clues: ["IPアドレスとポートは制御済み", "許可済み通信に不正な入力値", "アプリへ届く通信の中身"],
      comparison: [
        { label: "IP・ポート", detail: "一般的なファイアウォールが主に見る情報で、今回既に制御済み。" },
        { label: "CPU・メモリ", detail: "性能監視の情報であり、不正な入力値の判定には使わない。" },
        { label: "DNSゾーン情報", detail: "名前解決に使う情報であり、HTTPリクエストの内容ではない。" },
      ],
      keyPoint: "入口を通過した攻撃を見つけるには、IPやポートではなくHTTPの中身を見る。",
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
      skill: "同じ行を再読したときに起きる変化を説明する",
      situation: "顧客管理システムで、トランザクションAが同じ顧客行を処理中に二度読み取った。",
      conditions: [
        "最初に読んだ会員ランクは一般会員",
        "途中でBが同じ行を優良会員へ更新してCOMMIT",
        "Aの処理はまだ終了していない",
      ],
      question: "Aが同じ顧客行をもう一度読むと、起こり得る変化はどれ？",
      choices: [
        "同じ行の会員ランクが優良会員に変わって見える",
        "BがCOMMITする前の値だけを読み取る",
        "検索条件に一致する行が新しく追加される",
        "AとBが互いのロック解除を待ち続ける",
      ],
      correctIndex: 0,
      explanation: "BがCOMMITした更新は確定しています。同じ行をAが再読したときに値が変わって見えることが、ノンリピータブルリードの中身です。",
      clues: ["同じ顧客行を二度読む", "Bの更新はCOMMIT済み", "Aの処理は継続中"],
      comparison: [
        { label: "未確定値を読む", detail: "ダーティリードの説明。今回はBが既にCOMMITしている。" },
        { label: "行が追加される", detail: "ファントムリードの説明。今回は同じ一行の値が更新されている。" },
        { label: "解除を待ち続ける", detail: "デッドロックの説明。問題文には相互待ちの条件がない。" },
      ],
      keyPoint: "用語名ではなく、「同じ行を再読すると確定済みの値が変わる」と説明できるかを確認する。",
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
      question: "この報告と一致する三つの値の関係はどれ？",
      choices: [
        "出来高は計画価値より小さく、実コストより大きい",
        "出来高は計画価値より大きく、実コストより小さい",
        "出来高は計画価値と実コストの両方より小さい",
        "出来高は計画価値と実コストの両方より大きい",
      ],
      correctIndex: 0,
      explanation: "予定より遅れているならSPI＝EV÷PVは1未満なのでEV＜PVです。コスト効率が良いならCPI＝EV÷ACは1より大きいのでEV＞ACです。",
      clues: ["予定より遅れている", "コスト効率は良い", "SPIとCPIで比較相手が異なる"],
      comparison: [
        { label: "出来高＜計画価値", detail: "予定していたほど作業が進んでおらず、遅れている。" },
        { label: "出来高＞計画価値", detail: "予定より進んでいる状態なので、今回とは逆。" },
        { label: "出来高＞実コスト", detail: "使った費用より得られた出来高が大きく、コスト効率が良い。" },
        { label: "出来高＜実コスト", detail: "使った費用に対する出来高が小さく、コスト効率が悪い。" },
      ],
      keyPoint: "遅れなら出来高＜計画価値、効率良好なら出来高＞実コストと読み替える。",
    },
  },
];
