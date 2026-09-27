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
      skill: "ポート制御だけではWeb攻撃を防ぎにくい理由を判断する",
      situation: "ECサイトでは、ファイアウォールで443番ポートへの通信を許可している。その許可済みの通信に、SQLインジェクションの攻撃文字列が含まれていた。",
      conditions: [
        "正常なHTTPS通信も443番ポートを使う",
        "攻撃通信も同じ443番ポートを通る",
        "ファイアウォールはポート番号による許可・拒否を行っている",
      ],
      question: "ファイアウォールだけではこの攻撃を防ぎにくい主な理由はどれ？",
      choices: [
        "同じポートを使う正常通信と攻撃通信を、ポート番号だけでは区別できないから",
        "SQLインジェクションはUDPだけを使うから",
        "ファイアウォールは送信元IPアドレスを確認できないから",
        "HTTPSではWebサーバと通信できないから",
      ],
      correctIndex: 0,
      explanation: "正常なHTTPS通信も攻撃を含む通信も443番ポートを通ります。ポート番号だけを見る制御では両者を区別できないため、HTTPの内容を検査するWAFが必要になります。",
      clues: ["正常通信も攻撃通信も443番ポート", "ポート番号による制御", "許可済み通信に攻撃文字列"],
      comparison: [
        { label: "UDPだけを使う", detail: "SQLインジェクションはWebアプリへの入力を悪用する攻撃であり、UDP専用ではない。" },
        { label: "送信元IPを見られない", detail: "ファイアウォールは送信元・宛先IPアドレスを条件にできる。" },
        { label: "HTTPSで通信できない", detail: "HTTPSはWebサーバとの通信に使われる。通信できるからこそ攻撃も混在する。" },
      ],
      keyPoint: "同じ入口を使う正常通信と攻撃通信は、入口の番号だけでは見分けられない。",
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
      skill: "防ぎたい読み取り異常から必要な分離レベルを選ぶ",
      situation: "受注処理では、同じトランザクション中に商品行を何度読み直しても、最初に読んだ値が変わらないことを保証したい。",
      conditions: [
        "ほかのトランザクションによる更新後の値を、処理途中で見せたくない",
        "同じ行の再読結果が変わる現象を防ぎたい",
        "検索結果への新しい行の出現までは防がなくてよい",
      ],
      question: "この要件を満たす最も低いトランザクション分離レベルはどれ？",
      choices: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
      correctIndex: 2,
      explanation: "REPEATABLE READは、同じトランザクション内で一度読んだ行を再読しても値が変わらないようにします。ファントムリードまで防ぐ要件ではないため、SERIALIZABLEまで上げる必要はありません。",
      clues: ["同じ行の値を維持", "ファントムリードは許容", "最も低い分離レベル"],
      comparison: [
        { label: "READ UNCOMMITTED", detail: "未COMMITの値まで読めるため、要件を満たさない。" },
        { label: "READ COMMITTED", detail: "未COMMIT値は防ぐが、COMMIT済み更新による再読値の変化は起こり得る。" },
        { label: "SERIALIZABLE", detail: "ファントムリードも含めて強く防ぐが、今回の要件には過剰。" },
      ],
      keyPoint: "同じ行の再読値を固定したいならREPEATABLE READ。行の増減まで防ぐならSERIALIZABLE。",
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
