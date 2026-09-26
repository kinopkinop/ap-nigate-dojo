"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Category = "セキュリティ" | "データベース" | "ネットワーク" | "マネジメント" | "ストラテジ" | "テクノロジ";
type Term = {
  id: string;
  term: string;
  category: Category;
  hint: string;
  studyPrompt?: string;
  hardPrompt?: string;
  answer: string;
  level: 1 | 2 | 3;
  confusion?: string;
  collection?: "special";
};

const terms: Term[] = [
  { id: "https", term: "HTTPS", category: "セキュリティ", hint: "Web通信をTLSで保護する仕組み。", answer: "TLSでは公開鍵暗号などを使って安全に鍵共有・認証を行い、その後は主に共通鍵暗号で通信する。", level: 1 },
  { id: "signature", term: "電子署名", category: "セキュリティ", hint: "『本人だけが作れて、誰でも確かめられる』には、鍵をどう使えばよい？", answer: "送信者が秘密鍵で署名し、受信者は送信者の公開鍵で検証する。改ざん検知と本人確認に使う。", level: 1 },
  { id: "heuristic", term: "ヒューリスティック法", category: "セキュリティ", hint: "指名手配写真にない犯人でも、行動が不自然なら見つけられる。", answer: "既知のパターンとの一致ではなく、怪しい特徴や挙動から未知のマルウェアを検出する。", level: 1 },
  { id: "polymorphic", term: "ポリモーフィック型", category: "セキュリティ", hint: "同じ指名手配写真を使わせないマルウェア。", answer: "感染のたびに暗号化方法やコードを変化させ、同じパターンで検出されにくくする。", level: 1 },
  { id: "rootkit", term: "rootkit", category: "セキュリティ", hint: "侵入者が、監視カメラそのものに細工するイメージ。", answer: "OSに潜伏し、攻撃者の存在や不正プロセス・ファイルを隠すための仕組み。", level: 1 },
  { id: "cc", term: "C&Cサーバ", category: "セキュリティ", hint: "感染端末が兵隊なら、これは遠隔地にいる司令官。", answer: "感染端末（ボット）へ命令を送り、攻撃や情報送信を制御するサーバ。", level: 1 },
  { id: "honeypot", term: "ハニーポット", category: "セキュリティ", hint: "名前の通り、甘い蜜を置いて観察する。", answer: "おとりのシステムに攻撃者を誘導し、手口の観察や本物のシステムからの隔離に使う。", level: 1 },
  { id: "ipsec", term: "IPsec", category: "セキュリティ", hint: "アプリごとではなく、IP通信そのものに鎧を着せる。", answer: "IPパケットを認証・暗号化する仕組み。インターネットVPNなどで使われる。", level: 1 },
  { id: "traversal", term: "ディレクトリトラバーサル", category: "セキュリティ", hint: "Web公開フォルダから、親フォルダへ勝手にさかのぼる攻撃。", answer: "../ などで本来の公開範囲外へ移動し、サーバ内のファイルを不正に読み出す攻撃。", level: 1 },
  { id: "prepared", term: "プリペアドステートメント", category: "セキュリティ", hint: "注文票の書式を先に固定し、客の入力を命令として扱わせない。", answer: "SQLのひな型と値を別々に扱い、入力値をSQL命令として解釈させない。SQLインジェクション対策。", level: 1 },
  { id: "phishing", term: "フィッシング", category: "セキュリティ", hint: "魚釣りのように、餌で利用者を偽物へ誘導する。", answer: "偽メールなどから偽サイトへ誘導し、ID・パスワードなどを入力させて盗む。", level: 1 },
  { id: "ransomware", term: "ランサムウェア", category: "セキュリティ", hint: "ransom は『身代金』。何を人質に取る？", answer: "ファイルを暗号化するなどして利用不能にし、復旧と引換えに身代金を要求する。", level: 1 },
  { id: "csrf", term: "CSRF", category: "セキュリティ", hint: "正規サイトは、届いたCookieを見て本人の操作だと思い込む。", answer: "ログイン済みの利用者に、本人が意図しないリクエストを正規サイトへ送らせる攻撃。", level: 2 },
  { id: "packet", term: "パケットフィルタリング", category: "セキュリティ", hint: "荷物の中身までは開けず、宛名・差出人・受付窓口を見て通すか決める。", answer: "送信元・宛先IPアドレス、ポート番号、プロトコルなどで通信を許可・拒否する。", level: 2 },
  { id: "keydelivery", term: "鍵配送問題", category: "セキュリティ", hint: "金庫は安全。でも、その金庫を開ける鍵を相手へ届けるには？", answer: "暗号化に使う共通鍵を、盗聴されず安全に相手へ渡さなければならない問題。", level: 2 },
  { id: "publickey", term: "公開鍵暗号", category: "セキュリティ", hint: "誰でも閉められるが、持ち主だけが開けられる南京錠を想像する。", answer: "受信者の公開鍵で暗号化し、受信者が自分の秘密鍵で復号する。", level: 2 },
  { id: "ca", term: "CA（認証局）", category: "セキュリティ", hint: "Webサイトなどの身元を第三者として保証する。", answer: "デジタル証明書を発行し、公開鍵と所有者の結び付きを保証する信頼された機関。", level: 2, confusion: "デジタル証明書は、CAが発行する身元確認用の電子的な証明書" },
  { id: "napt", term: "NAPT", category: "セキュリティ", hint: "同じ建物の住所を共有するなら、部屋番号も必要になる。", answer: "IPアドレスだけでなくポート番号も変換し、複数端末で一つのグローバルIPを共有する。", level: 2 },
  { id: "password-list", term: "パスワードリスト攻撃", category: "セキュリティ", hint: "人は複数サービスで同じ合鍵を使い回しがち。そこを狙う。", answer: "他サービスから漏えいしたID・パスワードの組合せを、別サービスで試す。", level: 2 },
  { id: "account-lock", term: "アカウントロック", category: "セキュリティ", hint: "暗証番号を何度も間違えたキャッシュカードを想像する。", answer: "一定回数ログインに失敗したアカウントを一時的または恒久的に利用停止する。", level: 2 },
  { id: "spray", term: "パスワードスプレー攻撃", category: "セキュリティ", hint: "一つの鍵で同じ扉を何度も試すと警報が鳴る。なら、多くの扉へ薄く広く試す。", answer: "よく使われる少数のパスワードを多数のIDに試し、アカウントロックを避ける。", level: 2, confusion: "パスワードリスト攻撃との違いに注意" },
  { id: "sso", term: "シングルサインオン（SSO）", category: "セキュリティ", hint: "テーマパークの共通入場券。各アトラクションで毎回本人確認はしない。", answer: "一度のログインで、連携する複数のサービスを利用できる仕組み。", level: 2 },
  { id: "hijack", term: "セッションハイジャック", category: "セキュリティ", hint: "ログイン情報そのものではなく、ログイン済みを示す入場券を奪う。", answer: "有効なセッションIDを盗み、正規利用者になりすましてセッションを乗っ取る。", level: 2 },
  { id: "fixation", term: "セッション固定攻撃", category: "セキュリティ", hint: "席番号を盗むのではなく、攻撃者が選んだ席へ被害者を座らせる。", answer: "攻撃者が用意したセッションIDを利用者に使わせ、ログイン後に同じIDで乗っ取る。", level: 2, confusion: "ハイジャックは盗む、固定攻撃は使わせる" },
  { id: "httponly", term: "HttpOnly属性", category: "セキュリティ", hint: "ブラウザは使えるが、ページ内のスクリプトには触らせないCookie。", answer: "JavaScriptからCookieを読み取れなくし、XSSによるセッションID窃取のリスクを下げる。", level: 2 },
  { id: "tunnel", term: "トンネルモード", category: "セキュリティ", hint: "手紙だけでなく封筒ごと、別の封筒に入れて運ぶ。", answer: "IPsecで元のIPパケット全体を暗号化・カプセル化し、新しいIPヘッダを付ける。", level: 2 },
  { id: "esp", term: "ESP", category: "セキュリティ", hint: "AHとの違いを思い出す。中身を読めなくできるのはどちら？", hardPrompt: "IPsecで、IPパケットのペイロードに機密性を持たせるために選ぶプロトコルは？", answer: "IPsecで暗号化・認証を提供するプロトコル。AHと違いデータを暗号化できる。", level: 2 },
  { id: "spf", term: "SPF", category: "セキュリティ", hint: "差出人の名前ではなく、投函した場所が許可済みかをDNSで調べる。", answer: "送信元ドメインが許可したIPアドレスからメールが送られたかをDNS情報で検証する。", level: 2 },
  { id: "rollforward", term: "ロールフォワード", category: "データベース", hint: "昨日のセーブデータに、今日の操作履歴を順番に再生する。", answer: "バックアップを復元した後、コミット済みの更新をログから再反映して障害直前の状態へ近づける。", level: 2 },
  { id: "transaction-log", term: "ログファイル／トランザクションログ", category: "データベース", hint: "ゲームのリプレイのように、あとから処理を戻したり再現したりする材料。", answer: "障害復旧のため、データベースへの更新履歴を記録するファイル。ロールバックやロールフォワードに使う。", level: 2 },
  { id: "dirty", term: "ダーティリード", category: "データベース", hint: "まだ会計が終わっていない買物かごの内容を、確定済みとして読んでしまう。", answer: "ほかのトランザクションがまだコミットしていない値を読み取ってしまう現象。", level: 2 },
  { id: "nonrepeatable", term: "ノンリピータブルリード", category: "データベース", hint: "同じレコードを読み直したら、誰かの更新で内容が変わっていた。", answer: "同じ行を再度読んだとき、別トランザクションの更新・コミットによって値が変わっている現象。", level: 2 },
  { id: "phantom", term: "ファントムリード", category: "データベース", hint: "値の変化ではなく、検索結果に『幽霊の行』が現れたり消えたりする。", answer: "同じ条件で再検索したとき、別トランザクションの追加・削除によって該当行が増減する現象。", level: 2 },
  { id: "aggregate", term: "集約関数", category: "データベース", hint: "COUNT、SUM、AVGの共通点は？", hardPrompt: "部署ごとの複数の給与行から、平均値や最大値など一つの値を求める関数の総称は？", answer: "複数行を集計して一つの値を返す関数。COUNT、SUM、AVG、MAX、MINなど。", level: 3 },
  { id: "union", term: "UNION", category: "データベース", hint: "JOINは表を横へ。この演算子は検索結果をどちらの方向へ足す？", answer: "複数のSELECT結果を縦に結合する集合演算。列数と対応するデータ型を合わせ、重複は除かれる。", level: 3, confusion: "サブクエリではなく、検索結果どうしの結合" },
  { id: "orderby", term: "ORDER BY", category: "データベース", hint: "ASCとDESCを後ろに付ける句。", hardPrompt: "抽出対象の行は変えず、検索結果の表示順だけを列と昇順・降順で指定するSQL句は？", answer: "検索結果を指定列で並べ替える。ASCは昇順（既定）、DESCは降順。", level: 3 },
  { id: "lock", term: "排他制御", category: "データベース", hint: "一人が編集中の書類に『使用中』の札を掛ける。", hardPrompt: "複数のトランザクションが同じデータを扱うとき、アクセスの競合を制御して整合性を保つ仕組みは？", answer: "共有ロックや専有ロックなどを使って同時アクセスを制御し、データの整合性を保つ仕組み。", level: 3, confusion: "専有ロックは排他制御に使うロックの一種。デッドロックは互いの解除待ちで進めない状態" },
  { id: "distinct", term: "DISTINCT", category: "データベース", hint: "名簿から都道府県の種類だけを取り出したい。", answer: "SELECT DISTINCT 列名 の形で、検索結果から重複する行を除外する。綴りは DISTINCT。", level: 3, confusion: "destinct ではなく DISTINCT" },
  { id: "exists", term: "EXISTS", category: "データベース", hint: "件数や値ではなく、『該当する行が一つでもあるか』だけを問う。", answer: "サブクエリの結果が1行でも存在すれば真になる条件。存在確認に使う。", level: 3 },
  { id: "ddl", term: "DDL", category: "データベース", hint: "建物でいえば、設計図や間取りを扱う言語。", hardPrompt: "既存の表へ列を追加する命令が分類されるSQL言語は？", answer: "Data Definition Language。CREATE、ALTER、DROPなど、データベースの構造を定義する言語。", level: 2 },
  { id: "dml", term: "DML", category: "データベース", hint: "建物ではなく、その中に置く荷物を出し入れする言語。", hardPrompt: "表の行を検索・追加・更新・削除する命令が分類されるSQL言語は？", answer: "Data Manipulation Language。SELECT、INSERT、UPDATE、DELETEなど、データを操作する言語。", level: 2, confusion: "DDLは構造、DMLは中身" },
  { id: "grant", term: "GRANT", category: "データベース", hint: "英語では『与える』。対になる命令はREVOKE。", hardPrompt: "データベース利用者へSELECT権限を付与するSQL命令は？", answer: "ユーザーやロールに、SELECTやUPDATEなどの権限を付与するSQL文。取り消しはREVOKE。", level: 3 },
  { id: "truncate", term: "TRUNCATE", category: "データベース", hint: "表そのものは残し、中の行をまとめて空にする。", answer: "テーブル構造を残したまま全行を削除するDDL。WHEREで条件指定はできない。", level: 2, confusion: "DELETEはDML、TRUNCATEはDDL" },
  { id: "serializability", term: "直列化可能性", category: "データベース", hint: "同時に走らせても、交通整理された一列の処理と同じなら安全。", answer: "複数のトランザクションを同時実行した結果が、何らかの順序で一つずつ直列実行した結果と同じになる性質。", level: 2 },
  { id: "data-dictionary", term: "データディクショナリ", category: "データベース", hint: "辞書が言葉の意味を管理するように、DB自身の情報を管理する。", answer: "表名、列名、データ型、制約などのメタデータを一元的に管理する仕組み。", level: 2, confusion: "メタデータは情報そのもの、データディクショナリはそれを管理するもの" },
  { id: "foreign-key", term: "外部キー", category: "データベース", hint: "注文表の顧客番号から、顧客表の一人を指し示す。", answer: "別テーブルの主キーや一意キーを参照し、テーブル間の関係と参照整合性を保つ列。", level: 1 },
  { id: "normalization", term: "正規化", category: "データベース", hint: "同じ情報を何度も書かず、役割ごとに表を整理する。", answer: "データの重複や更新時の不整合を減らすため、一定の規則に従ってテーブルを分割・整理すること。", level: 1 },
  { id: "group-by", term: "GROUP BY", category: "データベース", hint: "部署別、商品別、月別のように仲間を作ってから数える。", answer: "指定した列の値が同じ行をグループ化し、グループごとに集計するSQL句。", level: 1 },
  { id: "having", term: "HAVING", category: "データベース", hint: "WHEREより後、グループを作って集計した後にふるいを掛ける。", answer: "GROUP BYによる集計後のグループに対して条件を指定するSQL句。", level: 1, confusion: "WHEREは集計前の行、HAVINGは集計後のグループ" },
  { id: "transaction", term: "トランザクション", category: "データベース", hint: "振込の『出金』と『入金』を別々に成功させてはいけない。", answer: "関連する複数の処理を、すべて成功またはすべて失敗させる一つの処理単位としてまとめたもの。", level: 1 },
  { id: "consistency", term: "一貫性", category: "データベース", hint: "ACIDのC。処理の前後でルール違反を起こさない。", answer: "トランザクションの実行前後で、制約などデータベースの整合性が保たれる性質。ACIDのC。", level: 1 },
  { id: "deadlock", term: "デッドロック", category: "データベース", hint: "二人が相手の持つ鍵を待ち、どちらも先へ進めない。", answer: "複数のトランザクションが互いに相手のロック解除を待ち続け、処理が進まなくなる状態。", level: 1 },
  { id: "checkpoint", term: "チェックポイント", category: "データベース", hint: "ゲームを途中保存して、復旧時に最初からやり直さずに済ませる。", answer: "メモリ上の更新内容をディスクへ反映し、障害復旧を始める基準点を作る仕組み。", level: 1 },
  { id: "is-null", term: "IS NULL", category: "データベース", hint: "NULLは値ではないので、イコールでは比較できない。", answer: "列の値がNULLであるかを判定するSQL条件。NULLでないことはIS NOT NULLで判定する。", level: 1 },
  { id: "like", term: "LIKE", category: "データベース", hint: "%と_を使う検索。名前の一部しか分からないときに便利。", answer: "文字列のパターンを指定して部分一致検索するSQL演算子。%は0文字以上、_は任意の1文字を表す。", level: 1 },
  { id: "in", term: "IN", category: "データベース", hint: "東京・大阪・福岡の、どれか一つなら該当。", answer: "値が指定した複数の候補のいずれかに一致するかを判定するSQL演算子。", level: 1 },
  { id: "between", term: "BETWEEN", category: "データベース", hint: "下限と上限の間に入っているかを見る。", answer: "値が指定した下限以上・上限以下の範囲内にあるかを判定するSQL演算子。", level: 1 },
  { id: "subquery", term: "サブクエリ", category: "データベース", hint: "大きな質問に答えるため、途中でもう一つ質問する。", answer: "SELECT文などのSQL文の内部に記述する別のSELECT文。内側の検索結果を外側の処理で利用する。", level: 1 },
  { id: "alter", term: "ALTER", category: "データベース", hint: "壊して建て直すのではなく、建物を増改築する命令。", answer: "既存のテーブルに列や制約を追加・変更・削除するなど、データベースの構造を変更するDDL。", level: 1 },
  { id: "drop", term: "DROP", category: "データベース", hint: "中身だけでなく、入れ物ごとなくす。", answer: "テーブルなどのデータベースオブジェクトを、その構造とデータごと削除するDDL。", level: 1, confusion: "TRUNCATEはテーブルを残す、DROPはテーブル自体を削除" },
  { id: "shared-lock", term: "共有ロック", category: "データベース", hint: "閲覧席は複数人で共有できるが、編集中の人とは同居できない。", answer: "読み取り時に使うロック。共有ロック同士は共存できるが、排他ロックとは競合する。", level: 1 },
  { id: "dcl", term: "DCL", category: "データベース", hint: "データでも構造でもなく、誰に何を許すかを制御する。", hardPrompt: "利用者への権限付与と権限取消しを行う命令が分類されるSQL言語は？", answer: "Data Control Language。GRANTやREVOKEなど、データベースのアクセス権限を制御する言語。", level: 1 },
  { id: "tcl", term: "TCL", category: "データベース", hint: "処理を確定するか、取り消すかを制御する。", hardPrompt: "更新の確定・取消し・途中の戻り地点を扱う命令が分類されるSQL言語は？", answer: "Transaction Control Language。COMMIT、ROLLBACK、SAVEPOINTなど、トランザクションを制御する言語。", level: 1 },
  { id: "savepoint", term: "SAVEPOINT", category: "データベース", hint: "全部を最初まで戻さず、途中の印まで戻れるようにする。", answer: "トランザクションの途中に戻り地点を設定し、その地点まで部分的にロールバックできるようにする命令。", level: 1 },
  { id: "inner-join", term: "INNER JOIN", category: "データベース", hint: "二つの名簿を重ね、両方に載っている人だけを残す。", answer: "結合条件が両方のテーブルで一致する行だけを結果に残す内部結合。", level: 1 },
  { id: "dmz", term: "DMZ", category: "セキュリティ", hint: "公開サーバを社内ネットワークへ直接置かないための領域。", answer: "インターネット公開用サーバを、社内LANから分離して配置する中間領域。", level: 1 },
  { id: "fp-method", term: "FP法", category: "マネジメント", hint: "プログラムの行数ではなく、利用者から見える入出力や機能を数える。", answer: "利用者から見た機能の種類と数を基に、ソフトウェアの規模をファンクションポイントで見積もる方法。", level: 1 },
  { id: "swot-external", term: "SWOT分析", category: "ストラテジ", hint: "内部環境と外部環境に分け、プラス要因とマイナス要因を一つずつ置く。", studyPrompt: "S・W・O・Tを、内部環境と外部環境に分けて言えますか？", hardPrompt: "内部環境の強み・弱みと、外部環境の機会・脅威を整理する分析手法は？", answer: "内部環境はStrength（強み）・Weakness（弱み）、外部環境はOpportunity（機会）・Threat（脅威）。四つを組み合わせて戦略を検討する。", level: 1 },
  { id: "ppm", term: "PPM", category: "ストラテジ", hint: "複数の事業を四つに分類し、投資配分を考える。", studyPrompt: "PPMは何を二つの軸にして、何を考える手法ですか？", hardPrompt: "市場成長率と相対的市場シェアで事業を四象限に分類し、経営資源の配分を考える手法は？", answer: "市場成長率と相対的市場シェアで事業を4分類し、経営資源の配分を考える手法。分類は花形・問題児・金のなる木・負け犬。", level: 1 },
  { id: "balance-sheet", term: "貸借対照表", category: "ストラテジ", hint: "ある時点の会社の財産と、その調達元を左右で見る。", answer: "B/S。一定時点の資産・負債・純資産を示し、財政状態を表す財務諸表。", level: 1 },
  { id: "income-statement", term: "損益計算書", category: "ストラテジ", hint: "一定期間に、いくら稼ぎ、いくら使い、いくら残ったか。", answer: "P/L。一定期間の売上・費用・利益を示し、経営成績を表す財務諸表。", level: 1 },
  { id: "incident-management", term: "インシデント管理", category: "マネジメント", hint: "まず通常サービスへ早く戻す。原因究明は別の管理プロセス。", answer: "サービス中断や品質低下から、可能な限り早く通常サービスを復旧するための管理。", level: 1, confusion: "問題管理は根本原因と再発防止を扱う" },
  { id: "problem-management", term: "問題管理", category: "マネジメント", hint: "火を消すだけでなく、なぜ燃えたかを調べて次を防ぐ。", answer: "インシデントの根本原因を特定し、恒久対策によって再発を防止するための管理。", level: 1, confusion: "インシデント管理は早期復旧を優先する" },
  { id: "service-request", term: "サービス要求", category: "マネジメント", hint: "障害ではなく、利用者からの定型的なお願い。", answer: "パスワードリセットや情報提供など、通常のサービス提供に関する利用者からの依頼。", level: 1 },
  { id: "sla", term: "SLA", category: "マネジメント", hint: "提供者と利用者が、サービス品質の目標を約束する。", hardPrompt: "サービス提供者と顧客が、稼働率や応答時間などの目標値を合意した文書は？", answer: "Service Level Agreement。サービスの品質水準について、提供者と利用者が合意した文書。", level: 1, confusion: "SLMはSLAの達成状況を管理・改善する活動" },
  { id: "service-level-management", term: "サービスレベル管理（SLM）", category: "マネジメント", hint: "合意した品質目標を測定し、改善する。", hardPrompt: "合意したサービス水準を監視し、未達時に改善する管理活動は？", answer: "Service Level Management。SLAの達成状況を監視し、サービス品質を改善する管理活動。", level: 1, confusion: "SLAは品質水準についての合意そのもの" },
  { id: "configuration-management", term: "構成管理", category: "マネジメント", hint: "サービスを構成する機器やソフトと、それらの関係を記録する。", answer: "サーバ、ネットワーク機器、ソフトウェア、文書などの構成アイテムと、その属性・関係・履歴を正確に管理する活動。", level: 1, confusion: "変更管理は変更の影響とリスクを評価・承認する" },
  { id: "change-management", term: "変更管理", category: "マネジメント", hint: "本番環境を変える前に、影響や危険性を評価して承認する。", answer: "ITサービスへの変更について、実施前に影響・リスク・優先度を評価し、承認や計画を行って障害を抑える管理。", level: 1, confusion: "構成管理は機器やソフトなどの構成情報を管理する" },
  { id: "availability-management", term: "可用性管理", category: "マネジメント", hint: "通常時に、必要なサービスを必要なとき使えるようにする。", answer: "事業が必要とする可用性を満たすため、稼働率、信頼性、保守性などを設計・測定・改善する管理。", level: 1, confusion: "ITサービス継続性管理は大規模災害などからの継続・復旧を扱う" },
  { id: "it-service-continuity-management", term: "ITサービス継続性管理", category: "マネジメント", hint: "災害や重大障害が起きても、重要サービスを継続・復旧できるよう備える。", answer: "災害など重大な中断時にも必要なITサービスを継続し、合意した時間内に復旧できるよう計画・訓練・対策を行う管理。", level: 1, confusion: "可用性管理は主に通常時の利用可能性を維持・改善する" },
  { id: "knowledge-management", term: "ナレッジ管理", category: "マネジメント", hint: "FAQや障害対応の経験を、個人の記憶だけにせず再利用する。", answer: "FAQ、既知のエラー、障害対応手順などの知識を収集・整理・共有し、適切な判断と迅速な対応に活用する管理。", level: 1 },
  { id: "event-management", term: "イベント管理", category: "マネジメント", hint: "機器やサービスから届く警告・通知・状態変化を見張る。", answer: "ITサービスや構成アイテムで発生する通知・警告・例外などのイベントを検知、記録、分類し、必要な対応へつなげる管理。", level: 1, confusion: "インシデント管理はサービスを早期復旧する" },
  { id: "itil", term: "ITIL", category: "マネジメント", hint: "ITサービス管理をうまく行うための、実践知をまとめた体系。", answer: "ITサービスマネジメントのベストプラクティスを体系化したフレームワーク。組織がサービス価値を継続的に生み出すための考え方を示す。", level: 1, confusion: "ISO/IEC 20000は認証にも用いられる国際規格" },
  { id: "iso-iec-20000", term: "ISO/IEC 20000", category: "マネジメント", hint: "ITサービスマネジメントの仕組みに対する国際的な要求事項。", answer: "ITサービスマネジメントシステムに関する国際規格。組織がサービスを計画・提供・評価・改善するための要求事項を定める。", level: 1, confusion: "ITILはベストプラクティスをまとめたフレームワーク" },
  { id: "kpi", term: "KPI", category: "マネジメント", hint: "目標に近づいているかを途中で測る重要なものさし。", answer: "Key Performance Indicator。組織や業務が目標達成へどの程度進んでいるかを測定する重要業績評価指標。", level: 1 },
  { id: "evm-cost", term: "EVM", category: "マネジメント", hint: "作業の進み具合を金額換算した出来高で管理する。", studyPrompt: "EVMは何を使って、何を管理する手法ですか？", hardPrompt: "PV・EV・ACを使い、プロジェクトの進捗とコストをまとめて管理する手法は？", answer: "出来高を使って、プロジェクトの進捗とコストを管理する手法。PVは計画価値、EVは出来高、ACは実コストを表す。", level: 1 },
  { id: "dhcp", term: "DHCP", category: "ネットワーク", hint: "端末がネットワークへ参加するとき、住所などを自動でもらう。", answer: "IPアドレス、サブネットマスク、デフォルトゲートウェイなどを端末へ自動的に割り当てるプロトコル。", level: 1 },
  { id: "oauth", term: "OAuth", category: "セキュリティ", hint: "パスワードを渡さず、別サービスへ限定的な操作権を渡す。", answer: "利用者の認証情報を共有せず、他サービスが利用者の代わりに資源へアクセスする権限を認可する仕組み。", level: 1, confusion: "OAuthは認可。認証そのものではない" },
  { id: "crl", term: "CRL", category: "セキュリティ", hint: "有効期限前でも、もう信用してはいけない証明書の一覧。", answer: "Certificate Revocation List。CAが発行する、失効したデジタル証明書の一覧。", level: 1 },
  { id: "sandbox", term: "サンドボックス", category: "セキュリティ", hint: "怪しいものを、本体に触れない透明な箱の中で動かす。", answer: "プログラムを隔離された制限環境で実行し、ほかのシステムへの影響を抑えながら挙動を確認する仕組み。", level: 1 },
  { id: "dictionary-attack", term: "辞書攻撃", category: "セキュリティ", hint: "総当たりではなく、人が選びそうな語をまとめた候補集を使う。", answer: "辞書の単語やよく使われる文字列をパスワード候補として順に試す攻撃。", level: 1 },
  { id: "analogy-estimation", term: "類推見積り", category: "マネジメント", hint: "今回とよく似た、過去の仕事をものさしにする。", answer: "過去の類似案件の実績を基に、新しい案件の規模・工数・費用などを見積もる方法。", level: 1 },
  { id: "mitm", term: "中間者攻撃（MITM）", category: "セキュリティ", hint: "二人の会話の間に入り、双方へ相手のふりをする。", answer: "通信する二者の間に割り込み、通信内容の盗聴や改ざん、なりすましを行う攻撃。", level: 1 },
  { id: "non-repudiation", term: "否認防止", category: "セキュリティ", hint: "あとから『自分は送っていない』と言い逃れできないようにする。", answer: "送信や取引を行った事実を、電子署名などによって後から否定できないようにする性質。", level: 1 },
  { id: "integrity", term: "完全性", category: "セキュリティ", hint: "CIAのI。情報が勝手に書き換えられていない状態。", answer: "情報が正確で完全であり、不正に改ざん・破壊されていないことを保証する性質。", level: 1 },
  { id: "mitb", term: "MITB", category: "セキュリティ", hint: "通信路ではなく、利用者のブラウザそのものに潜り込む。", answer: "Man-in-the-Browser。ブラウザ内のマルウェアが入力内容や表示、通信内容を盗聴・改ざんする攻撃。", level: 1 },
  { id: "bpr", term: "BPR", category: "ストラテジ", hint: "今の手順を少し改善するのではなく、仕事の流れを根本から作り直す。", answer: "Business Process Re-engineering。業務プロセスを抜本的に見直し、再設計すること。", level: 1 },
  { id: "intellectual-assets", term: "知的資産", category: "ストラテジ", hint: "建物や現金ではないが、企業の価値を生む見えない財産。", answer: "技術、ノウハウ、人材、ブランド、顧客との関係など、競争力の源泉となる無形の資産。", level: 1 },
  { id: "core-competence", term: "コアコンピタンス", category: "ストラテジ", hint: "他社が簡単にはまねできない、自社の得意技の中心。", answer: "競合他社には模倣しにくく、顧客価値と競争優位を生み出す企業の中核的な能力。", level: 1 },
  { id: "crm", term: "CRM", category: "ストラテジ", hint: "顧客との関係を長く良くし、価値を高める。", answer: "Customer Relationship Management。顧客情報を活用し、顧客との関係を維持・強化する経営手法。", level: 1 },
  { id: "scm", term: "SCM", category: "ストラテジ", hint: "材料が入り、商品が顧客へ届くまでの鎖全体を見る。", answer: "Supply Chain Management。仕入れ・製造・物流・販売までを全体最適化する経営管理手法。", level: 1 },
  { id: "erp", term: "ERP", category: "ストラテジ", hint: "会社の部門ごとに分かれた資源と情報を一つにまとめる。", answer: "Enterprise Resource Planning。会計・人事・生産・販売など企業全体の経営資源を統合管理する仕組み。", level: 1 },
  { id: "segmentation", term: "セグメンテーション", category: "ストラテジ", hint: "市場を、似た特徴やニーズを持つ集団に切り分ける。", answer: "市場を年齢・地域・ニーズなどの基準で、共通した特徴を持つ顧客グループへ分割すること。", level: 1 },
  { id: "targeting", term: "ターゲティング", category: "ストラテジ", hint: "分けた市場の中から、自社が狙う場所を選ぶ。", answer: "セグメンテーションで分けた市場のうち、自社が対象とする顧客層を選定すること。", level: 1 },
  { id: "positioning", term: "ポジショニング", category: "ストラテジ", hint: "選んだ顧客の頭の中で、競合と違う席を取る。", answer: "対象市場で競合と差別化し、顧客に認識してほしい自社・製品の位置付けを決めること。", level: 1 },
  { id: "pest", term: "PEST分析", category: "ストラテジ", hint: "企業を取り巻く大きな外部環境を、四つの頭文字で見る。", answer: "Politics（政治）、Economy（経済）、Society（社会）、Technology（技術）の観点でマクロ環境を分析する手法。", level: 1 },
  { id: "product-life-cycle", term: "プロダクトライフサイクル", category: "ストラテジ", hint: "製品にも、生まれて伸び、安定し、衰える流れがある。", answer: "製品が市場へ導入されてから、導入期・成長期・成熟期・衰退期をたどる考え方。", level: 1 },
  { id: "functional-dependency", term: "関数従属", category: "データベース", hint: "ある列の値が決まれば、別の列の値も一つに決まる関係。", hardPrompt: "社員番号が決まると社員名が一意に決まる。この属性間の関係を何という？", answer: "属性Aの値を決めると属性Bの値が一意に決まる関係。A→Bと表し、正規化を考える基礎になる。", level: 1 },
  { id: "partial-functional-dependency", term: "部分関数従属", category: "データベース", hint: "複合主キーの全部ではなく、その一部分だけで決まってしまう属性がある。", hardPrompt: "主キーが学生番号と科目番号の組合せなのに、学生名が学生番号だけで決まる依存関係は？", answer: "非キー属性が複合主キーの一部だけに関数従属する状態。これを取り除くのが第2正規形。", level: 1, confusion: "推移的関数従属を取り除くのは第3正規形" },
  { id: "transitive-functional-dependency", term: "推移的関数従属", category: "データベース", hint: "主キーから直接ではなく、別の非キー属性を経由して決まる。", hardPrompt: "社員番号から部署番号が決まり、部署番号から部署名が決まる。この部署名の依存関係は？", answer: "主キー→非キー属性A→非キー属性Bのように、非キー属性を経由して依存する状態。これを取り除くのが第3正規形。", level: 1, confusion: "部分関数従属を取り除くのは第2正規形" },
  { id: "unique-constraint", term: "UNIQUE制約", category: "データベース", hint: "主キーではない列でも、同じ値の重複を許したくない。", answer: "指定した列または列の組合せで値の重複を禁止する制約。主キーと異なり、DBMSによってはNULLを許容する。", level: 1 },
  { id: "check-constraint", term: "CHECK制約", category: "データベース", hint: "年齢は0以上など、保存できる値にルールを設ける。", answer: "列へ入力・更新できる値が指定した条件を満たすように制限する制約。", level: 1 },
  { id: "referential-integrity", term: "参照整合性", category: "データベース", hint: "注文に書かれた顧客番号の顧客が、顧客表に存在しなければならない。", answer: "外部キーの値が参照先テーブルの主キーなどに存在するかNULLであることを保証し、表間の関係を正しく保つ性質。", level: 1 },
  { id: "materialized-view", term: "マテリアライズドビュー", category: "データベース", hint: "検索文だけを保存する通常のビューと違い、検索結果そのものを持つ。", answer: "SELECTの検索結果を実データとして保存するビュー。参照を高速化できるが、元データとの同期・更新が必要。", level: 1 },
  { id: "bplus-tree-index", term: "B+木インデックス", category: "データベース", hint: "キーを順序どおり木に並べ、葉をたどって連続した範囲も探せる。", answer: "平衡木構造を使うインデックス。完全一致に加え、大小比較・範囲検索・並べ替えに強い。", level: 1 },
  { id: "hash-index", term: "ハッシュインデックス", category: "データベース", hint: "値から保管場所を直接求めるので、等しいかどうかを探すのが得意。", answer: "ハッシュ値で格納位置を求めるインデックス。完全一致検索に強いが、範囲検索や順序検索には向かない。", level: 1, confusion: "範囲検索に強いのはB+木インデックス" },
  { id: "composite-index", term: "複合インデックス", category: "データベース", hint: "一つではなく、複数の列を決められた順番で組み合わせる。", answer: "複数列を組み合わせて作るインデックス。検索条件が先頭列から一致するかなど、列の順序が効き方に影響する。", level: 1 },
  { id: "replication", term: "レプリケーション", category: "データベース", hint: "同じデータの写しを別のDBにも持たせる。", hardPrompt: "同じデータを複数のDBへ複製し、可用性や読取り性能を高める仕組みは？", answer: "同じデータを複数のデータベースへ複製する仕組み。可用性の向上や読取り負荷の分散に使う。", level: 1, confusion: "シャーディングはデータを分割して複数DBへ持たせる" },
  { id: "sharding", term: "シャーディング", category: "データベース", hint: "コピーではなく、データの担当範囲を分けて持つ。", answer: "データを複数のデータベースへ分割して保持し、負荷を分散する方式。", level: 1, confusion: "レプリケーションは同じデータを複製する" },
  { id: "sync-replication", term: "同期レプリケーション", category: "データベース", hint: "複製先への反映を確認してから更新完了とする。", hardPrompt: "レプリカへの反映完了を待ってから、更新完了を返すレプリケーション方式は？", answer: "レプリカへの反映を待ってから更新を完了する方式。整合性を保ちやすいが、応答が遅くなりやすい。", level: 1, confusion: "非同期方式はレプリカへの反映を待たない" },
  { id: "async-replication", term: "非同期レプリケーション", category: "データベース", hint: "複製先への反映を待たずに更新完了とする。", hardPrompt: "レプリカへの反映完了を待たず、先に更新完了を返すレプリケーション方式は？", answer: "レプリカへの反映を待たずに更新を完了する方式。高速だが、反映遅延や障害時のデータ欠損が起こり得る。", level: 1, confusion: "同期方式はレプリカへの反映を待つ" },
  { id: "conceptual-design", term: "概念設計", category: "データベース", hint: "業務上の対象と、その関係を整理する段階。", hardPrompt: "DBMSや表の形を決める前に、業務上のエンティティと関係を整理する設計段階は？", answer: "業務上のエンティティや、その関係を整理する段階。DBMSなどの実装には依存しない。", level: 1 },
  { id: "logical-design", term: "論理設計", category: "データベース", hint: "業務上の対象を、表やキーへ落とし込む段階。", hardPrompt: "テーブル、列、主キー、外部キー、正規化などを決める設計段階は？", answer: "テーブル、列、キー、正規化など、データベースの論理的な構造を決める段階。", level: 1 },
  { id: "physical-design", term: "物理設計", category: "データベース", hint: "性能や容量を考えて、DBMS上の実装を決める段階。", hardPrompt: "インデックス、格納方法、パーティションなどDBMS上の実装を決める設計段階は？", answer: "インデックスや格納方法など、DBMS上の物理的な実装を決める段階。", level: 1 },
  { id: "read-uncommitted", term: "READ UNCOMMITTED", category: "データベース", hint: "まだ確定していない更新も見える、最も低い分離レベル。", hardPrompt: "未コミットの更新値まで読める、最も低いトランザクション分離レベルは？", answer: "未コミットのデータも読める、最も低い分離レベル。ダーティリードが起こり得る。", level: 1 },
  { id: "read-committed", term: "READ COMMITTED", category: "データベース", hint: "確定したデータだけを読む。", hardPrompt: "コミット済みのデータだけを読み、ダーティリードを防ぐ分離レベルは？", answer: "コミット済みのデータだけを読む分離レベル。ダーティリードは防ぐが、再読時に値が変わることはある。", level: 1 },
  { id: "repeatable-read", term: "REPEATABLE READ", category: "データベース", hint: "同じ行を読み直しても、同じ値になるようにする。", hardPrompt: "同じトランザクション内で、同じ行の再読結果を保つ分離レベルは？", answer: "同じ行を再び読んでも同じ値を保証する分離レベル。ノンリピータブルリードを防ぐ。", level: 1 },
  { id: "serializable-isolation", term: "SERIALIZABLE", category: "データベース", hint: "同時実行でも、一つずつ順番に処理した結果にする。", hardPrompt: "直列実行と同等の結果を保証する、最も高いトランザクション分離レベルは？", answer: "直列実行と同等の結果を保証する、最も高い分離レベル。ファントムリードも防ぐ。", level: 1 },
  { id: "primary-key", term: "主キー", category: "データベース", hint: "各行を一つに特定する代表のキー。", answer: "テーブルの各行を一意に識別するキー。重複とNULLは許されない。", level: 1 },
  { id: "candidate-key", term: "候補キー", category: "データベース", hint: "行を一意に特定できる、主キーの候補。", answer: "行を一意に識別でき、余分な属性を含まない最小のキー。候補キーの一つが主キーとして選ばれる。", level: 1, confusion: "外部キーは別テーブルのキーを参照する" },
  { id: "one-to-many", term: "1対多", category: "データベース", hint: "一人の顧客が複数の注文を持つような関係。", answer: "一方の1行に対して、もう一方の複数行が対応する関係。通常は「多」側に外部キーを置く。", level: 1 },
  { id: "many-to-many", term: "多対多", category: "データベース", hint: "学生は複数科目を取り、科目にも複数学生がいる。", answer: "双方の1行が相手側の複数行と対応する関係。リレーショナルDBでは中間テーブルを使って二つの1対多に分ける。", level: 1 },
  { id: "junction-table", term: "中間テーブル", category: "データベース", hint: "多対多の二者の間に置き、組合せを記録する。", answer: "多対多の関係を表現するため、両テーブルの主キーを外部キーとして保持するテーブル。関連テーブルとも呼ぶ。", level: 1 },
  { id: "er-diagram", term: "ER図", category: "データベース", hint: "実体と、その間の関係を図で表す。", answer: "Entity Relationship Diagram。エンティティ、属性、リレーションシップを図示し、データ構造を整理する。", level: 1 },
  { id: "first-normal-form", term: "第1正規形", category: "データベース", hint: "一つのセルに複数の値を詰め込まない。", hardPrompt: "一つのセルに電話番号をカンマ区切りで複数保存している表が、まず満たしていない正規形は？", answer: "各列の値を単一の値にし、繰返し項目をなくした形。表の各セルが原子的な値を持つ。", level: 1 },
  { id: "second-normal-form", term: "第2正規形", category: "データベース", hint: "複合主キーの一部だけで決まる項目を分ける。", hardPrompt: "第1正規形の表から、複合主キーの一部だけに依存する非キー属性を分離した形は？", answer: "第1正規形を満たし、非キー属性の部分関数従属を取り除いた形。", level: 1, confusion: "第3正規形は推移的関数従属を取り除く" },
  { id: "third-normal-form", term: "第3正規形", category: "データベース", hint: "主キー以外の項目を経由して決まる項目を分ける。", hardPrompt: "第2正規形の表から、非キー属性を経由する依存関係を分離した形は？", answer: "第2正規形を満たし、非キー属性間の推移的関数従属を取り除いた形。", level: 1, confusion: "第2正規形は部分関数従属を取り除く" },
  { id: "why-split-tables", term: "更新異常", category: "データベース", hint: "同じ事実を複数行に持つと、一部だけ直して食い違うことがある。", hardPrompt: "同じ顧客住所を複数の注文行に重複保存し、一部の行だけ住所を変更したため内容が不一致になった。この問題は？", answer: "正規化されていない表で、同じ事実の重複により挿入・更新・削除時に不整合が起こること。テーブルを適切に分けて防ぐ。", level: 1, confusion: "正規化は、更新異常を防ぐためにテーブルを整理・分割する手法" },
  { id: "select-sql", term: "SELECT", category: "データベース", hint: "テーブルから必要な列や行を取り出す。", answer: "テーブルからデータを検索・取得するDML。SELECT 列名 FROM 表名の形で使う。", level: 1 },
  { id: "where-sql", term: "WHERE", category: "データベース", hint: "検索・更新・削除の対象となる行を条件で絞る。", answer: "SQLで処理対象の行を条件指定する句。SELECT、UPDATE、DELETEなどで使用する。", level: 1 },
  { id: "insert-sql", term: "INSERT", category: "データベース", hint: "テーブルへ新しい行を加える。", answer: "テーブルへ新しい行を追加するDML。INSERT INTO 表名 (...) VALUES (...) の形で使う。", level: 1 },
  { id: "update-sql", term: "UPDATE", category: "データベース", hint: "既にある行の値を書き換える。条件を書き忘れると全行が対象。", answer: "既存データを更新するDML。UPDATE 表名 SET 列=値 WHERE 条件の形で使う。", level: 1 },
  { id: "delete-sql", term: "DELETE", category: "データベース", hint: "条件に合う行を削除する。テーブル自体は残る。", answer: "テーブルから行を削除するDML。WHEREを省略すると全行が対象になるが、テーブル構造は残る。", level: 1, confusion: "DROPはテーブル自体、TRUNCATEは全行を高速に削除する" },
  { id: "left-join", term: "LEFT JOIN", category: "データベース", hint: "左側は全て残し、右側に一致がなければNULL。", answer: "左側テーブルの全行を残し、右側の一致する行を結合する外部結合。一致しない右側の列はNULLになる。", level: 1, confusion: "INNER JOINは両方に一致する行だけを残す" },
  { id: "revoke", term: "REVOKE", category: "データベース", hint: "利用者に与えた操作権を取り上げる。", answer: "ユーザーやロールに与えられた権限を取り消すDCL。権限を与えるのはGRANT。", level: 1 },
  { id: "commit", term: "COMMIT", category: "データベース", hint: "ここまでの更新を確定する。", answer: "トランザクション内の更新を確定し、永続化するTCL。確定後は通常のROLLBACKでは元に戻せない。", level: 1 },
  { id: "rollback", term: "ROLLBACK", category: "データベース", hint: "未確定の更新を取り消し、開始前などへ戻す。", answer: "トランザクション内の未コミットの更新を取り消すTCL。SAVEPOINTを指定して途中まで戻すこともできる。", level: 1, confusion: "ロールフォワードはログから更新を再反映する障害復旧" },
  { id: "acid", term: "ACID特性", category: "データベース", hint: "トランザクションが守る四つの性質。", answer: "原子性（Atomicity）、一貫性（Consistency）、独立性・分離性（Isolation）、永続性（Durability）の四つの性質。", level: 1 },
  { id: "exclusive-lock", term: "専有ロック（排他ロック）", category: "データベース", hint: "更新用。ほかの読み書きを待たせる強いロック。", answer: "データを更新するときに取得するロック。専有ロック中は、ほかのトランザクションの共有ロックや専有ロックと共存できない。", level: 1, confusion: "共有ロック同士は共存できる" },
  { id: "full-backup", term: "フルバックアップ", category: "データベース", hint: "対象データを毎回すべて保存する。", hardPrompt: "対象データ全体を毎回保存するバックアップ方式は？", answer: "対象データ全体を毎回保存する方式。復元は単純だが、保存時間と容量が大きい。", level: 1 },
  { id: "differential-backup", term: "差分バックアップ", category: "データベース", hint: "直近のフル以降に変わった分を保存する。", hardPrompt: "直近のフルバックアップ以降の変更分を毎回保存する方式は？", answer: "直近のフルバックアップ以降に変更されたデータを保存する方式。復元にはフルと最新の差分を使う。", level: 1, confusion: "増分は直前のバックアップ以降の変更だけを保存する" },
  { id: "incremental-backup", term: "増分バックアップ", category: "データベース", hint: "直前のバックアップ以降に変わった分だけを保存する。", hardPrompt: "直前のバックアップ以降の変更分だけを保存する方式は？", answer: "直前のバックアップ以降に変更されたデータだけを保存する方式。復元には一連の増分が必要。", level: 1, confusion: "差分は直近のフル以降の変更を毎回保存する" },
  { id: "database-index", term: "インデックス", category: "データベース", hint: "本の索引のように、目的の行を速く探すための構造。", answer: "検索を高速化するためのデータ構造。検索は速くなるが、更新時の負荷や保存容量が増える。", level: 1 },
  { id: "optimizer", term: "オプティマイザ", category: "データベース", hint: "SQLをどう実行すれば速いか、候補から選ぶ。", answer: "SQLの複数の実行方法をコストなどで評価し、結合順序やインデックス利用を含む効率的な実行計画を選ぶ機能。", level: 1 },
  { id: "execution-plan", term: "実行計画", category: "データベース", hint: "表を読む順番や索引利用など、SQL実行の手順書。", answer: "DBMSがSQLを処理する具体的な手順。アクセス方法、結合方法、結合順序、推定コストなどを示す。", level: 1 },
  { id: "partitioning", term: "パーティショニング", category: "データベース", hint: "一つの大きな表を、日付や範囲などで内部的に分ける。", answer: "大規模なテーブルやインデックスを範囲・リスト・ハッシュなどで複数領域に分割し、管理性や性能を高める方式。", level: 1, confusion: "シャーディングは複数DBへデータを分散する" },
  { id: "view", term: "VIEW", category: "データベース", hint: "検索結果を表のように見せるが、通常は結果自体を保存しない。", answer: "SELECT文を定義として保存し、仮想的なテーブルとして扱う仕組み。複雑な検索の簡略化やアクセス制御に使う。", level: 1, confusion: "マテリアライズドビューは検索結果を実データとして保存する" },
  { id: "not-null", term: "NOT NULL制約", category: "データベース", hint: "その列を空欄にはできない。", answer: "指定した列にNULLを格納することを禁止し、必ず値が入るようにする制約。", level: 1 },
  { id: "two-phase-commit", term: "2相コミット", category: "データベース", hint: "複数DBへ、準備確認と確定の二段階で一斉に反映する。", answer: "分散トランザクションで、各参加者にコミット可能か確認する準備フェーズと、全体を確定・取消する決定フェーズに分けて原子性を保つ方式。", level: 1 },
  { id: "failover", term: "フェイルオーバー", category: "データベース", hint: "稼働中の系が故障したら、待機系へ役割を切り替える。", answer: "障害発生時に、処理を現用系から待機系やレプリカへ自動または手動で切り替えてサービスを継続すること。", level: 1 },
  { id: "oltp", term: "OLTP", category: "データベース", hint: "注文や入出金など、日常業務の短い処理を大量に扱う。", answer: "Online Transaction Processing。多数の短いトランザクションをリアルタイムに処理する方式。", level: 1 },
  { id: "olap", term: "OLAP", category: "データベース", hint: "大量の履歴を多角的に集計し、意思決定に使う。", answer: "Online Analytical Processing。蓄積した大量データを多次元的に集計・分析する方式。", level: 1, confusion: "OLTPは日常業務の短い更新処理を扱う" },
  { id: "data-warehouse", term: "データウェアハウス（DWH）", category: "データベース", hint: "複数の業務データを、分析用にまとめて蓄積する。", answer: "分析のために、複数システムのデータを統合・蓄積するデータベース。", level: 1, confusion: "データレイクは多様なデータを元の形式に近いまま蓄積する" },
  { id: "etl", term: "ETL", category: "データベース", hint: "取り出し、整え、分析先へ入れる三段階。", answer: "Extract（抽出）、Transform（変換）、Load（格納）。元システムのデータを加工してDWHなどへ取り込む処理。", level: 1 },
  { id: "data-mart", term: "データマート", category: "データベース", hint: "全社データから、特定部門や目的に必要な部分を切り出す。", answer: "営業や財務など、特定の部門・用途に絞って整理した小規模な分析用データベース。", level: 1 },
  { id: "data-lake", term: "データレイク", category: "データベース", hint: "構造化前のデータも含め、元の形に近いまま大量にためる。", answer: "構造化・半構造化・非構造化データを、加工前の形式を含めて大規模に蓄積するデータ基盤。", level: 1, confusion: "DWHは分析しやすい形へ統合・整理したデータを蓄積する" },
  { id: "star-schema", term: "スター・スキーマ", category: "データベース", hint: "中央の数値データを、周囲の分析軸が星形に囲む。", answer: "売上などを持つ中央のファクトテーブルと、商品・顧客・時間などのディメンションテーブルで構成する分析用のモデル。", level: 1 },
  { id: "exploit-code", term: "エクスプロイトコード", category: "セキュリティ", hint: "見つかった弱点を、実際の侵入や不正操作に利用するプログラム。", answer: "ソフトウェアやシステムの脆弱性を悪用し、不正な処理の実行や権限奪取などを行うためのコード。検証用にも攻撃用にも使われ得る。", level: 1 },
  { id: "external-schema", term: "外部スキーマ", category: "データベース", hint: "同じデータベースでも、利用者やアプリごとに必要な見え方を定める。", hardPrompt: "三層スキーマ構造で、営業担当者用と経理担当者用のように利用者別の見え方を定義する層は？", answer: "三層スキーマ構造で、利用者やアプリケーションから見えるデータの論理的な形を定義する層。ビューに相当する。", level: 1, confusion: "概念スキーマはデータベース全体の論理構造を表す" },
  { id: "conceptual-schema", term: "概念スキーマ", category: "データベース", hint: "利用者ごとの見え方ではなく、データベース全体の論理構造を表す。", hardPrompt: "三層スキーマ構造で、表・属性・関係・制約などデータベース全体の論理構造を定義する層は？", answer: "三層スキーマ構造で、データベース全体の論理的な構造や制約を定義する層。外部スキーマと内部スキーマの間に位置する。", level: 1, confusion: "外部スキーマは利用者ごとの見え方、内部スキーマは物理的な格納方法" },
  { id: "internal-schema", term: "内部スキーマ", category: "データベース", hint: "ファイル編成や索引など、データを記憶装置へどう格納するかを表す。", hardPrompt: "三層スキーマ構造で、ファイル編成・格納位置・インデックスなど物理的な記憶方法を定義する層は？", answer: "三層スキーマ構造で、データの物理的な格納方法やアクセス経路を定義する層。記憶スキーマとも呼ばれる。", level: 1, confusion: "概念スキーマはデータベース全体の論理構造を表す" },
  { id: "false-negative", term: "フォールスネガティブ", category: "セキュリティ", hint: "本当は攻撃なのに、検査を通過させてしまう見逃し。", hardPrompt: "侵入検知システムが、実際の攻撃通信を正常通信と判定して警告しなかった。この判定誤りは？", answer: "実際には異常・攻撃であるものを、正常であると誤って判定すること。検知漏れや見逃しを意味する。", level: 1, confusion: "フォールスポジティブは正常なものを異常と誤判定する" },
  { id: "false-positive", term: "フォールスポジティブ", category: "セキュリティ", hint: "本当は正常なのに、攻撃として警告してしまう誤検知。", hardPrompt: "侵入検知システムが、正常な業務通信を攻撃と判定して警告した。この判定誤りは？", answer: "実際には正常であるものを、異常・攻撃であると誤って判定すること。誤検知を意味する。", level: 1, confusion: "フォールスネガティブは実際の攻撃を正常と判定する見逃し" },
  { id: "warm-standby", term: "ウォームスタンバイ", category: "マネジメント", hint: "予備系を完全停止にはせず、ある程度起動した状態で切替えを待つ。", hardPrompt: "待機系を部分的に起動しておき、障害時に追加の起動や設定をして切り替える方式は？", answer: "待機系を部分的に起動・準備した状態で待機させ、障害時に追加の起動や設定を行って切り替える方式。コールドより速く、ホットより低コスト。", level: 1 },
  { id: "hot-standby", term: "ホットスタンバイ", category: "マネジメント", hint: "予備系もすぐ処理を引き継げる稼働状態で待機する。", hardPrompt: "待機系を稼働状態に保ち、現用系の障害時に短時間で処理を引き継げるようにする方式は？", answer: "待機系を稼働状態に保ち、データなどを同期して障害時にすぐ切り替えられるようにする方式。復旧は速いがコストが高い。", level: 1, confusion: "ウォームスタンバイは切替え時に追加の起動や設定が必要" },
  { id: "cold-standby", term: "コールドスタンバイ", category: "マネジメント", hint: "予備系は通常停止し、障害が起きてから起動・設定する。", hardPrompt: "待機系を通常は停止させ、障害発生後に起動やデータ復旧を行って切り替える方式は？", answer: "待機系を停止または最小限の状態で用意し、障害時に起動・設定・データ復旧を行う方式。低コストだが復旧に時間がかかる。", level: 1, confusion: "ホットスタンバイは待機系を稼働状態にして短時間で切り替える" },
  { id: "rto", term: "RTO", category: "マネジメント", hint: "障害が起きてから、何時間以内にサービスを戻すか。", hardPrompt: "災害発生後、サービスを4時間以内に再開するという目標で示される指標は？", answer: "Recovery Time Objective。災害や障害による停止後、サービスを復旧させるまでの目標時間。", level: 1, confusion: "RPOはどの時点のデータまで復旧するかを示す" },
  { id: "rpo", term: "RPO", category: "マネジメント", hint: "障害発生時点から見て、どこまで過去のデータに戻ってよいか。", hardPrompt: "障害時に、最大1時間前のデータまで失われても許容するという目標で示される指標は？", answer: "Recovery Point Objective。障害時に許容できるデータ損失量を、復旧すべきデータの時点で表した目標。", level: 1, confusion: "RTOは復旧完了までの目標時間を示す" },
  { id: "externalization", term: "SECIモデル", category: "マネジメント", hint: "個人の経験を組織の知識へ広げる考え方。", hardPrompt: "暗黙知と形式知を相互変換しながら、組織の知識を生み出すモデルは？", answer: "暗黙知と形式知を相互変換しながら、組織の知識を生み出すモデル。共同化・表出化・連結化・内面化の四つで表す。", level: 1 },
  { id: "initiating-process-group", term: "プロジェクトのプロセス群", category: "マネジメント", hint: "プロジェクト管理の活動を、開始から完了までのまとまりで分ける。", hardPrompt: "プロジェクト管理活動を、立上げ・計画・実行・監視コントロール・終結に分けたものは？", answer: "プロジェクト管理の活動を五つに分けたもの。立上げ・計画・実行・監視コントロール・終結がある。", level: 1 },
  { id: "metadata", term: "メタデータ", category: "データベース", hint: "図書館の本に対する、タイトル・著者・分類番号のような情報。", answer: "表名、列名、データ型、制約など、データの構造や性質を説明する情報。", level: 3 },
  { id: "tuckman-model", term: "タックマンモデル", category: "マネジメント", hint: "チームが結成されてから解散するまでの発達段階。", hardPrompt: "チームの発達を、形成期・混乱期・統一期・機能期・解散期で表すモデルは？", answer: "チームの発達過程を表すモデル。形成期・混乱期・統一期・機能期・解散期の5段階がある。", level: 1 },
  { id: "mes", term: "MES", category: "ストラテジ", hint: "工場の製造現場で、作業や進捗を管理する。", hardPrompt: "工場で作業指示・進捗・品質・設備稼働などを管理するシステムは？", answer: "Manufacturing Execution System（製造実行システム）。製造現場の作業や進捗、品質などを管理する。", level: 1, confusion: "ERPは企業全体、MESは製造現場を管理する" },
  { id: "scala-language", term: "Scala", category: "テクノロジ", hint: "オブジェクト指向と関数型の両方を使える言語。", hardPrompt: "オブジェクト指向と関数型の特徴を持ち、JVM上でも動くプログラミング言語は？", answer: "オブジェクト指向と関数型の特徴を併せ持つ、JVM上でも動くプログラミング言語。", level: 1 },
  { id: "delphi-method", term: "デルファイ法", category: "ストラテジ", hint: "専門家への質問を繰り返し、意見を収束させる。", hardPrompt: "専門家へ匿名で質問を繰り返し、集計結果を示しながら意見を収束させる手法は？", answer: "複数の専門家へ匿名の質問を繰り返し、意見を収束させる予測手法。", level: 1, confusion: "ブレーンストーミングは自由にアイデアを広げる手法" },
  { id: "brainstorming", term: "ブレーンストーミング", category: "ストラテジ", hint: "批判せず、まず多くのアイデアを出す。", hardPrompt: "批判を控え、自由な発想で多数のアイデアを出す手法は？", answer: "批判を避けて自由に多くのアイデアを出し、発想を広げる手法。", level: 1, confusion: "デルファイ法は専門家への反復質問で意見を収束させる" },
  { id: "feasibility-study", term: "フィージビリティスタディ", category: "ストラテジ", hint: "本格着手の前に、実現できるかを調べる。", hardPrompt: "計画への着手前に、技術・費用・期間などから実現可能性を評価する調査は？", answer: "計画へ本格着手する前に、技術・費用・期間などから実現可能性を評価する調査。", level: 1 },
  { id: "reverse-proxy", term: "リバースプロキシ", category: "ネットワーク", hint: "Webサーバの手前で要求を受ける代理窓口。", hardPrompt: "外部からの要求を受け、背後のWebサーバへ転送する中継サーバは？", answer: "Webサーバの手前で要求を受け、背後のサーバへ転送する仕組み。負荷分散などに使う。", level: 1, confusion: "フォワードプロキシは利用者側の代理" },
  { id: "marketing-4p-4c", term: "4P", category: "ストラテジ", hint: "売り手側からマーケティング施策を考える四つの要素。", hardPrompt: "Product・Price・Place・Promotionからなる、売り手視点のマーケティング要素は？", answer: "売り手視点のマーケティング要素。Product（製品）・Price（価格）・Place（流通）・Promotion（販促）からなる。", level: 1, confusion: "4Cは買い手視点" },
  { id: "marketing-4c", term: "4C", category: "ストラテジ", hint: "買い手側から価値や負担、便利さ、対話を考える。", hardPrompt: "Customer Value・Cost・Convenience・Communicationからなる、買い手視点の要素は？", answer: "買い手視点のマーケティング要素。Customer Value（顧客価値）・Cost（顧客コスト）・Convenience（利便性）・Communication（対話）からなる。", level: 1, confusion: "4Pは売り手視点" },
  { id: "immersion-cooling", term: "液浸冷却", category: "テクノロジ", hint: "サーバの熱を空気ではなく液体へ逃がす。", hardPrompt: "電子機器を絶縁性の液体に浸して熱を取り除く冷却方式は？", answer: "サーバなどを絶縁性の冷却液へ浸し、液体で直接冷却する方式。", level: 1 },
  { id: "iot", term: "IoT", category: "ストラテジ", hint: "機器や設備をネットワークにつなぐ。", hardPrompt: "センサを備えた機器をネットワークにつなぎ、情報収集や遠隔制御に使う仕組みは？", answer: "Internet of Things（モノのインターネット）。機器をネットワークにつなぎ、情報収集や遠隔制御に活用する仕組み。", level: 1 },
  { id: "soa", term: "SOA", category: "テクノロジ", hint: "業務機能を独立したサービスとして組み合わせる。", hardPrompt: "業務機能を再利用可能なサービスとして分け、連携させる設計思想は？", answer: "Service-Oriented Architecture（サービス指向アーキテクチャ）。業務機能を独立したサービスとして連携させる設計思想。", level: 1 },
  { id: "mm1-queue", term: "M/M/1待ち行列：モデルと利用率", category: "テクノロジ", hint: "ランダムに到着する客を、一つの窓口で処理するモデル。", studyPrompt: "M/M/1の三つの特徴と、利用率の式を言えますか？", hardPrompt: "到着と処理時間がランダムで、窓口が一つ、利用率をλ÷μで表す待ち行列モデルは？", answer: "到着がランダム、処理時間もランダムで、窓口が一つの待ち行列モデル。利用率は到着率λ÷処理率μで求める。", level: 1, collection: "special" },
  { id: "mm1-system-time", term: "M/M/1待ち行列：時間計算", category: "テクノロジ", hint: "待ち時間・処理時間・系内時間を式で求める計算問題。", studyPrompt: "M/M/1の時間計算を問題演習として確認しますか？", hardPrompt: "到着率λと処理率μから、平均系内時間や平均待ち時間を求める問題は？", answer: "M/M/1で平均系内時間や平均待ち時間を求める計算問題。公式の理解は別途問題演習で確認する。", level: 1, collection: "special" },
  { id: "linear-search", term: "線形探索", category: "テクノロジ", hint: "並び順に頼らず、先頭から一件ずつ確かめる。", hardPrompt: "未整列のn件を先頭から順に比較し、探す回数が件数に比例する探索法は？", answer: "先頭から順番に一件ずつ比較する探索法。整列は不要だが、最悪の場合n件を調べるため計算量はO(n)。", level: 1, collection: "special" },
  { id: "binary-search", term: "二分探索", category: "テクノロジ", hint: "整列済みの範囲を、比較のたびに半分に絞る。", hardPrompt: "整列済みデータを半分ずつ絞り、O(log n)で探す探索法は？", answer: "整列済みデータの探索範囲を半分ずつ減らす方法。計算量はO(log n)。", level: 1, collection: "special", confusion: "線形探索は先頭から順に調べるためO(n)" },
  { id: "hash-search", term: "ハッシュ探索", category: "テクノロジ", hint: "キーから保存場所の目安を計算して探す。", hardPrompt: "キーから位置を計算する表を使い、衝突が少なければ平均O(1)で探せる方法は？", answer: "キーのハッシュ値から格納先を求めて探す方法。探索は平均O(1)だが、衝突が多いと遅くなり、常にO(1)とは限らない。", level: 1, collection: "special", confusion: "二分探索は整列済みデータを半分ずつ絞り、O(log n)で探す" },
  { id: "parity-check", term: "パリティチェック", category: "テクノロジ", hint: "1の個数の偶数・奇数を使って確認する。", hardPrompt: "検査ビットを加え、1の個数の偶数・奇数から誤りを検出する方式は？", answer: "1の個数が偶数または奇数になるよう検査ビットを加え、誤りを検出する方式。基本的に誤りの訂正はしない。", level: 1, confusion: "ハミング符号は1ビット誤りを訂正できる" },
  { id: "crc-error-check", term: "CRC", category: "テクノロジ", hint: "連続したビット誤りの検出に強い。", hardPrompt: "生成多項式で割った余りを検査値として使う誤り検出方式は？", answer: "Cyclic Redundancy Check（巡回冗長検査）。生成多項式を使い、特に連続したビット誤りを検出する方式。", level: 1, confusion: "ハミング符号は誤り訂正、CRCは誤り検出に使う" },
  { id: "hamming-code", term: "ハミング符号", category: "テクノロジ", hint: "検査ビットから、誤った位置を特定する。", hardPrompt: "検査ビットの組合せで誤り位置を見つけ、1ビット誤りを訂正できる符号は？", answer: "誤ったビットの位置を特定できる誤り訂正符号。基本的なハミング符号は1ビット誤りを訂正できる。", level: 1, confusion: "パリティとCRCは主に誤り検出に使う" },
  { id: "logic-not", term: "NOT", category: "テクノロジ", hint: "入力の0と1をひっくり返す。", hardPrompt: "一つの入力が0なら1、1なら0を出力する論理演算は？", answer: "一つの入力を反転する否定演算。0を1に、1を0に変える。", level: 1, collection: "special" },
  { id: "logic-xor", term: "XOR", category: "テクノロジ", hint: "二つの入力が食い違う場合だけ1になる。", hardPrompt: "入力が0と1なら1、1と1なら0になる排他的な論理演算は？", answer: "二つの入力が異なるときだけ1になる排他的論理和。真理値は00→0、01→1、10→1、11→0。", level: 1, collection: "special", confusion: "NANDはANDの反転、NORはORの反転" },
  { id: "logic-nand", term: "NAND", category: "テクノロジ", hint: "二つとも1のときだけ0、それ以外は1。", hardPrompt: "二つの入力がともに1の場合だけ0となる、論理積を反転した演算は？", answer: "AND（論理積）の結果を反転する否定論理積。00→1、01→1、10→1、11→0。", level: 1, collection: "special", confusion: "NORはORの反転で、両方0のときだけ1" },
  { id: "logic-nor", term: "NOR", category: "テクノロジ", hint: "二つとも0のときだけ1、それ以外は0。", hardPrompt: "二つの入力がともに0の場合だけ1となる、論理和を反転した演算は？", answer: "OR（論理和）の結果を反転する否定論理和。00→1、01→0、10→0、11→0。", level: 1, collection: "special", confusion: "NANDはANDの反転で、両方1のときだけ0" },
  { id: "roc-curve", term: "ROC曲線", category: "テクノロジ", hint: "検出できる割合と、誤検出する割合の関係を見る。", hardPrompt: "縦軸を真陽性率、横軸を偽陽性率として分類性能を表す曲線は？", answer: "二値分類で、真陽性率と偽陽性率の関係を表す曲線。左上に近いほど性能が良い。", level: 1 },
  { id: "sampling-theorem", term: "標本化定理", category: "テクノロジ", hint: "元の信号の最高周波数に対し、十分な速さで標本化する。", studyPrompt: "最高周波数が3kHzなら、最低何kHzで標本化しますか？", hardPrompt: "標本化周波数は最高周波数の2倍以上必要とする定理は？", answer: "信号を再現するには、最高周波数の2倍以上で標本化する必要があるという定理。", level: 1, collection: "special" },
  { id: "signal-frequency", term: "周波数と周期", category: "テクノロジ", hint: "1秒当たりの回数と、1回にかかる時間の関係。", studyPrompt: "周波数と周期の関係を言えますか？", hardPrompt: "一方が大きいほど他方が小さくなる、互いに逆数の二つの量は？", answer: "周波数は1秒当たりの繰返し回数、周期は1回にかかる時間。周波数と周期は互いに逆数になる。", level: 1, collection: "special" },
  { id: "memory-first-fit", term: "First Fit", category: "テクノロジ", hint: "空き領域を先頭から順に調べる。", hardPrompt: "要求サイズが入る空き領域を先頭から探し、最初に見つかった領域へ割り当てる方式は？", answer: "要求サイズが入る、最初に見つかった空き領域へ割り当てる方式。", level: 1, confusion: "Best Fitは入る中で最小、Worst Fitは最大の領域を選ぶ" },
  { id: "memory-best-fit", term: "Best Fit", category: "テクノロジ", hint: "要求が入る空き領域のうち、余りが最も小さいものを選ぶ。", hardPrompt: "要求サイズが入る空き領域のうち、最も小さい領域へ割り当てる方式は？", answer: "要求サイズが入る空き領域のうち、最も小さい領域へ割り当てる方式。", level: 1, confusion: "First Fitは最初に見つかった領域を選ぶ" },
  { id: "memory-worst-fit", term: "Worst Fit", category: "テクノロジ", hint: "要求が入る空き領域のうち、最も大きいものを選ぶ。", hardPrompt: "要求サイズが入る空き領域のうち、最も大きい領域へ割り当てる方式は？", answer: "要求サイズが入る空き領域のうち、最も大きい領域へ割り当てる方式。", level: 1, confusion: "Best Fitは入る中で最小の領域を選ぶ" },
  { id: "binary-number", term: "2進数", category: "テクノロジ", hint: "コンピュータが基本的に扱う二つの数字で表す。", answer: "0と1だけで数を表す方法。桁が一つ上がるごとに重みが2倍になる。", level: 1 },
  { id: "hexadecimal-number", term: "16進数", category: "テクノロジ", hint: "0〜9に六つの英字を加えて表す。", answer: "0〜9とA〜Fで数を表す方法。4ビットを1桁で表せる。", level: 1 },
  { id: "complement", term: "補数", category: "テクノロジ", hint: "引き算を足し算として扱うために使う。", answer: "ある数を基準値から引いた値。コンピュータでは負数の表現や減算に使う。", level: 1 },
  { id: "fixed-point-number", term: "固定小数点数", category: "テクノロジ", hint: "小数点の位置をあらかじめ決めておく。", answer: "小数点の位置を固定して数を表す方式。扱える範囲は狭いが計算しやすい。", level: 1, confusion: "浮動小数点数は指数を使って小数点位置を動かす" },
  { id: "floating-point-number", term: "浮動小数点数", category: "テクノロジ", hint: "仮数と指数に分けて広い範囲を表す。", answer: "数を仮数と指数に分けて表す方式。非常に大きい数や小さい数を扱える。", level: 1, confusion: "固定小数点数は小数点位置を固定する" },
  { id: "overflow", term: "オーバーフロー", category: "テクノロジ", hint: "表現できる上限を計算結果が超える。", answer: "計算結果が表現可能な範囲を超え、正しく表せなくなること。", level: 1, confusion: "アンダーフローは絶対値が小さすぎる場合" },
  { id: "underflow", term: "アンダーフロー", category: "テクノロジ", hint: "値が小さすぎて表現範囲から外れる。", answer: "絶対値が表現可能な最小値より小さくなり、正しく表せなくなること。", level: 1, confusion: "オーバーフローは値が表現範囲を超える場合" },
  { id: "numerical-error", term: "誤差", category: "テクノロジ", hint: "有限の桁数で計算すると真の値との差が生じる。", answer: "丸めや打切りなどによって、計算値と真の値の間に生じる差。", level: 1 },
  { id: "logic-and", term: "AND（論理積）", category: "テクノロジ", hint: "二つの条件が両方成り立つ場合だけ真になる。", answer: "全ての入力が1のときだけ1を出力する論理演算。", level: 1, confusion: "ORは一つでも1なら1になる" },
  { id: "logic-or", term: "OR（論理和）", category: "テクノロジ", hint: "どちらか一方でも条件が成り立てば真になる。", answer: "入力のうち一つでも1なら1を出力する論理演算。", level: 1, confusion: "ANDは全てが1のときだけ1になる" },
  { id: "truth-table", term: "真理値表", category: "テクノロジ", hint: "入力の全組合せと出力を一覧にする。", answer: "論理演算について、入力の組合せごとの出力を表にしたもの。", level: 1 },
  { id: "set-theory", term: "集合", category: "テクノロジ", hint: "共通する条件を満たすものを一つのまとまりとして扱う。", answer: "一定の条件を満たす要素を、重複なくまとめたもの。", level: 1 },
  { id: "venn-diagram", term: "ベン図", category: "テクノロジ", hint: "円などの重なりでまとまり同士の関係を表す。", answer: "集合の包含関係や共通部分などを、図形の重なりで表した図。", level: 1 },
  { id: "permutation", term: "順列", category: "テクノロジ", hint: "選んだものの並び順を区別する。", answer: "複数のものから選び、順序を付けて並べる場合の並び方。", level: 1, confusion: "組合せは並び順を区別しない" },
  { id: "mathematical-combination", term: "組合せ", category: "テクノロジ", hint: "選んだものの並び順は区別しない。", answer: "複数のものから、順序を区別せずに選ぶ場合の選び方。", level: 1, confusion: "順列は並び順を区別する" },
  { id: "probability", term: "確率", category: "テクノロジ", hint: "ある出来事が起こりやすい度合いを表す。", answer: "ある事象が起こる可能性を0から1の範囲などで表した値。", level: 1 },
  { id: "expected-value", term: "期待値", category: "テクノロジ", hint: "各結果と起こりやすさを使って平均を考える。", answer: "起こり得る各値に確率を掛けて合計した、長期的な平均値。", level: 1 },
  { id: "hash-function", term: "ハッシュ関数", category: "テクノロジ", hint: "入力から固定長の値を計算する。", answer: "任意のデータから固定長のハッシュ値を求める関数。検索や改ざん検知に使う。", level: 1 },
  { id: "hash-collision", term: "衝突（シノニム）", category: "テクノロジ", hint: "異なるキーが同じ格納位置を指してしまう。", answer: "異なるキーから同じハッシュ値が得られること。シノニムともいう。", level: 1 },
  { id: "chaining", term: "チェイン法", category: "テクノロジ", hint: "同じ位置になったデータをつないで管理する。", answer: "ハッシュの衝突時に、同じ位置のデータをリストなどでつないで格納する方法。", level: 1, confusion: "オープンアドレス法は別の空き位置を探す" },
  { id: "open-addressing", term: "オープンアドレス法", category: "テクノロジ", hint: "同じ位置が埋まっていたら別の空きを探す。", answer: "ハッシュの衝突時に、一定の規則で別の空き位置を探して格納する方法。", level: 1, confusion: "チェイン法は同じ位置のデータをつないで持つ" },
  { id: "stack", term: "スタック", category: "テクノロジ", hint: "最後に入れたものを最初に取り出す。", answer: "後入れ先出し（LIFO）でデータを扱う構造。", level: 1, confusion: "キューは先入れ先出し" },
  { id: "queue", term: "キュー", category: "テクノロジ", hint: "並んだ順に先頭から取り出す。", answer: "先入れ先出し（FIFO）でデータを扱う構造。", level: 1, confusion: "スタックは後入れ先出し" },
  { id: "tree-structure", term: "木構造", category: "テクノロジ", hint: "根から枝分かれする階層で表す。", answer: "一つの根から親子関係で枝分かれする階層的なデータ構造。", level: 1 },
  { id: "binary-tree", term: "二分木", category: "テクノロジ", hint: "各節から伸びる子の数に上限がある。", answer: "各ノードが最大二つの子を持つ木構造。", level: 1 },
  { id: "b-tree", term: "B木", category: "テクノロジ", hint: "一つの節に複数のキーと枝を持てる平衡木。", answer: "各ノードに複数のキーを持つ平衡木。ディスク上のデータ検索に向く。", level: 1, confusion: "B+木は実データへの参照を主に葉へ集める" },
  { id: "breadth-first-search", term: "幅優先探索", category: "テクノロジ", hint: "近い階層から順番に調べる。", answer: "始点に近いノードから階層ごとに探索する方法。通常はキューを使う。", level: 1, confusion: "深さ優先探索は一つの枝を奥まで進む" },
  { id: "depth-first-search", term: "深さ優先探索", category: "テクノロジ", hint: "一つの枝を進めるところまで進む。", answer: "一つの経路を奥まで探索してから戻る方法。スタックや再帰を使う。", level: 1, confusion: "幅優先探索は近い階層から調べる" },
  { id: "recursion", term: "再帰", category: "テクノロジ", hint: "処理の中から同じ処理を呼び出す。", answer: "関数や手続が自分自身を呼び出して問題を小さく解く方法。", level: 1 },
  { id: "bubble-sort", term: "バブルソート", category: "テクノロジ", hint: "隣同士を比べ、大きい値を端へ送る。", answer: "隣り合う要素を比較・交換しながら整列する方法。計算量は一般にO(n²)。", level: 1 },
  { id: "selection-sort", term: "選択ソート", category: "テクノロジ", hint: "未整列部分から最小値を選び出す。", answer: "未整列部分から最小値などを選び、先頭へ順に置く整列法。", level: 1 },
  { id: "insertion-sort", term: "挿入ソート", category: "テクノロジ", hint: "整列済みの列へ一つずつ差し込む。", answer: "要素を取り出し、整列済み部分の適切な位置へ挿入する整列法。", level: 1 },
  { id: "quick-sort", term: "クイックソート", category: "テクノロジ", hint: "基準値を決めて大小に分割する。", answer: "基準値を使ってデータを大小に分割し、再帰的に整列する方法。平均計算量はO(n log n)。", level: 1 },
  { id: "merge-sort", term: "マージソート", category: "テクノロジ", hint: "分割した列を整列しながら併合する。", answer: "データを分割し、整列済みの列を併合していく整列法。計算量はO(n log n)。", level: 1 },
  { id: "heap-sort", term: "ヒープソート", category: "テクノロジ", hint: "最大値や最小値を取り出しやすい木を使う。", answer: "ヒープ構造から最大値や最小値を順に取り出して整列する方法。", level: 1 },
  { id: "computational-complexity", term: "計算量", category: "テクノロジ", hint: "入力件数が増えたときの処理時間や記憶量の増え方を見る。", answer: "アルゴリズムに必要な時間や記憶量の増え方を、入力サイズとの関係で表したもの。", level: 1 },
  { id: "big-o-constant", term: "O(1)", category: "テクノロジ", hint: "入力件数が増えても処理回数がほぼ変わらない。", answer: "入力サイズに関係なく、処理量がほぼ一定である計算量。", level: 1 },
  { id: "big-o-logarithmic", term: "O(log n)", category: "テクノロジ", hint: "入力が増えても処理量はゆるやかに増える。", answer: "入力サイズを倍にしても処理量が少しだけ増える対数時間の計算量。二分探索が代表例。", level: 1 },
  { id: "big-o-linear", term: "O(n)", category: "テクノロジ", hint: "入力件数に比例して処理量が増える。", answer: "入力サイズに比例して処理量が増える線形時間の計算量。線形探索が代表例。", level: 1 },
  { id: "big-o-n-log-n", term: "O(n log n)", category: "テクノロジ", hint: "効率のよい比較ソートでよく現れる増え方。", answer: "入力サイズにnの対数を掛けた程度で増える計算量。マージソートなどが代表例。", level: 1 },
  { id: "big-o-quadratic", term: "O(n²)", category: "テクノロジ", hint: "入力件数が2倍になると処理量はおよそ4倍になる。", answer: "入力サイズの二乗に比例して処理量が増える計算量。単純な二重ループなどで現れる。", level: 1 },
  { id: "cpu", term: "CPU", category: "テクノロジ", hint: "命令を読み出して実行する中心装置。", answer: "プログラムの命令を解釈・実行し、コンピュータ全体を制御する装置。", level: 1 },
  { id: "clock-frequency", term: "クロック周波数", category: "テクノロジ", hint: "装置を動かす基準信号が1秒に何回あるか。", answer: "CPUなどへ与えるクロック信号の1秒当たりの回数。単位はHz。", level: 1 },
  { id: "instruction-cycle", term: "命令サイクル", category: "テクノロジ", hint: "命令の取出しから実行までの流れ。", answer: "CPUが命令を取り出し、解読して実行する一連の処理。", level: 1 },
  { id: "mips", term: "MIPS", category: "テクノロジ", hint: "1秒に実行できる命令数を百万単位で表す。", answer: "CPUが1秒間に実行できる命令数を百万命令単位で表す性能指標。", level: 1, confusion: "FLOPSは浮動小数点演算の回数を表す" },
  { id: "flops", term: "FLOPS", category: "テクノロジ", hint: "数値計算で使う演算性能の指標。", answer: "1秒間に実行できる浮動小数点演算の回数を表す性能指標。", level: 1, confusion: "MIPSは命令実行数を表す" },
  { id: "register", term: "レジスタ", category: "テクノロジ", hint: "CPU内部にある最も高速な小容量の記憶場所。", answer: "CPU内部で、演算中の値や命令などを一時的に保持する高速な記憶装置。", level: 1 },
  { id: "cache-memory", term: "キャッシュメモリ", category: "テクノロジ", hint: "CPUと主記憶の速度差を埋める。", answer: "よく使うデータを保持し、CPUから主記憶へのアクセスを減らす高速な記憶装置。", level: 1 },
  { id: "main-memory", term: "主記憶", category: "テクノロジ", hint: "実行中のプログラムやデータを置く。", answer: "CPUが直接アクセスし、実行中のプログラムやデータを保持する記憶装置。", level: 1 },
  { id: "secondary-storage", term: "補助記憶装置", category: "テクノロジ", hint: "電源を切ってもデータを長く保存する。", answer: "SSDやHDDなど、プログラムやデータを長期保存する記憶装置。", level: 1 },
  { id: "cache-hit-rate", term: "キャッシュヒット率", category: "テクノロジ", hint: "必要なデータが高速な記憶領域に見つかる割合。", answer: "アクセスしたデータがキャッシュ内に存在した割合。高いほど平均アクセス時間が短くなる。", level: 1 },
  { id: "locality", term: "局所性", category: "テクノロジ", hint: "最近使った場所や近くの場所は再び使われやすい。", answer: "特定のデータやその近くが繰り返し参照されやすい性質。キャッシュの効果の根拠になる。", level: 1 },
  { id: "write-through", term: "ライトスルー", category: "テクノロジ", hint: "高速な記憶領域と主記憶へ同時に書き込む。", answer: "キャッシュへの書込みと同時に主記憶も更新する方式。整合性を保ちやすい。", level: 1, confusion: "ライトバックは追い出すときに主記憶へ書く" },
  { id: "write-back", term: "ライトバック", category: "テクノロジ", hint: "主記憶への反映を後回しにする。", answer: "まずキャッシュだけを更新し、データを追い出すときなどに主記憶へ反映する方式。", level: 1, confusion: "ライトスルーは同時に主記憶も更新する" },
  { id: "virtual-memory", term: "仮想記憶", category: "テクノロジ", hint: "補助記憶を使って主記憶より広い空間を見せる。", answer: "補助記憶の一部を使い、実際の主記憶より大きなメモリ空間を提供する仕組み。", level: 1 },
  { id: "paging", term: "ページング", category: "テクノロジ", hint: "記憶領域を同じ大きさの単位に分ける。", answer: "仮想記憶を固定長のページに分け、必要なページを主記憶へ読み込む方式。", level: 1 },
  { id: "page-fault", term: "ページフォールト", category: "テクノロジ", hint: "必要なページが主記憶にない。", answer: "参照したページが主記憶に存在せず、補助記憶から読み込む必要が生じること。", level: 1 },
  { id: "page-replacement", term: "ページ置換", category: "テクノロジ", hint: "主記憶が満杯のとき、追い出すページを選ぶ。", answer: "主記憶へ新しいページを入れるため、既存のどのページを追い出すか決める処理。", level: 1 },
  { id: "lru", term: "LRU", category: "テクノロジ", hint: "最も長い間使われていないものを選ぶ。", answer: "最も長い間参照されていないページを置換対象にする方式。", level: 1, confusion: "FIFOは最も早く読み込んだページを置換する" },
  { id: "fifo-page-replacement", term: "FIFOページ置換", category: "テクノロジ", hint: "最初に入ったものから追い出す。", answer: "主記憶へ最も早く読み込まれたページを置換対象にする方式。", level: 1, confusion: "LRUは最も長く使われていないページを置換する" },
  { id: "thrashing", term: "スラッシング", category: "テクノロジ", hint: "ページの入替えばかりで処理が進まない。", answer: "ページフォールトが多発し、ページ交換に時間を取られて性能が大きく低下する状態。", level: 1 },
  { id: "fragmentation", term: "フラグメンテーション", category: "テクノロジ", hint: "空き領域が細かく分かれて使いにくくなる。", answer: "記憶領域の空きが細かく分散するなどして、領域を効率よく使えなくなること。", level: 1 },
  { id: "tlb", term: "TLB", category: "テクノロジ", hint: "仮想アドレス変換の結果を一時保存する。", answer: "ページ表の変換結果を保持し、仮想アドレスから物理アドレスへの変換を高速化するキャッシュ。", level: 1 },
  { id: "process", term: "プロセス", category: "テクノロジ", hint: "実行中のプログラムを資源とともに管理する単位。", answer: "実行中のプログラムを、メモリなどの資源とともに管理する単位。", level: 1, confusion: "スレッドはプロセス内の実行単位" },
  { id: "thread", term: "スレッド", category: "テクノロジ", hint: "一つのプログラム内で並行して動く実行の流れ。", answer: "プロセス内の処理の実行単位。同じプロセスの資源を共有する。", level: 1, confusion: "プロセスは資源を含む実行中プログラムの単位" },
  { id: "multitasking", term: "マルチタスク", category: "テクノロジ", hint: "CPU時間を切り替えて複数処理を進める。", answer: "複数の処理を切り替えながら、見かけ上同時に実行する仕組み。", level: 1 },
  { id: "interrupt", term: "割込み", category: "テクノロジ", hint: "実行中の処理を一時止め、優先処理へ移る。", answer: "外部装置や例外などの通知を受け、現在の処理を中断して対応処理を実行する仕組み。", level: 1 },
  { id: "semaphore", term: "セマフォ", category: "テクノロジ", hint: "共有資源を使える数をカウンタで管理する。", answer: "カウンタを使って共有資源への同時アクセス数を制御する同期の仕組み。", level: 1 },
  { id: "raid0", term: "RAID0", category: "テクノロジ", hint: "複数ディスクへデータを分散するが冗長性はない。", answer: "データを複数ディスクへ分散して高速化する方式。冗長性はなく、1台の故障でデータを失う。", level: 1 },
  { id: "raid1", term: "RAID1", category: "テクノロジ", hint: "同じデータを複数ディスクへ書く。", answer: "同じデータを複数ディスクへ複製するミラーリング方式。", level: 1 },
  { id: "raid5", term: "RAID5", category: "テクノロジ", hint: "データと誤り回復用情報を複数台へ分散する。", answer: "データとパリティを複数ディスクへ分散し、1台の故障に耐える方式。", level: 1 },
  { id: "raid6", term: "RAID6", category: "テクノロジ", hint: "回復用情報を二重に持つ。", answer: "二種類のパリティを分散して持ち、同時に2台のディスク故障に耐える方式。", level: 1 },
  { id: "virtualization", term: "仮想化", category: "テクノロジ", hint: "一つの物理資源を複数の環境として使う。", answer: "サーバやOSなどの物理資源を抽象化し、複数の仮想環境として利用する技術。", level: 1 },
  { id: "hypervisor", term: "ハイパーバイザ", category: "テクノロジ", hint: "複数の仮想マシンを動かす土台。", answer: "物理マシン上で複数の仮想マシンを作成・管理するソフトウェア。", level: 1 },
  { id: "container", term: "コンテナ", category: "テクノロジ", hint: "ホストOSのカーネルを共有して実行環境を分離する。", answer: "OSのカーネルを共有しながら、アプリケーションの実行環境を分離する技術。", level: 1, confusion: "仮想マシンはゲストOSごと動かす" },
  { id: "clustering", term: "クラスタリング", category: "テクノロジ", hint: "複数台をまとめて一つのシステムとして動かす。", answer: "複数のコンピュータを連携させ、一つのシステムのように利用する構成。", level: 1 },
  { id: "load-balancing", term: "ロードバランシング", category: "ネットワーク", hint: "要求を複数のサーバへ振り分ける。", answer: "通信や処理要求を複数のサーバへ分散し、負荷集中を防ぐ仕組み。", level: 1 },
  { id: "fail-soft", term: "フェールソフト", category: "テクノロジ", hint: "故障時も機能を減らして動き続ける。", answer: "障害時に一部機能を停止・縮小し、残りの機能で運転を継続する考え方。", level: 1 },
  { id: "fail-safe", term: "フェールセーフ", category: "テクノロジ", hint: "故障したら危険の少ない状態へ移す。", answer: "故障時にシステムを安全側の状態へ移す設計思想。", level: 1 },
  { id: "foolproof", term: "フールプルーフ", category: "テクノロジ", hint: "誤操作しても事故になりにくくする。", answer: "利用者が誤った操作をしても、危険や重大な障害が起きないようにする設計。", level: 1 },
  { id: "fault-tolerant", term: "フォールトトレラント", category: "テクノロジ", hint: "一部が故障しても全体を止めない。", answer: "一部に障害が発生しても、冗長構成などによって処理を継続できる設計。", level: 1 },
  { id: "redundancy", term: "冗長化", category: "テクノロジ", hint: "故障に備えて同じ役割を複数用意する。", answer: "障害に備え、機器や経路などを予備も含めて複数用意すること。", level: 1 },
  { id: "mtbf", term: "MTBF", category: "テクノロジ", hint: "故障してから次に故障するまでの平均。", answer: "Mean Time Between Failures。故障から次の故障までの平均稼働時間。", level: 1, confusion: "MTTRは故障から復旧までの平均時間" },
  { id: "mttr", term: "MTTR", category: "テクノロジ", hint: "故障後に修理して戻すまでの平均。", answer: "Mean Time To Repair。故障してから修理・復旧するまでの平均時間。", level: 1, confusion: "MTBFは故障間の平均稼働時間" },
  { id: "system-availability-rate", term: "稼働率", category: "テクノロジ", hint: "必要な時間のうち正常に使えた割合。", answer: "システムが正常に稼働していた時間の割合。信頼性と保守性の指標になる。", level: 1 },
  { id: "availability", term: "可用性", category: "セキュリティ", hint: "必要なときに情報やシステムを使える。", answer: "許可された利用者が、必要なときに情報やシステムを利用できる性質。", level: 1 },
  { id: "osi-model", term: "OSI基本参照モデル", category: "ネットワーク", hint: "通信機能を七つの階層に分ける。", answer: "ネットワークの通信機能を7層に分けて整理した参照モデル。", level: 1 },
  { id: "tcp-ip", term: "TCP/IP", category: "ネットワーク", hint: "インターネット通信の基礎となるプロトコル群。", answer: "TCPやIPなど、インターネットで使われる通信プロトコルの体系。", level: 1 },
  { id: "mac-address", term: "MACアドレス", category: "ネットワーク", hint: "同じネットワーク内で機器を識別する物理的な番号。", answer: "ネットワークインタフェースを識別するアドレス。主にデータリンク層で使う。", level: 1, confusion: "IPアドレスはネットワーク上の論理的な位置を表す" },
  { id: "ip-address", term: "IPアドレス", category: "ネットワーク", hint: "ネットワーク上の機器の場所を示す。", answer: "IPネットワークで機器や通信先を識別する論理アドレス。", level: 1, confusion: "MACアドレスは主に同一ネットワーク内で使う" },
  { id: "ipv4", term: "IPv4", category: "ネットワーク", hint: "32ビットのアドレスを使う。", answer: "32ビットのIPアドレスを使うインターネットプロトコル。", level: 1, confusion: "IPv6は128ビットのアドレスを使う" },
  { id: "ipv6", term: "IPv6", category: "ネットワーク", hint: "アドレス不足に対応した128ビットの方式。", answer: "128ビットのIPアドレスを使い、広いアドレス空間を持つインターネットプロトコル。", level: 1, confusion: "IPv4は32ビットのアドレスを使う" },
  { id: "subnet-mask", term: "サブネットマスク", category: "ネットワーク", hint: "IPアドレスのネットワーク部とホスト部を区切る。", answer: "IPv4アドレスのどこまでがネットワーク部かを示す値。", level: 1 },
  { id: "cidr", term: "CIDR", category: "ネットワーク", hint: "スラッシュの後ろにネットワーク部の長さを書く。", answer: "IPアドレスをクラスに依存せず、プレフィックス長でネットワーク範囲を表す方式。", level: 1 },
  { id: "default-gateway", term: "デフォルトゲートウェイ", category: "ネットワーク", hint: "同じネットワーク外へ出るときの最初の転送先。", answer: "宛先への経路が分からないときに、パケットを送る既定のルータ。", level: 1 },
  { id: "router", term: "ルータ", category: "ネットワーク", hint: "異なるネットワーク同士をつなぎ、経路を選ぶ。", answer: "IPアドレスを基に、異なるネットワーク間でパケットを転送する装置。", level: 1 },
  { id: "l2-switch", term: "L2スイッチ", category: "ネットワーク", hint: "物理アドレスを見て同じLAN内へ転送する。", answer: "MACアドレスを基にフレームを転送するデータリンク層の装置。", level: 1, confusion: "L3スイッチはIPアドレスを使って経路制御する" },
  { id: "l3-switch", term: "L3スイッチ", category: "ネットワーク", hint: "LAN内でネットワーク層の転送も行う。", answer: "IPアドレスを基にルーティングできるスイッチ。VLAN間通信などに使う。", level: 1, confusion: "L2スイッチはMACアドレスを基に転送する" },
  { id: "vlan", term: "VLAN", category: "ネットワーク", hint: "物理配線とは別にLANを論理分割する。", answer: "一つの物理LANを、複数の独立した論理LANへ分割する技術。", level: 1 },
  { id: "routing", term: "ルーティング", category: "ネットワーク", hint: "宛先までの通り道を選ぶ。", answer: "宛先ネットワークまでパケットを転送する経路を決めること。", level: 1 },
  { id: "routing-table", term: "ルーティングテーブル", category: "ネットワーク", hint: "宛先ごとの次の転送先を記録する表。", answer: "宛先ネットワーク、次の転送先、出力先などの経路情報を持つ表。", level: 1 },
  { id: "rip", term: "RIP", category: "ネットワーク", hint: "通過するルータ数を基準に経路を選ぶ。", answer: "ホップ数を基準に最適経路を選ぶ距離ベクトル型のルーティングプロトコル。", level: 1 },
  { id: "ospf", term: "OSPF", category: "ネットワーク", hint: "ネットワーク全体の接続状態を基に経路を計算する。", answer: "リンク状態情報から最短経路を計算する、組織内向けのルーティングプロトコル。", level: 1 },
  { id: "bgp", term: "BGP", category: "ネットワーク", hint: "異なる組織の大きなネットワーク同士で経路を交換する。", answer: "インターネット上の自律システム間で経路情報を交換するルーティングプロトコル。", level: 1 },
  { id: "arp", term: "ARP", category: "ネットワーク", hint: "IPアドレスから同一LAN内の物理アドレスを調べる。", answer: "同一ネットワーク内で、IPv4アドレスに対応するMACアドレスを求めるプロトコル。", level: 1 },
  { id: "dns", term: "DNS", category: "ネットワーク", hint: "人が読む名前と通信先のアドレスを対応付ける。", answer: "ドメイン名とIPアドレスなどを対応付ける名前解決の仕組み。", level: 1 },
  { id: "dns-cache", term: "DNSキャッシュ", category: "ネットワーク", hint: "名前解決の結果を一時保存する。", answer: "過去の名前解決結果を一定時間保存し、次の問合せを高速化する仕組み。", level: 1 },
  { id: "icmp", term: "ICMP", category: "ネットワーク", hint: "通信エラーや到達確認に使う制御用プロトコル。", answer: "IP通信のエラー通知や診断に使うプロトコル。pingなどで利用される。", level: 1 },
  { id: "tcp", term: "TCP", category: "ネットワーク", hint: "到達確認や順序制御を行う信頼性重視の通信。", answer: "接続を確立し、再送や順序制御によって信頼性のある通信を行うプロトコル。", level: 1, confusion: "UDPは接続確認を省いて軽量に送る" },
  { id: "udp", term: "UDP", category: "ネットワーク", hint: "到達確認を省いて素早く送る。", answer: "接続確立や再送制御を行わず、軽量にデータを送るプロトコル。", level: 1, confusion: "TCPは再送や順序制御を行う" },
  { id: "port-number", term: "ポート番号", category: "ネットワーク", hint: "同じ端末内で通信先のアプリを区別する。", answer: "TCPやUDPで、端末内のどのサービスやアプリケーションと通信するかを識別する番号。", level: 1 },
  { id: "three-way-handshake", term: "3ウェイハンドシェイク", category: "ネットワーク", hint: "接続前に三つのやり取りで互いを確認する。", answer: "TCPでSYN、SYN/ACK、ACKを交換して接続を確立する手順。", level: 1 },
  { id: "http", term: "HTTP", category: "ネットワーク", hint: "Webページなどを要求・応答でやり取りする。", answer: "WebブラウザとWebサーバ間で、文書などを送受信するプロトコル。", level: 1, confusion: "HTTPSはHTTP通信をTLSで保護する" },
  { id: "ftp", term: "FTP", category: "ネットワーク", hint: "ファイル転送に使うが、通信を暗号化しない。", answer: "ネットワーク上でファイルを転送するプロトコル。標準では認証情報や内容を暗号化しない。", level: 1 },
  { id: "sftp", term: "SFTP", category: "ネットワーク", hint: "安全なリモート接続の仕組みを使ってファイルを送る。", answer: "SSH上でファイルを安全に転送するプロトコル。", level: 1, confusion: "FTPは標準では通信を暗号化しない" },
  { id: "ssh", term: "SSH", category: "ネットワーク", hint: "遠隔操作の通信を暗号化する。", answer: "サーバへの安全なリモートログインやコマンド実行に使うプロトコル。", level: 1 },
  { id: "smtp", term: "SMTP", category: "ネットワーク", hint: "電子メールを送る側で使う。", answer: "電子メールを送信・中継するためのプロトコル。", level: 1, confusion: "POP3やIMAPはメール受信に使う" },
  { id: "pop3", term: "POP3", category: "ネットワーク", hint: "メールを端末へ取り込んで読む。", answer: "メールサーバから端末へメールをダウンロードして受信するプロトコル。", level: 1, confusion: "IMAPはサーバ上のメールを同期して管理する" },
  { id: "imap", term: "IMAP", category: "ネットワーク", hint: "メールをサーバに置いたまま複数端末で同期する。", answer: "メールをサーバ上で管理し、複数端末から同期して利用するプロトコル。", level: 1, confusion: "POP3は端末へメールを取り込む方式" },
  { id: "snmp", term: "SNMP", category: "ネットワーク", hint: "ネットワーク機器の状態を監視・管理する。", answer: "ルータやスイッチなどの情報取得や設定に使うネットワーク管理プロトコル。", level: 1 },
  { id: "ntp", term: "NTP", category: "ネットワーク", hint: "ネットワーク上の機器の時計を合わせる。", answer: "ネットワークを通じてコンピュータの時刻を同期するプロトコル。", level: 1 },
  { id: "nat", term: "NAT", category: "ネットワーク", hint: "内外のIPアドレスを対応付けて変換する。", answer: "プライベートIPアドレスとグローバルIPアドレスを変換する仕組み。", level: 1, confusion: "NAPTはIPアドレスに加えてポート番号も変換する" },
  { id: "proxy-server", term: "プロキシサーバ", category: "ネットワーク", hint: "利用者の代わりに外部サーバへアクセスする。", answer: "クライアントの代理として外部サーバへ接続する中継サーバ。", level: 1, confusion: "リバースプロキシは公開サーバ側の手前に置く" },
  { id: "cdn", term: "CDN", category: "ネットワーク", hint: "利用者に近い拠点からコンテンツを配信する。", answer: "コンテンツを複数拠点へ配置し、利用者に近いサーバから高速配信する仕組み。", level: 1 },
  { id: "qos", term: "QoS", category: "ネットワーク", hint: "重要な通信へ帯域や優先度を割り当てる。", answer: "通信の優先制御や帯域確保によって、必要な通信品質を保つ仕組み。", level: 1 },
  { id: "vpn", term: "VPN", category: "ネットワーク", hint: "公衆網の上に専用線のような安全な経路を作る。", answer: "インターネットなどの公衆網上に、暗号化された仮想的な専用ネットワークを作る技術。", level: 1 },
  { id: "wireless-lan", term: "無線LAN", category: "ネットワーク", hint: "電波を使って端末をLANへ接続する。", answer: "ケーブルの代わりに電波を使って構築するLAN。", level: 1 },
  { id: "ssid", term: "SSID", category: "ネットワーク", hint: "接続先の無線ネットワークを見分ける名前。", answer: "無線LANのネットワークを識別するための名称。", level: 1 },
  { id: "wpa2", term: "WPA2", category: "ネットワーク", hint: "無線通信をAESなどで保護する方式。", answer: "無線LANの暗号化・認証規格。主にAESを使って通信を保護する。", level: 1, confusion: "WPA3は後継規格で、辞書攻撃への耐性などを強化した" },
  { id: "wpa3", term: "WPA3", category: "ネットワーク", hint: "従来方式を強化した新しい無線セキュリティ規格。", answer: "WPA2の後継となる無線LANのセキュリティ規格。認証や暗号化を強化している。", level: 1, confusion: "WPA2は一世代前の無線セキュリティ規格" },
  { id: "csma-cd", term: "CSMA/CD", category: "ネットワーク", hint: "送信前に回線を確認し、衝突を検出したら再送する。", answer: "共有型Ethernetで、通信の衝突を検出して再送するアクセス制御方式。", level: 1, confusion: "CSMA/CAは無線LANで衝突を避ける" },
  { id: "csma-ca", term: "CSMA/CA", category: "ネットワーク", hint: "電波の衝突を事前に避ける。", answer: "無線LANで、送信前の待機などによって通信の衝突を回避する方式。", level: 1, confusion: "CSMA/CDは衝突を検出して再送する" },
  { id: "firewall", term: "ファイアウォール", category: "セキュリティ", hint: "ネットワークの出入口で通信を制御する。", answer: "決められた規則に従って通信を許可・遮断し、内部ネットワークを保護する仕組み。", level: 1 },
  { id: "waf", term: "WAF", category: "セキュリティ", hint: "Webアプリへの要求内容を検査する。", answer: "Web Application Firewall。HTTP通信を検査し、Webアプリへの攻撃を防ぐ仕組み。", level: 1, confusion: "ファイアウォールは主にIPアドレスやポートなどで通信を制御する" },
  { id: "ids", term: "IDS", category: "セキュリティ", hint: "不正な通信や動きを見つけて通知する。", answer: "侵入や不正な通信を検知し、管理者へ通知するシステム。", level: 1, confusion: "IPSは検知に加えて通信を遮断する" },
  { id: "ips", term: "IPS", category: "セキュリティ", hint: "不正な通信を見つけて止める。", answer: "侵入や不正な通信を検知し、自動的に遮断するシステム。", level: 1, confusion: "IDSは主に検知と通知を行う" },
  { id: "confidentiality", term: "機密性", category: "セキュリティ", hint: "許可された人だけが情報を見られる。", answer: "許可された者だけが情報へアクセスできる性質。", level: 1 },
  { id: "authenticity", term: "真正性", category: "セキュリティ", hint: "利用者や情報が本物であることを確かめる。", answer: "利用者や情報が、主張どおりの本物であることを保証する性質。", level: 1 },
  { id: "accountability", term: "責任追跡性", category: "セキュリティ", hint: "誰が何をしたかを後からたどれる。", answer: "操作記録などから、行為を行った主体を後で追跡できる性質。", level: 1 },
  { id: "authentication", term: "認証", category: "セキュリティ", hint: "相手が誰なのかを確かめる。", answer: "IDやパスワードなどを使い、利用者や機器が本人かを確認すること。", level: 1, confusion: "認可は確認済みの利用者へ権限を与えること" },
  { id: "authorization", term: "認可", category: "セキュリティ", hint: "確認済みの相手に、できる操作を決める。", answer: "認証された利用者に、許可する操作や資源へのアクセス権を与えること。", level: 1, confusion: "認証は相手が本人かを確認すること" },
  { id: "access-control", term: "アクセス制御", category: "セキュリティ", hint: "利用者ごとに使える情報や操作を制限する。", answer: "利用者や役割に応じて、情報資産へのアクセスを許可・拒否する仕組み。", level: 1 },
  { id: "least-privilege", term: "最小権限", category: "セキュリティ", hint: "仕事に必要な範囲だけ操作を許す。", answer: "利用者やプログラムへ、業務に必要な最小限の権限だけを与える考え方。", level: 1 },
  { id: "multi-factor-authentication", term: "多要素認証", category: "セキュリティ", hint: "知識・所持・生体のうち異なる種類を組み合わせる。", answer: "知識・所持・生体など、異なる種類の認証要素を二つ以上組み合わせる方式。", level: 1 },
  { id: "biometric-authentication", term: "生体認証", category: "セキュリティ", hint: "身体的・行動的な特徴を本人確認に使う。", answer: "指紋、顔、静脈など、人の身体的・行動的特徴を使う認証方式。", level: 1 },
  { id: "password-authentication", term: "パスワード認証", category: "セキュリティ", hint: "本人だけが知る文字列で確認する。", answer: "利用者が知っている秘密の文字列を照合して本人確認する方式。", level: 1 },
  { id: "salt", term: "ソルト", category: "セキュリティ", hint: "保存前の秘密情報へ利用者ごとに異なる値を加える。", answer: "パスワードのハッシュ化前に加えるランダムな値。同じパスワードでも異なるハッシュ値にする。", level: 1 },
  { id: "symmetric-key-encryption", term: "共通鍵暗号方式", category: "セキュリティ", hint: "暗号化と復号に同じ鍵を使う。", answer: "暗号化と復号に同じ鍵を使う方式。高速だが、鍵を安全に共有する必要がある。", level: 1, confusion: "公開鍵暗号は暗号化と復号で異なる鍵を使う" },
  { id: "hybrid-encryption", term: "ハイブリッド暗号方式", category: "セキュリティ", hint: "鍵の受渡しと実際の通信で方式を使い分ける。", answer: "公開鍵暗号と共通鍵暗号を組み合わせ、安全な鍵共有と高速な通信を両立する方式。", level: 1 },
  { id: "aes", term: "AES", category: "セキュリティ", hint: "広く使われる共通鍵の標準方式。", answer: "現在広く使われている共通鍵暗号方式。ブロック単位でデータを暗号化する。", level: 1, confusion: "RSAは公開鍵暗号方式" },
  { id: "rsa", term: "RSA", category: "セキュリティ", hint: "大きな整数の素因数分解の難しさを利用する。", answer: "素因数分解の難しさを利用した公開鍵暗号方式。暗号化や電子署名に使う。", level: 1, confusion: "AESは共通鍵暗号方式" },
  { id: "elliptic-curve-cryptography", term: "楕円曲線暗号", category: "セキュリティ", hint: "短い鍵で高い安全性を得やすい公開鍵方式。", answer: "楕円曲線上の計算の難しさを利用する公開鍵暗号。比較的短い鍵で高い安全性を得られる。", level: 1 },
  { id: "diffie-hellman", term: "Diffie-Hellman鍵交換", category: "セキュリティ", hint: "盗聴される通信路でも秘密の値を直接送らず共有する。", answer: "公開情報を交換し、通信相手同士で同じ共通鍵を生成する鍵交換方式。", level: 1 },
  { id: "cryptographic-hash", term: "暗号学的ハッシュ関数", category: "セキュリティ", hint: "元に戻しにくい固定長の値を作る。", answer: "データから固定長の値を生成し、元データの復元や同じ値の作成が困難な関数。", level: 1 },
  { id: "sha", term: "SHA", category: "セキュリティ", hint: "改ざん検知などで使う代表的な方式群。", answer: "Secure Hash Algorithm。データから固定長のハッシュ値を生成する暗号学的ハッシュ方式群。", level: 1 },
  { id: "message-authentication-code", term: "MAC（メッセージ認証コード）", category: "セキュリティ", hint: "秘密鍵とメッセージから検証用の値を作る。", answer: "秘密鍵を使って、メッセージの改ざんと送信元を確認するための値。", level: 1, confusion: "ネットワーク機器のMACアドレスとは別の用語" },
  { id: "hmac", term: "HMAC", category: "セキュリティ", hint: "秘密鍵とハッシュ関数を組み合わせる。", answer: "ハッシュ関数と秘密鍵を組み合わせて作るメッセージ認証コード。", level: 1 },
  { id: "digital-certificate", term: "デジタル証明書", category: "セキュリティ", hint: "公開鍵とその所有者の情報を第三者が結び付ける。", answer: "公開鍵が誰のものかを認証局が保証する電子的な証明書。", level: 1, confusion: "CAはデジタル証明書を発行する機関" },
  { id: "pki", term: "PKI", category: "セキュリティ", hint: "証明書と認証局を使って公開鍵を信頼する。", answer: "Public Key Infrastructure。認証局や証明書を使って公開鍵の信頼を管理する仕組み。", level: 1 },
  { id: "ocsp", term: "OCSP", category: "セキュリティ", hint: "証明書が現在も有効かをオンラインで問い合わせる。", answer: "デジタル証明書の失効状態をオンラインで確認するプロトコル。", level: 1, confusion: "CRLは失効した証明書の一覧" },
  { id: "tls", term: "TLS", category: "セキュリティ", hint: "通信相手の認証や暗号化を行う。", answer: "ネットワーク通信を暗号化し、相手の認証や改ざん検知を行うプロトコル。", level: 1 },
  { id: "dnssec", term: "DNSSEC", category: "セキュリティ", hint: "名前解決の応答に署名を付ける。", answer: "DNS応答を電子署名で検証し、偽の名前解決情報を見抜く仕組み。", level: 1 },
  { id: "malware", term: "マルウェア", category: "セキュリティ", hint: "利用者やシステムへ害を与えるソフトウェアの総称。", answer: "不正な動作や情報窃取などを目的とする悪意あるソフトウェアの総称。", level: 1 },
  { id: "computer-virus", term: "コンピュータウイルス", category: "セキュリティ", hint: "ほかのファイルへ寄生して増える。", answer: "ほかのプログラムやファイルへ感染し、実行時に増殖や不正動作を行うマルウェア。", level: 1 },
  { id: "worm", term: "ワーム", category: "セキュリティ", hint: "ほかのファイルへ寄生せずネットワークを通じて増える。", answer: "単独で動作し、ネットワークなどを通じて自己増殖するマルウェア。", level: 1, confusion: "ウイルスはほかのファイルへ寄生する" },
  { id: "trojan-horse", term: "トロイの木馬", category: "セキュリティ", hint: "正規のソフトを装って利用者に実行させる。", answer: "有用なソフトなどを装い、実行されると不正な処理を行うマルウェア。", level: 1 },
  { id: "spyware", term: "スパイウェア", category: "セキュリティ", hint: "利用者に気付かれず情報を集める。", answer: "端末内の情報や利用状況を密かに収集し、外部へ送るマルウェア。", level: 1 },
  { id: "keylogger", term: "キーロガー", category: "セキュリティ", hint: "キーボード入力を記録する。", answer: "キーボードから入力された内容を記録し、認証情報などを盗む仕組み。", level: 1 },
  { id: "bot", term: "ボット", category: "セキュリティ", hint: "外部からの命令で自動的に動く感染端末。", answer: "攻撃者からの命令を受け、攻撃や情報送信を自動実行するプログラムや感染端末。", level: 1 },
  { id: "botnet", term: "ボットネット", category: "セキュリティ", hint: "遠隔操作される多数の感染端末の集まり。", answer: "攻撃者が遠隔操作する、多数のボットで構成されたネットワーク。", level: 1 },
  { id: "targeted-attack", term: "標的型攻撃", category: "セキュリティ", hint: "特定の組織や人物を狙って準備する。", answer: "特定の組織や人物を狙い、情報窃取などを目的に継続して行う攻撃。", level: 1 },
  { id: "social-engineering", term: "ソーシャルエンジニアリング", category: "セキュリティ", hint: "技術ではなく人の心理や行動の隙を狙う。", answer: "人をだましたり行動を観察したりして、秘密情報を不正に入手する手法。", level: 1 },
  { id: "sql-injection", term: "SQLインジェクション", category: "セキュリティ", hint: "入力欄からデータベース命令を混入する。", answer: "入力値へ不正なSQLを埋め込み、データベースを不正操作する攻撃。", level: 1 },
  { id: "xss", term: "XSS", category: "セキュリティ", hint: "Webページへ悪意あるスクリプトを混入する。", answer: "Webページに不正なスクリプトを埋め込み、閲覧者のブラウザで実行させる攻撃。", level: 1 },
  { id: "os-command-injection", term: "OSコマンドインジェクション", category: "セキュリティ", hint: "入力値からサーバの命令を実行させる。", answer: "入力へ不正なOSコマンドを混入し、サーバ上で実行させる攻撃。", level: 1 },
  { id: "buffer-overflow", term: "バッファオーバーフロー", category: "セキュリティ", hint: "用意された記憶領域を超えてデータを書き込む。", answer: "バッファの容量を超えてデータを書き込み、異常動作や不正なコード実行を起こす攻撃。", level: 1 },
  { id: "dos-attack", term: "DoS攻撃", category: "セキュリティ", hint: "大量の処理を与えてサービスを使えなくする。", answer: "大量の要求などで資源を消費させ、サービスを利用不能にする攻撃。", level: 1, confusion: "DDoSは多数の端末から分散して行う" },
  { id: "ddos-attack", term: "DDoS攻撃", category: "セキュリティ", hint: "多数の端末から一斉に負荷をかける。", answer: "多数の端末から分散して大量の通信を送り、サービスを利用不能にする攻撃。", level: 1, confusion: "DoSは単一または少数の攻撃元でも行われる" },
  { id: "replay-attack", term: "リプレイ攻撃", category: "セキュリティ", hint: "盗聴した正規の通信を後でもう一度送る。", answer: "取得した正規の認証情報や通信データを再送し、本人になりすます攻撃。", level: 1 },
  { id: "brute-force-attack", term: "ブルートフォース攻撃", category: "セキュリティ", hint: "候補をしらみつぶしに試す。", answer: "考えられるパスワードや鍵の候補を総当たりで試す攻撃。", level: 1 },
  { id: "dns-cache-poisoning", term: "DNSキャッシュポイズニング", category: "セキュリティ", hint: "名前解決の一時保存へ偽情報を入れる。", answer: "DNSキャッシュへ偽の情報を登録し、利用者を不正な接続先へ誘導する攻撃。", level: 1 },
  { id: "arp-spoofing", term: "ARPスプーフィング", category: "セキュリティ", hint: "同じLAN内でアドレス対応を偽る。", answer: "偽のARP情報を送って通信を攻撃者へ向け、盗聴や改ざんを行う攻撃。", level: 1 },
  { id: "vulnerability", term: "脆弱性", category: "セキュリティ", hint: "攻撃に悪用される設計や設定の弱点。", answer: "攻撃によって悪用される可能性がある、ソフトウェアや運用上の弱点。", level: 1 },
  { id: "zero-day-attack", term: "ゼロデイ攻撃", category: "セキュリティ", hint: "修正方法が広まる前の弱点を狙う。", answer: "脆弱性の修正プログラムが提供される前に、その弱点を悪用する攻撃。", level: 1 },
  { id: "security-patch", term: "パッチ", category: "セキュリティ", hint: "公開後のソフトウェアの欠陥を直す。", answer: "ソフトウェアの不具合や脆弱性を修正するための更新プログラム。", level: 1 },
  { id: "cve", term: "CVE", category: "セキュリティ", hint: "公開された弱点へ共通の識別番号を付ける。", answer: "公開された脆弱性を一意に識別するための共通番号。", level: 1, confusion: "CVSSは脆弱性の深刻度を評価する" },
  { id: "cvss", term: "CVSS", category: "セキュリティ", hint: "弱点の深刻さを共通の基準で数値化する。", answer: "脆弱性の深刻度を共通の指標で評価・数値化する仕組み。", level: 1, confusion: "CVEは脆弱性を識別する番号" },
  { id: "vulnerability-assessment", term: "脆弱性診断", category: "セキュリティ", hint: "システムの弱点を検査して洗い出す。", answer: "ツールや手作業でシステムを調べ、既知の脆弱性や設定不備を見つけること。", level: 1 },
  { id: "penetration-test", term: "ペネトレーションテスト", category: "セキュリティ", hint: "許可を得て実際の攻撃に近い手順を試す。", answer: "実際の攻撃手法を使い、システムへ侵入できるかを検証するテスト。", level: 1, confusion: "脆弱性診断は弱点の検出を中心に行う" },
  { id: "siem", term: "SIEM", category: "セキュリティ", hint: "複数機器のログを集めて相関分析する。", answer: "機器やシステムのログを一元収集・分析し、異常や攻撃の兆候を検知する仕組み。", level: 1 },
  { id: "soc", term: "SOC", category: "セキュリティ", hint: "監視と分析を継続して行う専門組織。", answer: "Security Operation Center。セキュリティ監視や攻撃分析を行う組織。", level: 1, confusion: "CSIRTはインシデント対応を中心に行う" },
  { id: "csirt", term: "CSIRT", category: "セキュリティ", hint: "事故が起きたときの対応を担うチーム。", answer: "セキュリティインシデントの受付、調査、対応、再発防止を行う組織。", level: 1, confusion: "SOCは日常的な監視と分析を中心に行う" },
  { id: "edr", term: "EDR", category: "セキュリティ", hint: "PCやサーバの動作を継続監視する。", answer: "端末の挙動を監視・記録し、不審な活動の検知や調査、対処を支援する仕組み。", level: 1 },
  { id: "allowlist", term: "ホワイトリスト", category: "セキュリティ", hint: "許可したものだけを通す。", answer: "安全と認めた対象だけを許可し、それ以外を拒否する方式。", level: 1, confusion: "ブラックリストは危険な対象だけを拒否する" },
  { id: "denylist", term: "ブラックリスト", category: "セキュリティ", hint: "危険と判断したものを拒否する。", answer: "危険と判断した対象を登録して拒否し、それ以外を許可する方式。", level: 1, confusion: "ホワイトリストは許可した対象だけを通す" },
  { id: "defense-in-depth", term: "多層防御", category: "セキュリティ", hint: "一つの対策に頼らず複数の壁を重ねる。", answer: "複数種類のセキュリティ対策を重ね、一部が破られても被害を防ぐ考え方。", level: 1 },
  { id: "zero-trust", term: "ゼロトラスト", category: "セキュリティ", hint: "社内外を問わず毎回確認する。", answer: "ネットワークの内外を無条件に信頼せず、アクセスのたびに確認する考え方。", level: 1 },
  { id: "risk-assessment", term: "リスクアセスメント", category: "セキュリティ", hint: "起こりやすさと影響を調べて優先順位を決める。", answer: "情報資産のリスクを特定・分析・評価し、対策の優先度を決める活動。", level: 1 },
  { id: "risk-avoidance", term: "リスク回避", category: "セキュリティ", hint: "危険の原因となる活動自体をやめる。", answer: "リスクを生む活動や資産の利用をやめ、リスクそのものをなくす対応。", level: 1 },
  { id: "risk-reduction", term: "リスク低減", category: "セキュリティ", hint: "対策によって起こりやすさや被害を小さくする。", answer: "安全対策を実施し、リスクの発生確率や影響を小さくする対応。", level: 1 },
  { id: "risk-transfer", term: "リスク移転", category: "セキュリティ", hint: "保険や契約で損失負担を外部へ移す。", answer: "保険や外部委託などによって、リスクの損失負担を第三者へ移す対応。", level: 1 },
  { id: "risk-retention", term: "リスク保有", category: "セキュリティ", hint: "対策費用などを考え、危険を受け入れる。", answer: "評価したリスクを認識した上で、追加対策をせず受け入れる対応。", level: 1 },
  { id: "isms", term: "ISMS", category: "セキュリティ", hint: "組織として情報を守る仕組みを継続改善する。", answer: "情報セキュリティを組織的に管理し、継続的に改善するためのマネジメントシステム。", level: 1 },
  { id: "security-policy", term: "情報セキュリティポリシ", category: "セキュリティ", hint: "組織が情報を守るための基本方針や規則。", answer: "組織の情報セキュリティに関する方針、対策基準、手順などを定めたもの。", level: 1 },
  { id: "incident-response", term: "インシデントレスポンス", category: "セキュリティ", hint: "事故の検知から復旧・再発防止まで対応する。", answer: "セキュリティ事故を検知し、封じ込め、復旧、原因分析などを行う活動。", level: 1 },
  { id: "digital-forensics", term: "デジタルフォレンジックス", category: "セキュリティ", hint: "事故後の証拠を壊さず収集・分析する。", answer: "端末やログなどの電子的証拠を保全・解析し、事故原因や不正行為を調査する技術。", level: 1 },
  { id: "relational-database", term: "関係データベース", category: "データベース", hint: "データを表の形で管理する。", answer: "データを行と列からなる表で表し、表同士を関連付けて管理するデータベース。", level: 1 },
  { id: "relational-model", term: "関係モデル", category: "データベース", hint: "データを関係として表し、集合演算で扱う。", answer: "データを表形式の関係として表し、関係演算によって操作するデータモデル。", level: 1 },
  { id: "tuple", term: "タプル", category: "データベース", hint: "関係データベースの表にある横一行。", answer: "関係モデルにおける一つの行。1件分のデータを表す。", level: 1, confusion: "属性は表の列に相当する" },
  { id: "attribute", term: "属性", category: "データベース", hint: "表でデータの項目を表す縦方向の要素。", answer: "関係モデルにおけるデータの項目。表の列に相当する。", level: 1, confusion: "タプルは表の行に相当する" },
  { id: "domain", term: "ドメイン", category: "データベース", hint: "ある項目に入れられる値の範囲。", answer: "属性が取り得る値の集合。データ型や値の範囲などを定める。", level: 1 },
  { id: "superkey", term: "スーパーキー", category: "データベース", hint: "余分な列を含んでも行を一意に特定できる。", answer: "表の行を一意に識別できる、一つ以上の属性の組合せ。", level: 1, confusion: "候補キーは余分な属性を除いた最小のスーパーキー" },
  { id: "composite-key", term: "複合キー", category: "データベース", hint: "一つではなく複数の列を組み合わせて識別する。", answer: "複数の列を組み合わせて構成するキー。", level: 1 },
  { id: "entity", term: "エンティティ", category: "データベース", hint: "管理対象となる人・物・出来事を表す。", answer: "データベースで情報を管理する対象となる人、物、出来事などの実体。", level: 1 },
  { id: "relationship", term: "リレーションシップ", category: "データベース", hint: "二つの管理対象のつながりを表す。", answer: "エンティティ同士の関連。ER図では線などで表す。", level: 1 },
  { id: "cardinality", term: "カーディナリティ", category: "データベース", hint: "一方の実体に他方がいくつ対応するか。", answer: "エンティティ間の対応数を表す考え方。1対1、1対多、多対多などがある。", level: 1 },
  { id: "unnormalized-form", term: "非正規形", category: "データベース", hint: "一つの項目に繰返しや複数の値が残っている。", answer: "繰返し項目などを含み、第1正規形を満たしていないデータの形。", level: 1 },
  { id: "bcnf", term: "BCNF", category: "データベース", hint: "決定項が必ず候補キーになるようにする。", answer: "全ての関数従属で、決定項が候補キーとなるようにした正規形。", level: 1 },
  { id: "database-redundancy", term: "データの冗長性", category: "データベース", hint: "同じ事実を複数の場所へ重複して持つ。", answer: "同じ内容のデータを複数箇所に重複して保持している状態。更新異常の原因になる。", level: 1 },
  { id: "atomicity", term: "原子性", category: "データベース", hint: "一連の処理を全て行うか、全く行わない。", answer: "トランザクションの処理を、全て成功させるか全て取り消す性質。ACIDのA。", level: 1 },
  { id: "isolation", term: "独立性（分離性）", category: "データベース", hint: "同時実行中の処理同士が不適切に影響しない。", answer: "複数のトランザクションが互いに不適切な影響を与えず実行される性質。ACIDのI。", level: 1 },
  { id: "durability", term: "永続性", category: "データベース", hint: "確定した更新は障害後も失われない。", answer: "コミットした結果が、障害が起きても失われず保存される性質。ACIDのD。", level: 1 },
  { id: "two-phase-locking", term: "2相ロック", category: "データベース", hint: "ロックを増やす期間と解放する期間を分ける。", answer: "ロックを取得する段階と解放する段階を分け、直列化可能性を保つ方式。", level: 1 },
  { id: "sql", term: "SQL", category: "データベース", hint: "表形式のデータを定義・操作するための言語。", answer: "関係データベースの定義、検索、更新、権限制御などに使う言語。", level: 1 },
  { id: "create-sql", term: "CREATE", category: "データベース", hint: "新しい表などの構造を作る。", answer: "テーブルやビューなどのデータベースオブジェクトを作成するDDL。", level: 1 },
  { id: "right-join", term: "RIGHT OUTER JOIN", category: "データベース", hint: "右側の表の行を全て残す。", answer: "右側テーブルの全行を残し、左側の一致する行を結合する外部結合。", level: 1, confusion: "LEFT JOINは左側テーブルの全行を残す" },
  { id: "null", term: "NULL", category: "データベース", hint: "空文字や0ではなく、値が存在しないことを表す。", answer: "値が不明または存在しないことを表す特別な値。比較にはIS NULLを使う。", level: 1 },
  { id: "requirements-definition", term: "要件定義", category: "テクノロジ", hint: "作るものに必要な機能や条件を明らかにする。", answer: "利用者や業務の要求を整理し、システムが満たすべき要件として定める工程。", level: 1 },
  { id: "functional-requirement", term: "機能要件", category: "テクノロジ", hint: "システムが何をするかを定める。", answer: "システムが提供すべき処理やサービスなど、必要な機能に関する要件。", level: 1, confusion: "非機能要件は性能や信頼性などの品質条件" },
  { id: "non-functional-requirement", term: "非機能要件", category: "テクノロジ", hint: "速さ・安全性・使いやすさなどの品質を定める。", answer: "性能、可用性、セキュリティ、操作性など、機能以外の品質に関する要件。", level: 1, confusion: "機能要件はシステムが行う処理を定める" },
  { id: "external-design", term: "外部設計", category: "テクノロジ", hint: "利用者から見える画面や入出力を決める。", answer: "画面、帳票、外部インタフェースなど、利用者から見える仕様を設計する工程。", level: 1, confusion: "内部設計はシステム内部の構造を決める" },
  { id: "internal-design", term: "内部設計", category: "テクノロジ", hint: "利用者から見えないプログラム内部を決める。", answer: "モジュール構成や処理方式など、システム内部の実装方法を設計する工程。", level: 1, confusion: "外部設計は利用者から見える仕様を決める" },
  { id: "waterfall", term: "ウォーターフォール", category: "テクノロジ", hint: "工程を上流から順番に進める。", answer: "要件定義、設計、実装、テストなどの工程を順に進める開発手法。", level: 1 },
  { id: "agile", term: "アジャイル", category: "テクノロジ", hint: "短い期間で作成と改善を繰り返す。", answer: "短い開発サイクルで動く成果物を作り、フィードバックを取り込む開発の考え方。", level: 1 },
  { id: "scrum", term: "スクラム", category: "テクノロジ", hint: "短い反復と役割・イベントを定めた開発方法。", answer: "短いスプリントを繰り返し、チームで製品を改善するアジャイル開発の枠組み。", level: 1 },
  { id: "sprint", term: "スプリント", category: "テクノロジ", hint: "短く区切った開発期間。", answer: "スクラムで、計画した機能を完成させるための固定された短い開発期間。", level: 1 },
  { id: "product-backlog", term: "プロダクトバックログ", category: "テクノロジ", hint: "製品に必要な作業を優先順に並べる。", answer: "製品に必要な機能や改善作業を、優先順位付きでまとめた一覧。", level: 1, confusion: "スプリントバックログは今回のスプリントで行う作業" },
  { id: "sprint-backlog", term: "スプリントバックログ", category: "テクノロジ", hint: "今回の短い開発期間で行う作業を選ぶ。", answer: "プロダクトバックログから選び、現在のスプリントで実施する作業の一覧。", level: 1, confusion: "プロダクトバックログは製品全体の作業一覧" },
  { id: "product-owner", term: "プロダクトオーナ", category: "テクノロジ", hint: "製品価値と作業の優先順位に責任を持つ。", answer: "製品の価値を最大化するため、プロダクトバックログを管理する役割。", level: 1 },
  { id: "scrum-master", term: "スクラムマスタ", category: "テクノロジ", hint: "チームが開発の枠組みを正しく使えるよう支援する。", answer: "スクラムの実践を支援し、チームの障害除去や改善を促す役割。", level: 1 },
  { id: "xp", term: "XP", category: "テクノロジ", hint: "ペア作業や小さなリリースを重視する。", answer: "Extreme Programming。継続的なテストやペア作業などを重視するアジャイル開発手法。", level: 1 },
  { id: "pair-programming", term: "ペアプログラミング", category: "テクノロジ", hint: "二人で一つのコードを作る。", answer: "二人一組で、実装する人と確認する人の役割を交代しながら開発する方法。", level: 1 },
  { id: "refactoring", term: "リファクタリング", category: "テクノロジ", hint: "外から見える動作を変えず内部を整理する。", answer: "ソフトウェアの外部動作を変えずに、コードの構造や読みやすさを改善すること。", level: 1 },
  { id: "continuous-integration", term: "継続的インテグレーション（CI）", category: "テクノロジ", hint: "変更を頻繁に統合し、自動で確認する。", answer: "コード変更を頻繁に統合し、ビルドやテストを自動実行する開発手法。", level: 1 },
  { id: "continuous-delivery", term: "継続的デリバリー（CD）", category: "テクノロジ", hint: "いつでも安全に公開できる状態を保つ。", answer: "変更を自動で検証し、いつでも本番へリリースできる状態に保つ手法。", level: 1 },
  { id: "devops", term: "DevOps", category: "テクノロジ", hint: "開発と運用が協力して素早く改善する。", answer: "開発担当と運用担当が連携し、自動化によって継続的にサービスを改善する考え方。", level: 1 },
  { id: "uml", term: "UML", category: "テクノロジ", hint: "ソフトウェアの構造や振る舞いを共通の図で表す。", answer: "ソフトウェアの構造や動作を、標準化された図で表現するモデリング言語。", level: 1 },
  { id: "use-case-diagram", term: "ユースケース図", category: "テクノロジ", hint: "利用者とシステム機能の関係を表す。", answer: "利用者などのアクタと、システムが提供する機能の関係を表すUML図。", level: 1 },
  { id: "class-diagram", term: "クラス図", category: "テクノロジ", hint: "型の属性・操作・関係を表す。", answer: "クラスの属性、操作、継承や関連などの静的な構造を表すUML図。", level: 1 },
  { id: "sequence-diagram", term: "シーケンス図", category: "テクノロジ", hint: "処理のやり取りを時間順に並べる。", answer: "オブジェクト間のメッセージのやり取りを、時間の流れに沿って表すUML図。", level: 1 },
  { id: "activity-diagram", term: "アクティビティ図", category: "テクノロジ", hint: "処理の流れや分岐・並行を表す。", answer: "業務や処理の流れ、分岐、並行処理などを表すUML図。", level: 1 },
  { id: "state-transition-diagram", term: "状態遷移図", category: "テクノロジ", hint: "出来事によって状態がどう変わるかを表す。", answer: "イベントに応じて対象の状態がどのように変化するかを表す図。", level: 1 },
  { id: "module", term: "モジュール", category: "テクノロジ", hint: "機能ごとに分けたプログラムのまとまり。", answer: "特定の機能や責務を持つ、交換・再利用可能なプログラムの構成単位。", level: 1 },
  { id: "cohesion", term: "凝集度", category: "テクノロジ", hint: "一つの部品内の処理がどれだけ関連しているか。", answer: "モジュール内部の要素が、一つの目的へどれだけまとまっているかを表す度合い。高い方が望ましい。", level: 1, confusion: "結合度はモジュール間の依存の強さ" },
  { id: "coupling", term: "結合度", category: "テクノロジ", hint: "部品同士がどれだけ強く依存しているか。", answer: "モジュール同士の依存の強さを表す度合い。低い方が変更の影響を抑えやすい。", level: 1, confusion: "凝集度はモジュール内部のまとまり" },
  { id: "encapsulation", term: "カプセル化", category: "テクノロジ", hint: "内部のデータや処理を隠して窓口を限定する。", answer: "データと操作をまとめ、内部の実装を外部から隠すオブジェクト指向の考え方。", level: 1 },
  { id: "inheritance", term: "継承", category: "テクノロジ", hint: "既存の型の性質を新しい型へ引き継ぐ。", answer: "既存クラスの属性や操作を受け継ぎ、新しいクラスを作る仕組み。", level: 1 },
  { id: "polymorphism-oop", term: "ポリモーフィズム", category: "テクノロジ", hint: "同じ呼出しでも対象に応じて動作が変わる。", answer: "同じ操作名で、オブジェクトの種類に応じた異なる処理を行える性質。", level: 1 },
  { id: "unit-test", term: "単体テスト", category: "テクノロジ", hint: "プログラムの小さな部品ごとに確認する。", answer: "関数やモジュールなど、ソフトウェアの小さな単位を個別に検証するテスト。", level: 1 },
  { id: "integration-test", term: "結合テスト", category: "テクノロジ", hint: "部品同士をつないだときの動きを確認する。", answer: "複数のモジュールやシステムを組み合わせ、連携が正しく動くか確認するテスト。", level: 1 },
  { id: "system-test", term: "システムテスト", category: "テクノロジ", hint: "完成した全体が要件を満たすか確認する。", answer: "システム全体を対象に、機能や性能などが要件を満たすか確認するテスト。", level: 1 },
  { id: "acceptance-test", term: "受入テスト", category: "テクノロジ", hint: "利用者側が業務で使えるか確認する。", answer: "利用者や発注者が、完成したシステムを受け入れられるか確認するテスト。", level: 1 },
  { id: "black-box-test", term: "ブラックボックステスト", category: "テクノロジ", hint: "内部構造を見ず、入力と出力を確認する。", answer: "プログラム内部を意識せず、仕様に基づく入力と出力から検証するテスト。", level: 1, confusion: "ホワイトボックステストは内部構造に基づく" },
  { id: "white-box-test", term: "ホワイトボックステスト", category: "テクノロジ", hint: "プログラム内部の処理経路を確認する。", answer: "プログラムの内部構造や処理経路に基づいて検証するテスト。", level: 1, confusion: "ブラックボックステストは仕様上の入出力から確認する" },
  { id: "equivalence-partitioning", term: "同値分割", category: "テクノロジ", hint: "同じ結果になる入力をグループに分ける。", answer: "同じ動作をすると考えられる入力範囲をグループ化し、代表値でテストする方法。", level: 1 },
  { id: "boundary-value-analysis", term: "境界値分析", category: "テクノロジ", hint: "条件が切り替わる境目の前後を試す。", answer: "入力範囲の最小値・最大値や、その直前直後を重点的にテストする方法。", level: 1 },
  { id: "decision-table", term: "デシジョンテーブル", category: "テクノロジ", hint: "条件の組合せと実行する処理を表にする。", answer: "複数条件の組合せと、それぞれで実行する処理を表に整理したもの。", level: 1 },
  { id: "statement-coverage", term: "命令網羅", category: "テクノロジ", hint: "全ての命令を少なくとも一度実行する。", answer: "プログラム中の全ての命令を、テストで少なくとも一度実行する基準。", level: 1 },
  { id: "branch-coverage", term: "分岐網羅", category: "テクノロジ", hint: "各判定の真と偽を両方通る。", answer: "全ての分岐について、真と偽の経路を少なくとも一度実行する基準。", level: 1 },
  { id: "condition-coverage", term: "条件網羅", category: "テクノロジ", hint: "判定式内の各条件を真と偽にする。", answer: "判定式を構成する各条件が、真と偽を少なくとも一度取るようにする基準。", level: 1 },
  { id: "regression-test", term: "回帰テスト", category: "テクノロジ", hint: "変更前に動いていた機能が壊れていないか確認する。", answer: "修正や機能追加によって、既存機能へ不具合が生じていないか確認する再テスト。", level: 1 },
  { id: "static-test", term: "静的テスト", category: "テクノロジ", hint: "プログラムを実行せずに確認する。", answer: "ソフトウェアを実行せず、文書やコードをレビュー・解析するテスト。", level: 1, confusion: "動的テストはプログラムを実行して確認する" },
  { id: "dynamic-test", term: "動的テスト", category: "テクノロジ", hint: "プログラムを動かして結果を確認する。", answer: "ソフトウェアを実行し、入力に対する動作や出力を確認するテスト。", level: 1, confusion: "静的テストは実行せずに確認する" },
  { id: "stub", term: "スタブ", category: "テクノロジ", hint: "テスト対象から呼ばれる未完成の下位部品の代役。", answer: "結合テストで、テスト対象から呼び出される下位モジュールの代わりになる仮モジュール。", level: 1, confusion: "ドライバはテスト対象を呼び出す上位側の代役" },
  { id: "driver", term: "ドライバ", category: "テクノロジ", hint: "未完成の上位部品に代わってテスト対象を呼び出す。", answer: "結合テストで、テスト対象を呼び出す上位モジュールの代わりになる仮モジュール。", level: 1, confusion: "スタブはテスト対象から呼ばれる下位側の代役" },
  { id: "software-review", term: "レビュー", category: "テクノロジ", hint: "成果物を人が確認して問題を見つける。", answer: "設計書やコードなどを複数人で確認し、欠陥や改善点を見つける活動。", level: 1 },
  { id: "walkthrough", term: "ウォークスルー", category: "テクノロジ", hint: "作成者が説明しながら参加者と確認する。", answer: "作成者が成果物を説明し、参加者から意見を得る比較的形式の軽いレビュー。", level: 1 },
  { id: "inspection", term: "インスペクション", category: "テクノロジ", hint: "役割と手順を定めて正式に欠陥を探す。", answer: "参加者の役割や手順を定め、欠陥検出を目的に行う形式的なレビュー。", level: 1 },
  { id: "v-model", term: "V字モデル", category: "テクノロジ", hint: "開発工程と対応するテスト工程を左右に並べる。", answer: "要件・設計・実装の各工程と、それに対応するテスト工程をV字に対応付けるモデル。", level: 1 },
  { id: "version-control", term: "バージョン管理", category: "テクノロジ", hint: "ファイルの変更履歴を記録して戻せるようにする。", answer: "ソースコードなどの変更履歴を保存し、差分確認や過去版への復元を可能にする仕組み。", level: 1 },
  { id: "project", term: "プロジェクト", category: "マネジメント", hint: "期限と目的を持つ一時的な取組。", answer: "独自の成果物やサービスを生み出すための、開始と終了がある一時的な活動。", level: 1 },
  { id: "project-management", term: "プロジェクトマネジメント", category: "マネジメント", hint: "目的達成に向けて範囲・日程・費用などを管理する。", answer: "プロジェクトの目標達成に向け、計画・実行・監視・調整を行う活動。", level: 1 },
  { id: "stakeholder", term: "ステークホルダ", category: "マネジメント", hint: "計画に影響を与える人、または影響を受ける人。", answer: "プロジェクトや事業に影響を与える、または影響を受ける利害関係者。", level: 1 },
  { id: "scope", term: "スコープ", category: "マネジメント", hint: "何を作り、どこまで行うかの範囲。", answer: "プロジェクトで実施する作業と、作成する成果物の範囲。", level: 1 },
  { id: "wbs", term: "WBS", category: "マネジメント", hint: "大きな作業を管理できる単位まで分解する。", answer: "Work Breakdown Structure。プロジェクトの作業を階層的に細分化したもの。", level: 1 },
  { id: "gantt-chart", term: "ガントチャート", category: "マネジメント", hint: "横棒で作業期間と進み具合を表す。", answer: "作業ごとの開始・終了時期や進捗を横棒で表すスケジュール図。", level: 1 },
  { id: "arrow-diagram", term: "アローダイアグラム", category: "マネジメント", hint: "矢印で作業の順序と依存関係を表す。", answer: "作業を矢印、作業間の節目を結合点で表すネットワーク図。", level: 1 },
  { id: "project-network-diagram", term: "ネットワーク図", category: "マネジメント", hint: "作業の前後関係を線でつないで表す。", answer: "プロジェクトの作業順序や依存関係をネットワーク状に表した図。", level: 1 },
  { id: "critical-path", term: "クリティカルパス", category: "マネジメント", hint: "遅れると全体の完了も遅れる作業経路。", answer: "所要時間が最も長く、遅延するとプロジェクト全体の完了が遅れる経路。", level: 1 },
  { id: "earliest-start", term: "最早開始時刻", category: "マネジメント", hint: "先行作業を考えた、最も早く始められる時点。", answer: "先行する作業が完了した後、対象作業を最も早く開始できる時刻。", level: 1 },
  { id: "latest-start", term: "最遅開始時刻", category: "マネジメント", hint: "全体を遅らせずに開始できる最後の時点。", answer: "プロジェクト完了を遅らせず、対象作業を最も遅く開始できる時刻。", level: 1 },
  { id: "float-time", term: "余裕時間", category: "マネジメント", hint: "全体を遅らせずに作業を遅らせられる時間。", answer: "プロジェクト全体の完了を遅らせずに、作業を遅らせられる時間。", level: 1 },
  { id: "pert", term: "PERT", category: "マネジメント", hint: "作業時間の不確実性を考えて日程を見積もる。", answer: "作業の順序と所要時間を基に、プロジェクト日程を分析する手法。", level: 1 },
  { id: "three-point-estimation", term: "三点見積り", category: "マネジメント", hint: "楽観・最可能・悲観の三つを使う。", answer: "楽観値、最可能値、悲観値の三つから所要時間や費用を見積もる方法。", level: 1 },
  { id: "project-risk", term: "リスク", category: "マネジメント", hint: "目標へ良いまたは悪い影響を与える不確実な出来事。", answer: "発生するとプロジェクト目標へ影響を与える不確実な事象。", level: 1 },
  { id: "risk-register", term: "リスク登録簿", category: "マネジメント", hint: "危険の内容・評価・対応を一覧で管理する。", answer: "特定したリスク、その評価、対応策、担当者などを記録する一覧。", level: 1 },
  { id: "quality-management", term: "品質管理", category: "マネジメント", hint: "成果物が求められる水準を満たすようにする。", answer: "成果物やプロセスが品質要求を満たすよう、計画・確認・改善する活動。", level: 1 },
  { id: "procurement-management", term: "調達管理", category: "マネジメント", hint: "外部から必要な製品やサービスを入手する。", answer: "外部から製品やサービスを購入・契約し、納入や契約を管理する活動。", level: 1 },
  { id: "schedule-variance", term: "SV", category: "マネジメント", hint: "出来高と計画価値の差から進捗のずれを見る。", answer: "Schedule Variance。EVMで、計画に対して進んでいるか遅れているかを表す差。", level: 1 },
  { id: "cost-variance", term: "CV", category: "マネジメント", hint: "出来高と実際の費用の差から予算のずれを見る。", answer: "Cost Variance。EVMで、予算に対するコストの超過・節約を表す差。", level: 1 },
  { id: "schedule-performance-index", term: "SPI", category: "マネジメント", hint: "計画に対する進捗の効率を比率で見る。", answer: "Schedule Performance Index。EVMで、計画に対する進捗効率を表す指標。", level: 1 },
  { id: "cost-performance-index", term: "CPI", category: "マネジメント", hint: "使った費用に対する出来高の効率を比率で見る。", answer: "Cost Performance Index。EVMで、実際のコストに対する費用効率を表す指標。", level: 1 },
  { id: "estimate-at-completion", term: "EAC", category: "マネジメント", hint: "現在の実績を基に完了時の総費用を見積もる。", answer: "Estimate At Completion。現在の進捗や費用効率から予測する、完了時の総コスト。", level: 1 },
  { id: "it-service-management", term: "ITサービスマネジメント", category: "マネジメント", hint: "ITを技術ではなく利用者へのサービスとして管理する。", answer: "利用者へ価値あるITサービスを継続提供するために、設計・運用・改善する活動。", level: 1 },
  { id: "service-desk", term: "サービスデスク", category: "マネジメント", hint: "利用者からの問合せや障害連絡を受ける窓口。", answer: "利用者からの問合せ、インシデント、サービス要求を一元的に受け付ける窓口。", level: 1 },
  { id: "release-management", term: "リリース管理", category: "マネジメント", hint: "変更を本番環境へ安全に導入する。", answer: "新しい機能や変更をまとめ、本番環境へ計画的に展開する管理活動。", level: 1 },
  { id: "cmdb", term: "CMDB", category: "マネジメント", hint: "機器やソフトの構成情報と関係を保存する。", answer: "Configuration Management Database。構成アイテムとその関係を管理するデータベース。", level: 1 },
  { id: "capacity-management", term: "キャパシティ管理", category: "マネジメント", hint: "将来の需要に必要な処理能力を確保する。", answer: "サービス需要に合う性能や容量を、費用とのバランスを取りながら確保する管理。", level: 1 },
  { id: "backup", term: "バックアップ", category: "マネジメント", hint: "障害や誤操作に備えて別のコピーを保存する。", answer: "データ消失に備え、復旧に使う複製を別の場所へ保存すること。", level: 1 },
  { id: "restore", term: "リストア", category: "マネジメント", hint: "保存していたコピーから元へ戻す。", answer: "バックアップしたデータを使い、システムやデータを復元する作業。", level: 1 },
  { id: "disaster-recovery", term: "災害復旧", category: "マネジメント", hint: "大規模な被害後にITサービスを戻す。", answer: "災害などで停止したITシステムやデータを復旧するための計画と活動。", level: 1 },
  { id: "bcp", term: "BCP", category: "マネジメント", hint: "災害時にも重要業務を止めないための計画。", answer: "Business Continuity Plan。緊急時に重要業務を継続・早期復旧するための計画。", level: 1, confusion: "BCMは事業継続を管理・改善する活動" },
  { id: "bcm", term: "BCM", category: "マネジメント", hint: "事業継続の計画を作り、訓練・改善する。", answer: "Business Continuity Management。事業継続の方針や計画を継続的に管理・改善する活動。", level: 1, confusion: "BCPは緊急時の具体的な事業継続計画" },
  { id: "system-audit", term: "システム監査", category: "マネジメント", hint: "独立した立場で情報システムを点検する。", answer: "情報システムの安全性、信頼性、有効性などを独立した立場で評価する活動。", level: 1 },
  { id: "auditor", term: "監査人", category: "マネジメント", hint: "点検対象から独立して評価する人。", answer: "監査対象から独立した立場で、証拠を基に評価や助言を行う人。", level: 1 },
  { id: "audit-evidence", term: "監査証拠", category: "マネジメント", hint: "監査の結論を裏付ける資料や記録。", answer: "監査意見や判断の根拠となる、十分で適切な記録・資料・事実。", level: 1 },
  { id: "audit-working-papers", term: "監査調書", category: "マネジメント", hint: "実施した手続や判断を監査側が記録する。", answer: "監査計画、実施手続、収集した証拠、結論などを記録した文書。", level: 1 },
  { id: "audit-trail", term: "監査証跡", category: "マネジメント", hint: "処理を後からたどれる記録。", answer: "取引やシステム操作の経過を、発生から結果まで追跡できる記録。", level: 1 },
  { id: "internal-control", term: "内部統制", category: "マネジメント", hint: "組織内の不正や誤りを防ぎ、業務を適切に進める。", answer: "業務の有効性、財務報告の信頼性、法令遵守などを確保する組織内の仕組み。", level: 1 },
  { id: "it-controls", term: "IT統制", category: "マネジメント", hint: "情報システムに関する組織内の管理策。", answer: "情報システムを適切に管理し、業務や情報の信頼性を保つための統制。", level: 1 },
  { id: "general-it-controls", term: "全般統制", category: "マネジメント", hint: "組織のIT環境全体に共通する管理。", answer: "開発、運用、アクセス管理など、情報システム全体に共通する統制。", level: 1, confusion: "業務処理統制は個別の業務処理へ組み込む" },
  { id: "application-controls", term: "業務処理統制", category: "マネジメント", hint: "入力・処理・出力の正しさを個別業務で確認する。", answer: "個別の業務システムで、入力・処理・出力の正確性や完全性を確保する統制。", level: 1, confusion: "全般統制はIT環境全体に共通する" },
  { id: "segregation-of-duties", term: "職務分掌", category: "マネジメント", hint: "一人に承認と実行を集中させない。", answer: "不正や誤りを防ぐため、相互にけん制できるよう権限や業務を複数人へ分けること。", level: 1 },
  { id: "caat", term: "CAAT", category: "マネジメント", hint: "監査でコンピュータを使って大量データを検査する。", answer: "Computer Assisted Audit Techniques。監査でデータ抽出・分析などにコンピュータを利用する技法。", level: 1 },
  { id: "dx", term: "DX", category: "ストラテジ", hint: "デジタル技術で業務だけでなく事業や組織も変える。", answer: "デジタル技術を活用し、業務・組織・事業モデルを変革して価値を生み出すこと。", level: 1 },
  { id: "bpo", term: "BPO", category: "ストラテジ", hint: "業務プロセスをまとめて外部へ任せる。", answer: "Business Process Outsourcing。特定の業務プロセスを継続的に外部委託すること。", level: 1 },
  { id: "outsourcing", term: "アウトソーシング", category: "ストラテジ", hint: "自社の業務や機能を外部へ任せる。", answer: "自社の業務や機能の一部を、外部の専門企業へ委託すること。", level: 1 },
  { id: "cloud-computing", term: "クラウドコンピューティング", category: "ストラテジ", hint: "ネットワーク経由で必要なIT資源を利用する。", answer: "サーバやソフトウェアなどのIT資源を、ネットワーク経由で必要に応じて利用する形態。", level: 1 },
  { id: "saas", term: "SaaS", category: "ストラテジ", hint: "完成したアプリケーションをサービスとして使う。", answer: "Software as a Service。事業者が提供するアプリケーションをネットワーク経由で利用する形態。", level: 1 },
  { id: "paas", term: "PaaS", category: "ストラテジ", hint: "アプリの開発・実行環境をサービスとして使う。", answer: "Platform as a Service。アプリケーションの開発・実行基盤をサービスとして利用する形態。", level: 1 },
  { id: "iaas", term: "IaaS", category: "ストラテジ", hint: "サーバやストレージなどの基盤をサービスとして使う。", answer: "Infrastructure as a Service。仮想サーバやストレージなどのIT基盤を利用する形態。", level: 1 },
  { id: "on-premises", term: "オンプレミス", category: "ストラテジ", hint: "自社の施設や管理下にシステムを置く。", answer: "サーバやソフトウェアを自社で保有・管理して利用する形態。", level: 1, confusion: "クラウドは事業者のIT資源をネットワーク経由で利用する" },
  { id: "public-cloud", term: "パブリッククラウド", category: "ストラテジ", hint: "事業者の共通基盤を複数利用者で使う。", answer: "クラウド事業者が広く提供し、複数の利用者が共有するクラウド環境。", level: 1 },
  { id: "private-cloud", term: "プライベートクラウド", category: "ストラテジ", hint: "特定の組織専用の環境を使う。", answer: "一つの組織が専用で利用するクラウド環境。", level: 1 },
  { id: "hybrid-cloud", term: "ハイブリッドクラウド", category: "ストラテジ", hint: "異なる種類の環境を組み合わせる。", answer: "パブリッククラウド、プライベートクラウド、オンプレミスなどを組み合わせる構成。", level: 1 },
  { id: "edge-computing", term: "エッジコンピューティング", category: "ストラテジ", hint: "データが生まれる場所の近くで処理する。", answer: "端末や現場に近い場所でデータを処理し、遅延や通信量を減らす方式。", level: 1 },
  { id: "artificial-intelligence", term: "AI", category: "ストラテジ", hint: "認識・判断など人の知的活動を機械で行う。", answer: "Artificial Intelligence。学習や推論など、人の知的活動をコンピュータで実現する技術。", level: 1 },
  { id: "machine-learning", term: "機械学習", category: "ストラテジ", hint: "データから規則や判断方法を学ぶ。", answer: "データからパターンを学習し、予測や分類などを行うAI技術。", level: 1 },
  { id: "supervised-learning", term: "教師あり学習", category: "ストラテジ", hint: "正解付きのデータから学ぶ。", answer: "入力と正解の組を使い、未知データの分類や予測を学習する方法。", level: 1 },
  { id: "unsupervised-learning", term: "教師なし学習", category: "ストラテジ", hint: "正解を与えず、データのまとまりや特徴を見つける。", answer: "正解ラベルのないデータから、構造やグループ、特徴を見つける学習方法。", level: 1 },
  { id: "reinforcement-learning", term: "強化学習", category: "ストラテジ", hint: "行動の結果として得る報酬を大きくする。", answer: "試行錯誤を通じて、得られる報酬が大きくなる行動方針を学ぶ方法。", level: 1 },
  { id: "generative-ai", term: "生成AI", category: "ストラテジ", hint: "学習したパターンから新しい文章や画像などを作る。", answer: "学習データを基に、文章・画像・音声などの新しい内容を生成するAI。", level: 1 },
  { id: "rpa", term: "RPA", category: "ストラテジ", hint: "定型的なパソコン操作をソフトウェアで自動化する。", answer: "Robotic Process Automation。人が行う定型的なPC操作をソフトウェアで自動化する仕組み。", level: 1 },
  { id: "sfa", term: "SFA", category: "ストラテジ", hint: "営業活動や商談の進捗を管理する。", answer: "Sales Force Automation。顧客対応や商談などの営業活動を支援・管理する仕組み。", level: 1 },
  { id: "mrp", term: "MRP", category: "ストラテジ", hint: "生産計画から必要な資材量と時期を求める。", answer: "Material Requirements Planning。生産計画を基に必要な資材の量と時期を計画する手法。", level: 1 },
  { id: "plm", term: "PLM", category: "ストラテジ", hint: "製品の企画から廃棄までの情報を管理する。", answer: "Product Lifecycle Management。製品の企画・設計・製造・保守・廃棄までの情報を管理する。", level: 1 },
  { id: "plc", term: "PLC", category: "ストラテジ", hint: "工場の機械や設備を制御する専用装置。", answer: "Programmable Logic Controller。プログラムによって産業機械や製造設備を制御する装置。", level: 1 },
  { id: "traceability", term: "トレーサビリティ", category: "ストラテジ", hint: "原材料から販売まで履歴をたどれる。", answer: "製品の原材料、製造、流通などの履歴を追跡できる性質。", level: 1 },
  { id: "edi", term: "EDI", category: "ストラテジ", hint: "企業間の注文や請求データを電子的に交換する。", answer: "Electronic Data Interchange。企業間の商取引データを標準形式で電子交換する仕組み。", level: 1 },
  { id: "pos", term: "POS", category: "ストラテジ", hint: "商品が売れた時点で情報を記録する。", answer: "Point of Sale。販売時点で商品、数量、時刻などの情報を収集・管理する仕組み。", level: 1 },
  { id: "bi", term: "BI", category: "ストラテジ", hint: "社内データを分析して意思決定へ生かす。", answer: "Business Intelligence。蓄積したデータを分析・可視化し、経営判断を支援する仕組み。", level: 1 },
  { id: "big-data", term: "ビッグデータ", category: "ストラテジ", hint: "量・種類・発生速度が大きいデータ群。", answer: "従来の方法では扱いにくいほど、大量・多様・高速に発生するデータ。", level: 1 },
  { id: "data-mining", term: "データマイニング", category: "ストラテジ", hint: "大量データから役立つ規則や傾向を掘り出す。", answer: "大量のデータを分析し、隠れた規則性や傾向、関係を見つけること。", level: 1 },
  { id: "management-strategy", term: "経営戦略", category: "ストラテジ", hint: "長期的な目標と、達成のための方向性を決める。", answer: "企業が競争環境の中で目標を達成するための長期的な方針。", level: 1 },
  { id: "three-c-analysis", term: "3C分析", category: "ストラテジ", hint: "顧客・競合・自社の三つから環境を見る。", answer: "Customer（顧客）、Competitor（競合）、Company（自社）の観点で事業環境を分析する手法。", level: 1 },
  { id: "five-forces", term: "ファイブフォース分析", category: "ストラテジ", hint: "業界の競争を五つの力から見る。", answer: "既存競合、新規参入、代替品、売り手、買い手の五つの力から業界を分析する手法。", level: 1 },
  { id: "value-chain", term: "バリューチェーン", category: "ストラテジ", hint: "企業活動を価値を生む連鎖として見る。", answer: "調達、製造、販売、サービスなどの活動を、価値を生み出す連鎖として分析する考え方。", level: 1 },
  { id: "competitive-advantage", term: "競争優位", category: "ストラテジ", hint: "競合より有利な状態を継続して持つ。", answer: "競合他社より優れた価値や低いコストなどを持ち、有利に競争できる状態。", level: 1 },
  { id: "differentiation-strategy", term: "差別化戦略", category: "ストラテジ", hint: "独自の価値で競合との違いを作る。", answer: "製品やサービスへ独自の価値を持たせ、競合との違いで優位に立つ戦略。", level: 1 },
  { id: "cost-leadership-strategy", term: "コストリーダシップ戦略", category: "ストラテジ", hint: "業界内で低い費用構造を目指す。", answer: "競合より低いコストで提供できる体制を作り、価格や利益で優位に立つ戦略。", level: 1 },
  { id: "focus-strategy", term: "集中戦略", category: "ストラテジ", hint: "特定の市場や顧客層へ資源を絞る。", answer: "特定の顧客層や地域などに対象を絞り、その市場で優位を目指す戦略。", level: 1 },
  { id: "blue-ocean-strategy", term: "ブルーオーシャン戦略", category: "ストラテジ", hint: "競争の激しくない新しい市場を作る。", answer: "競争相手の少ない新しい市場を創り、競争自体を避けようとする戦略。", level: 1 },
  { id: "benchmarking", term: "ベンチマーキング", category: "ストラテジ", hint: "優れた企業や業務を基準に自社を比べる。", answer: "優れた他社の方法や指標と自社を比較し、改善へ生かす手法。", level: 1 },
  { id: "kgi", term: "KGI", category: "ストラテジ", hint: "最終的に達成したい結果を測る。", answer: "Key Goal Indicator。事業や活動の最終目標の達成度を表す指標。", level: 1, confusion: "KPIは目標へ進む過程を測る重要指標" },
  { id: "csf", term: "CSF", category: "ストラテジ", hint: "目標達成のため特に成功させるべき要因。", answer: "Critical Success Factor。目標達成のために重要となる成功要因。", level: 1 },
  { id: "bsc", term: "BSC", category: "ストラテジ", hint: "財務だけでなく顧客・業務・学習からも評価する。", answer: "Balanced Scorecard。財務、顧客、業務プロセス、学習と成長の視点で戦略を管理する手法。", level: 1 },
  { id: "innovation", term: "イノベーション", category: "ストラテジ", hint: "新しい技術や仕組みから価値を生み出す。", answer: "新しい製品、サービス、技術、仕組みなどによって社会や市場へ価値を生み出すこと。", level: 1 },
  { id: "fixed-cost", term: "固定費", category: "ストラテジ", hint: "生産量や売上が変わっても大きく変化しない費用。", answer: "売上高や生産量の増減にかかわらず、一定期間にほぼ一定額発生する費用。", level: 1, confusion: "変動費は売上や生産量に応じて増減する" },
  { id: "variable-cost", term: "変動費", category: "ストラテジ", hint: "生産量や売上に応じて増減する費用。", answer: "売上高や生産量の増減に応じて変化する費用。", level: 1, confusion: "固定費は売上や生産量にかかわらず発生する" },
  { id: "contribution-margin", term: "限界利益", category: "ストラテジ", hint: "売上から売上に連動する費用を引く。", answer: "売上高から変動費を差し引いた利益。固定費の回収と利益に充てられる。", level: 1 },
  { id: "break-even-point", term: "損益分岐点", category: "ストラテジ", hint: "利益も損失もゼロになる境目。", answer: "売上高と費用が等しくなり、利益が0になる売上水準。", level: 1 },
  { id: "roi", term: "ROI", category: "ストラテジ", hint: "投じた金額に対してどれだけ利益を得たか。", answer: "Return on Investment。投資額に対する利益の割合を表す指標。", level: 1 },
  { id: "roe", term: "ROE", category: "ストラテジ", hint: "株主が出した資本を使って得た利益を見る。", answer: "Return on Equity。自己資本に対する当期純利益の割合を表す指標。", level: 1 },
  { id: "roa", term: "ROA", category: "ストラテジ", hint: "会社が持つ資産全体を使って得た利益を見る。", answer: "Return on Assets。総資産に対する利益の割合を表す指標。", level: 1 },
  { id: "cash-flow", term: "キャッシュフロー", category: "ストラテジ", hint: "一定期間のお金の入りと出を表す。", answer: "企業活動による現金や現金同等物の流入・流出。", level: 1 },
  { id: "assets", term: "資産", category: "ストラテジ", hint: "会社が持つ財産や将来の利益につながるもの。", answer: "現金、商品、設備など、企業が保有する経済的価値のあるもの。", level: 1 },
  { id: "liabilities", term: "負債", category: "ストラテジ", hint: "将来支払う義務があるもの。", answer: "借入金や買掛金など、企業が将来返済・支払する義務。", level: 1 },
  { id: "net-assets", term: "純資産", category: "ストラテジ", hint: "会社の財産から返済義務を差し引いた部分。", answer: "資産から負債を差し引いた部分。株主資本などで構成される。", level: 1 },
  { id: "depreciation", term: "減価償却", category: "ストラテジ", hint: "設備の取得費用を使用期間へ分ける。", answer: "建物や設備などの取得費用を、使用できる期間にわたって費用配分する会計処理。", level: 1 },
  { id: "present-value", term: "現在価値", category: "ストラテジ", hint: "将来受け取るお金を今の価値へ換算する。", answer: "将来の金額を、利率や時間を考慮して現在時点の価値へ換算したもの。", level: 1 },
  { id: "npv", term: "NPV", category: "ストラテジ", hint: "将来の収入を今の価値に直し、投資額と比べる。", answer: "Net Present Value。将来キャッシュフローの現在価値から投資額を差し引いた値。", level: 1 },
  { id: "payback-period", term: "投資回収期間", category: "ストラテジ", hint: "投じた資金を収入で取り戻すまでの時間。", answer: "投資によって得られる収入で、初期投資額を回収するまでの期間。", level: 1 },
  { id: "intellectual-property-rights", term: "知的財産権", category: "ストラテジ", hint: "創作や発明、ブランドなどを法的に守る権利の総称。", answer: "発明、著作物、デザイン、商標など、知的な成果を保護する権利の総称。", level: 1 },
  { id: "copyright", term: "著作権", category: "ストラテジ", hint: "文章・音楽・プログラムなどの創作物を守る。", answer: "創作した著作物の利用を管理し、無断複製などを防ぐ権利。創作時に発生する。", level: 1 },
  { id: "patent-right", term: "特許権", category: "ストラテジ", hint: "新しい技術的な発明を一定期間保護する。", answer: "新規性などを満たす発明を、出願・審査によって一定期間独占できる権利。", level: 1 },
  { id: "utility-model-right", term: "実用新案権", category: "ストラテジ", hint: "物の形状や構造の考案を守る。", answer: "物品の形状、構造、組合せに関する考案を保護する権利。", level: 1 },
  { id: "design-right", term: "意匠権", category: "ストラテジ", hint: "製品の見た目のデザインを守る。", answer: "物品や画像などの外観デザインを、登録によって保護する権利。", level: 1 },
  { id: "trademark-right", term: "商標権", category: "ストラテジ", hint: "商品やサービスを区別する名称・マークを守る。", answer: "商品やサービスを識別する名称、図形、マークなどを登録して保護する権利。", level: 1 },
  { id: "trade-secret", term: "営業秘密", category: "ストラテジ", hint: "秘密として管理された有用な事業情報。", answer: "秘密管理され、有用で公然と知られていない技術上・営業上の情報。", level: 1 },
  { id: "unfair-competition-prevention-act", term: "不正競争防止法", category: "ストラテジ", hint: "営業秘密の不正取得や商品表示のまねを規制する。", answer: "営業秘密の不正利用や商品表示の混同など、不公正な競争行為を規制する法律。", level: 1 },
  { id: "personal-information-protection-act", term: "個人情報保護法", category: "ストラテジ", hint: "個人を識別できる情報の取扱いを定める。", answer: "個人情報の適正な取得・利用・管理などを事業者へ求める法律。", level: 1 },
  { id: "unauthorized-access-act", term: "不正アクセス禁止法", category: "ストラテジ", hint: "他人の認証情報を使った侵入などを禁止する。", answer: "他人のID・パスワード利用などによる不正アクセスを禁止する法律。", level: 1 },
  { id: "copyright-act", term: "著作権法", category: "ストラテジ", hint: "創作物とその利用に関する権利を定める。", answer: "著作物と著作者の権利、利用方法などを定める法律。", level: 1 },
  { id: "patent-act", term: "特許法", category: "ストラテジ", hint: "発明の保護と利用について定める。", answer: "発明を保護・活用するため、特許の要件や手続、権利を定める法律。", level: 1 },
  { id: "worker-dispatch-act", term: "労働者派遣法", category: "ストラテジ", hint: "派遣元と雇用関係を持ち、派遣先の指揮で働く。", answer: "労働者派遣事業の適正な運営と、派遣労働者の保護について定める法律。", level: 1 },
  { id: "contract-for-work", term: "請負", category: "ストラテジ", hint: "仕事の完成に対して報酬を支払う契約。", answer: "受注者が仕事の完成を約束し、発注者が完成結果へ報酬を支払う契約。", level: 1, confusion: "準委任は業務の遂行を委ねる契約" },
  { id: "quasi-mandate", term: "準委任", category: "ストラテジ", hint: "完成ではなく、業務を適切に行うことを任せる。", answer: "法律行為以外の業務を、適切に遂行することを委ねる契約。", level: 1, confusion: "請負は仕事の完成を約束する契約" },
  { id: "subcontract-transaction-act", term: "中小受託取引適正化法", category: "ストラテジ", hint: "委託事業者と中小受託事業者の取引を公正にする。", answer: "委託取引での代金支払遅延や不当な取扱いを防ぎ、中小受託事業者を保護する法律。", level: 1 },
  { id: "iso", term: "ISO", category: "ストラテジ", hint: "国際的な規格を作る組織。", answer: "International Organization for Standardization。製品や管理方法などの国際規格を策定する機関。", level: 1 },
  { id: "jis", term: "JIS", category: "ストラテジ", hint: "日本の産業製品や方法に関する国家規格。", answer: "Japanese Industrial Standards。製品や試験方法などについて定めた日本の産業規格。", level: 1 },
  { id: "ieee", term: "IEEE", category: "ストラテジ", hint: "電気・電子・情報分野の標準化を行う専門家団体。", answer: "電気・電子・情報技術分野の研究や標準化を行う国際的な専門家組織。", level: 1 },
  { id: "rfc", term: "RFC", category: "ストラテジ", hint: "インターネット技術の仕様や提案を公開する文書群。", answer: "Request for Comments。インターネット技術の仕様や運用方法などを記した文書。", level: 1 },
];

type Progress = Record<string, { correct: number; wrong: number; unsure?: number; confident?: number; retention?: number; quizCount?: number }>;
type ModeKey = "study" | "quiz" | "priority" | "weak" | "unseen" | "lowquiz" | "special";
type Collection = "regular" | "special";
type CollectionOverrides = Record<string, Collection>;
type ModeStats = Record<ModeKey, { correct: number; wrong: number }>;
type QuestionStats = Record<string, Partial<Record<ModeKey, { correct: number; wrong: number }>>>;
type SessionAnswer = { id: string; result: "correct" | "wrong" };

const categoryNames = ["すべて", "セキュリティ", "データベース", "ネットワーク", "マネジメント", "ストラテジ", "テクノロジ"] as const;
const retentionResetKey = "ap-study-retention-reset-2026-08-27";
const collectionStorageKey = "ap-study-collections-v1";
const disabledStorageKey = "ap-study-disabled-ids-v1";
const backupKeys = ["ap-study-progress", "ap-study-round", "ap-study-priority-round", "ap-study-mode-stats", "ap-study-question-stats-v1", collectionStorageKey, disabledStorageKey, retentionResetKey] as const;
const modeKeys: ModeKey[] = ["study", "quiz", "priority", "weak", "unseen", "lowquiz", "special"];
const legacyTermMerges: Record<string, string> = {
  "ppm-problem-child": "ppm",
  "primary-db": "replication",
  "replica-db": "replication",
  "database-design": "conceptual-design",
  "transaction-isolation-level": "repeatable-read",
  "index-tradeoff": "database-index",
  combination: "externalization",
  socialization: "externalization",
  internalization: "externalization",
  "planning-process-group": "initiating-process-group",
  "executing-process-group": "initiating-process-group",
  "controlling-process-group": "initiating-process-group",
  "closing-process-group": "initiating-process-group",
  "mm1-utilization": "mm1-queue",
  "mm1-service-time": "mm1-system-time",
  "signal-period": "signal-frequency",
};
const legacyTermCopies: Record<string, string[]> = {
  "sync-replication": ["async-replication"],
  "conceptual-design": ["logical-design", "physical-design"],
  "read-uncommitted": ["read-committed"],
  "repeatable-read": ["serializable-isolation"],
  "full-backup": ["differential-backup", "incremental-backup"],
  "marketing-4p-4c": ["marketing-4c"],
  "memory-first-fit": ["memory-best-fit", "memory-worst-fit"],
};

function mergedTermId(id: string) {
  return legacyTermMerges[id] ?? id;
}

function recordRetention(record: Progress[string]) {
  if (typeof record.retention === "number") return Math.max(0, Math.min(100, record.retention));
  return Math.max(5, Math.min(95, 35 + (record.correct ?? 0) * 20 - (record.wrong ?? 0) * 22));
}

function migrateProgressRecords(savedProgress: Progress) {
  const migrated = { ...savedProgress };
  Object.entries(legacyTermMerges).forEach(([sourceId, targetId]) => {
    const source = migrated[sourceId];
    if (!source) return;
    const target = migrated[targetId];
    migrated[targetId] = target ? {
      correct: (target.correct ?? 0) + (source.correct ?? 0),
      wrong: (target.wrong ?? 0) + (source.wrong ?? 0),
      unsure: (target.unsure ?? 0) + (source.unsure ?? 0),
      confident: (target.confident ?? 0) + (source.confident ?? 0),
      quizCount: (target.quizCount ?? 0) + (source.quizCount ?? 0),
      retention: Math.min(recordRetention(target), recordRetention(source)),
    } : { ...source };
    delete migrated[sourceId];
  });
  Object.entries(legacyTermCopies).forEach(([sourceId, targetIds]) => {
    const source = migrated[sourceId];
    if (!source) return;
    targetIds.forEach((targetId) => {
      if (!migrated[targetId]) migrated[targetId] = { ...source };
    });
  });
  return Object.fromEntries(Object.entries(migrated).filter(([id]) => terms.some((item) => item.id === id))) as Progress;
}

function migrateQuestionStats(savedStats: QuestionStats) {
  const migrated: QuestionStats = Object.fromEntries(Object.entries(savedStats).map(([id, stats]) => [id, { ...stats }]));
  Object.entries(legacyTermMerges).forEach(([sourceId, targetId]) => {
    const source = migrated[sourceId];
    if (!source) return;
    const target = migrated[targetId] ?? {};
    const merged: Partial<Record<ModeKey, { correct: number; wrong: number }>> = { ...target };
    modeKeys.forEach((key) => {
      if (!source[key] && !target[key]) return;
      merged[key] = {
        correct: (target[key]?.correct ?? 0) + (source[key]?.correct ?? 0),
        wrong: (target[key]?.wrong ?? 0) + (source[key]?.wrong ?? 0),
      };
    });
    migrated[targetId] = merged;
    delete migrated[sourceId];
  });
  Object.entries(legacyTermCopies).forEach(([sourceId, targetIds]) => {
    const source = migrated[sourceId];
    if (!source) return;
    targetIds.forEach((targetId) => {
      if (!migrated[targetId]) migrated[targetId] = Object.fromEntries(Object.entries(source).map(([key, value]) => [key, value ? { ...value } : value]));
    });
  });
  return Object.fromEntries(Object.entries(migrated).filter(([id]) => terms.some((item) => item.id === id))) as QuestionStats;
}

function migrateCollectionOverrides(saved: CollectionOverrides) {
  const migrated = { ...saved };
  Object.entries(legacyTermMerges).forEach(([sourceId, targetId]) => {
    if (!migrated[targetId] && migrated[sourceId]) migrated[targetId] = migrated[sourceId];
    delete migrated[sourceId];
  });
  Object.entries(legacyTermCopies).forEach(([sourceId, targetIds]) => {
    targetIds.forEach((targetId) => {
      if (!migrated[targetId] && migrated[sourceId]) migrated[targetId] = migrated[sourceId];
    });
  });
  return Object.fromEntries(Object.entries(migrated).filter(([id, value]) => terms.some((item) => item.id === id) && (value === "regular" || value === "special"))) as CollectionOverrides;
}

function migrateDisabledIds(ids: string[]) {
  const migrated = ids.flatMap((id) => {
    const targetId = mergedTermId(id);
    return [targetId, ...(legacyTermCopies[targetId] ?? [])];
  });
  return [...new Set(migrated.filter((id) => terms.some((item) => item.id === id)))];
}

function getCollection(item: Term, overrides: CollectionOverrides): Collection {
  return overrides[item.id] ?? (item.collection === "special" ? "special" : "regular");
}

function isUnseen(item: Term, savedProgress: Progress) {
  const record = savedProgress[item.id];
  return !record || (record.correct ?? 0) + (record.wrong ?? 0) === 0;
}

function isWeak(item: Term, savedProgress: Progress) {
  if (isUnseen(item, savedProgress)) return false;
  return getRetention(item, savedProgress) < 60;
}

function buildRound(selectedCategory: "すべて" | Category, savedProgress: Progress, previousRound: string[] = [], onlyPriority = false, onlyUnseen = false, onlyWeak = false, overrides: CollectionOverrides = {}, collection: Collection = "regular", disabledIds: string[] = []) {
  const pool = terms.filter((item) => {
    return (selectedCategory === "すべて" || item.category === selectedCategory)
      && getCollection(item, overrides) === collection
      && !disabledIds.includes(item.id)
      && (!onlyPriority || getRetention(item, savedProgress) < 40)
      && (!onlyUnseen || isUnseen(item, savedProgress))
      && (!onlyWeak || isWeak(item, savedProgress));
  });
  const weightedShuffle = (items: Term[]) => items
    .map((item) => {
      const record = savedProgress[item.id];
      const unseenBoost = isUnseen(item, savedProgress) ? 12 : 0;
      const weight = Math.max(1, item.level * 2 + unseenBoost + (record?.wrong ?? 0) * 3 + (100 - getRetention(item, savedProgress)) / 18 - (record?.correct ?? 0) * 0.5);
      return { item, key: Math.pow(Math.random(), 1 / weight) };
    })
    .sort((a, b) => b.key - a.key)
    .map(({ item }) => item);

  const fresh = weightedShuffle(pool.filter((item) => !previousRound.includes(item.id)));
  const previous = weightedShuffle(pool.filter((item) => previousRound.includes(item.id)));
  return [...fresh, ...previous].slice(0, 5).map((item) => item.id);
}

function buildLowQuizRound(selectedCategory: "すべて" | Category, savedProgress: Progress, previousRound: string[] = [], overrides: CollectionOverrides = {}, disabledIds: string[] = []) {
  const pool = shuffle(terms.filter((item) => !disabledIds.includes(item.id) && getCollection(item, overrides) === "regular" && (selectedCategory === "すべて" || item.category === selectedCategory)));
  return pool.sort((a, b) => {
    const countDifference = (savedProgress[a.id]?.quizCount ?? 0) - (savedProgress[b.id]?.quizCount ?? 0);
    if (countDifference !== 0) return countDifference;
    return Number(previousRound.includes(a.id)) - Number(previousRound.includes(b.id));
  }).slice(0, 5).map((item) => item.id);
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

const confusionGroups = [
  ["cc", "rootkit", "ransomware", "honeypot"],
  ["traversal", "prepared", "csrf", "httponly"],
  ["password-list", "spray", "dictionary-attack", "phishing"],
  ["hijack", "fixation", "csrf", "httponly"],
  ["https", "publickey", "signature", "ca", "keydelivery"],
  ["oauth", "sso", "account-lock", "crl"],
  ["ipsec", "tunnel", "esp", "dmz", "packet"],
  ["heuristic", "polymorphic", "rootkit", "ransomware", "sandbox", "honeypot"],
  ["mitm", "mitb", "non-repudiation", "integrity"],
  ["dirty", "nonrepeatable", "phantom", "serializability"],
  ["ddl", "dml", "dcl", "tcl"],
  ["truncate", "drop", "alter", "grant"],
  ["group-by", "having", "orderby", "distinct", "aggregate"],
  ["union", "exists", "subquery", "in", "between"],
  ["is-null", "like", "in", "between"],
  ["rollforward", "transaction-log", "checkpoint", "savepoint", "transaction"],
  ["data-dictionary", "metadata", "external-schema", "conceptual-schema"],
  ["why-split-tables", "normalization", "first-normal-form", "second-normal-form"],
  ["acid", "transaction", "serializability", "read-uncommitted", "repeatable-read"],
  ["lock", "shared-lock", "deadlock", "consistency"],
  ["swot-external", "ppm", "pest", "segmentation"],
  ["balance-sheet", "income-statement", "intellectual-assets", "core-competence"],
  ["incident-management", "problem-management", "service-request"],
  ["sla", "service-level-management", "kpi", "itil"],
  ["configuration-management", "change-management", "event-management", "knowledge-management"],
  ["availability-management", "it-service-continuity-management", "incident-management", "problem-management"],
  ["itil", "iso-iec-20000", "service-level-management", "sla"],
  ["crm", "scm", "erp", "bpr"],
  ["segmentation", "targeting", "positioning", "product-life-cycle"],
  ["fp-method", "analogy-estimation", "evm-cost", "feasibility-study"],
  ["napt", "dhcp", "spf", "packet"],
  ["functional-dependency", "partial-functional-dependency", "transitive-functional-dependency", "normalization"],
  ["unique-constraint", "check-constraint", "referential-integrity", "foreign-key"],
  ["bplus-tree-index", "hash-index", "composite-index", "materialized-view"],
  ["replication", "sharding", "two-phase-commit", "failover"],
  ["sync-replication", "async-replication", "replication", "sharding"],
  ["conceptual-design", "logical-design", "physical-design", "conceptual-schema"],
  ["read-uncommitted", "read-committed", "repeatable-read", "serializable-isolation"],
  ["primary-key", "candidate-key", "foreign-key", "unique-constraint"],
  ["one-to-many", "many-to-many", "junction-table", "er-diagram"],
  ["first-normal-form", "second-normal-form", "third-normal-form", "normalization"],
  ["select-sql", "insert-sql", "update-sql", "delete-sql"],
  ["where-sql", "group-by", "having", "orderby"],
  ["inner-join", "left-join", "union", "subquery"],
  ["grant", "revoke", "commit", "rollback"],
  ["shared-lock", "exclusive-lock", "lock", "deadlock"],
  ["full-backup", "differential-backup", "incremental-backup", "checkpoint"],
  ["database-index", "bplus-tree-index", "hash-index", "composite-index"],
  ["optimizer", "execution-plan", "partitioning", "database-index"],
  ["view", "materialized-view", "not-null", "check-constraint"],
  ["two-phase-commit", "failover", "replication", "sharding"],
  ["oltp", "olap", "data-warehouse", "etl"],
  ["data-mart", "data-lake", "star-schema", "data-warehouse"],
  ["exploit-code", "heuristic", "polymorphic", "rootkit"],
  ["external-schema", "conceptual-schema", "internal-schema", "view"],
  ["false-negative", "false-positive", "heuristic", "exploit-code"],
  ["hot-standby", "warm-standby", "cold-standby", "failover"],
  ["rto", "rpo", "it-service-continuity-management", "checkpoint"],
  ["externalization", "knowledge-management", "brainstorming", "delphi-method"],
  ["initiating-process-group", "tuckman-model", "evm-cost", "fp-method"],
  ["tuckman-model", "initiating-process-group", "incident-management", "problem-management"],
  ["mes", "erp", "scm", "iot"],
  ["scala-language", "soa", "iot", "mes"],
  ["delphi-method", "brainstorming", "feasibility-study", "analogy-estimation"],
  ["reverse-proxy", "napt", "packet", "dmz"],
  ["marketing-4p-4c", "marketing-4c", "segmentation", "targeting"],
  ["immersion-cooling", "warm-standby", "hot-standby", "availability-management"],
  ["soa", "erp", "scm", "crm"],
  ["mm1-queue", "mm1-system-time", "signal-frequency", "sampling-theorem"],
  ["linear-search", "binary-search", "hash-search", "bplus-tree-index"],
  ["parity-check", "crc-error-check", "hamming-code", "integrity"],
  ["logic-not", "logic-xor", "logic-nand", "logic-nor"],
  ["roc-curve", "false-positive", "false-negative", "heuristic"],
  ["sampling-theorem", "signal-frequency", "mm1-system-time", "binary-search"],
  ["memory-first-fit", "memory-best-fit", "memory-worst-fit", "partitioning"],
  ["binary-number", "hexadecimal-number", "complement", "fixed-point-number", "floating-point-number"],
  ["overflow", "underflow", "numerical-error", "floating-point-number"],
  ["logic-and", "logic-or", "logic-xor", "logic-not", "truth-table"],
  ["set-theory", "venn-diagram", "probability", "expected-value"],
  ["permutation", "mathematical-combination", "probability", "expected-value"],
  ["hash-function", "hash-collision", "chaining", "open-addressing", "hash-search"],
  ["stack", "queue", "recursion", "tree-structure"],
  ["tree-structure", "binary-tree", "b-tree", "bplus-tree-index"],
  ["breadth-first-search", "depth-first-search", "tree-structure", "queue", "stack"],
  ["bubble-sort", "selection-sort", "insertion-sort", "quick-sort"],
  ["quick-sort", "merge-sort", "heap-sort", "bubble-sort"],
  ["computational-complexity", "linear-search", "binary-search", "hash-search", "quick-sort"],
  ["big-o-constant", "big-o-logarithmic", "big-o-linear", "big-o-n-log-n", "big-o-quadratic", "computational-complexity"],
  ["cpu", "clock-frequency", "instruction-cycle", "mips", "flops", "register"],
  ["register", "cache-memory", "main-memory", "secondary-storage"],
  ["cache-hit-rate", "locality", "write-through", "write-back", "cache-memory"],
  ["virtual-memory", "paging", "page-fault", "page-replacement", "tlb"],
  ["lru", "fifo-page-replacement", "thrashing", "fragmentation", "page-replacement"],
  ["process", "thread", "multitasking", "interrupt", "semaphore"],
  ["raid0", "raid1", "raid5", "raid6"],
  ["virtualization", "hypervisor", "container", "clustering"],
  ["clustering", "load-balancing", "failover", "redundancy"],
  ["fail-soft", "fail-safe", "foolproof", "fault-tolerant"],
  ["mtbf", "mttr", "system-availability-rate", "availability", "availability-management", "redundancy"],
  ["osi-model", "tcp-ip", "tcp", "ip-address"],
  ["mac-address", "ip-address", "ipv4", "ipv6"],
  ["subnet-mask", "cidr", "default-gateway", "ip-address"],
  ["router", "l2-switch", "l3-switch", "vlan"],
  ["routing", "routing-table", "default-gateway", "router"],
  ["rip", "ospf", "bgp", "routing-table"],
  ["arp", "dhcp", "icmp", "dns"],
  ["dns", "dns-cache", "dnssec", "dns-cache-poisoning"],
  ["tcp", "udp", "port-number", "three-way-handshake"],
  ["http", "https", "ftp", "sftp", "ssh"],
  ["smtp", "pop3", "imap", "spf"],
  ["snmp", "ntp", "icmp", "dhcp"],
  ["nat", "napt", "proxy-server", "reverse-proxy"],
  ["cdn", "qos", "load-balancing", "proxy-server"],
  ["vpn", "ipsec", "tls", "https"],
  ["wireless-lan", "ssid", "wpa2", "wpa3"],
  ["csma-cd", "csma-ca", "l2-switch", "wireless-lan"],
  ["firewall", "waf", "ids", "ips", "packet"],
  ["confidentiality", "integrity", "availability", "authenticity", "accountability"],
  ["authentication", "authorization", "access-control", "least-privilege"],
  ["multi-factor-authentication", "biometric-authentication", "password-authentication", "sso"],
  ["salt", "password-authentication", "password-list", "dictionary-attack"],
  ["symmetric-key-encryption", "publickey", "hybrid-encryption", "keydelivery"],
  ["aes", "rsa", "elliptic-curve-cryptography", "diffie-hellman"],
  ["cryptographic-hash", "sha", "hash-function", "integrity"],
  ["message-authentication-code", "hmac", "signature", "cryptographic-hash"],
  ["digital-certificate", "ca", "pki", "crl", "ocsp"],
  ["tls", "https", "ipsec", "dnssec"],
  ["malware", "computer-virus", "worm", "trojan-horse"],
  ["spyware", "keylogger", "rootkit", "ransomware"],
  ["bot", "botnet", "cc", "ddos-attack"],
  ["targeted-attack", "social-engineering", "phishing", "mitm"],
  ["sql-injection", "xss", "csrf", "os-command-injection", "traversal"],
  ["buffer-overflow", "dos-attack", "ddos-attack", "exploit-code"],
  ["replay-attack", "hijack", "fixation", "mitm"],
  ["brute-force-attack", "dictionary-attack", "password-list", "spray"],
  ["dns-cache-poisoning", "arp-spoofing", "dnssec", "mitm"],
  ["vulnerability", "zero-day-attack", "security-patch", "exploit-code"],
  ["cve", "cvss", "vulnerability-assessment", "penetration-test"],
  ["siem", "soc", "csirt", "edr"],
  ["allowlist", "denylist", "defense-in-depth", "zero-trust"],
  ["risk-assessment", "risk-avoidance", "risk-reduction", "risk-transfer", "risk-retention"],
  ["isms", "security-policy", "incident-response", "digital-forensics"],
  ["relational-database", "relational-model", "tuple", "attribute", "domain"],
  ["superkey", "candidate-key", "primary-key", "composite-key", "foreign-key"],
  ["entity", "relationship", "cardinality", "er-diagram"],
  ["unnormalized-form", "first-normal-form", "second-normal-form", "third-normal-form", "bcnf"],
  ["database-redundancy", "why-split-tables", "normalization", "referential-integrity"],
  ["atomicity", "consistency", "isolation", "durability", "acid"],
  ["two-phase-locking", "shared-lock", "exclusive-lock", "serializability"],
  ["sql", "ddl", "dml", "dcl", "tcl"],
  ["create-sql", "alter", "drop", "truncate"],
  ["right-join", "left-join", "inner-join", "union"],
  ["null", "is-null", "not-null", "check-constraint"],
  ["requirements-definition", "functional-requirement", "non-functional-requirement", "scope"],
  ["external-design", "internal-design", "conceptual-design", "physical-design"],
  ["waterfall", "agile", "scrum", "xp"],
  ["scrum", "sprint", "product-backlog", "sprint-backlog"],
  ["product-owner", "scrum-master", "stakeholder", "project-management"],
  ["pair-programming", "refactoring", "continuous-integration", "continuous-delivery", "devops"],
  ["uml", "use-case-diagram", "class-diagram", "sequence-diagram"],
  ["activity-diagram", "state-transition-diagram", "sequence-diagram", "use-case-diagram"],
  ["module", "cohesion", "coupling", "encapsulation"],
  ["encapsulation", "inheritance", "polymorphism-oop", "class-diagram"],
  ["unit-test", "integration-test", "system-test", "acceptance-test"],
  ["black-box-test", "white-box-test", "static-test", "dynamic-test"],
  ["equivalence-partitioning", "boundary-value-analysis", "decision-table", "black-box-test"],
  ["statement-coverage", "branch-coverage", "condition-coverage", "white-box-test"],
  ["regression-test", "unit-test", "integration-test", "system-test"],
  ["stub", "driver", "integration-test", "unit-test"],
  ["software-review", "walkthrough", "inspection", "static-test"],
  ["v-model", "waterfall", "system-test", "acceptance-test"],
  ["version-control", "configuration-management", "change-management", "release-management"],
  ["project", "project-management", "stakeholder", "scope"],
  ["wbs", "gantt-chart", "arrow-diagram", "project-network-diagram"],
  ["critical-path", "earliest-start", "latest-start", "float-time"],
  ["pert", "three-point-estimation", "analogy-estimation", "fp-method"],
  ["schedule-variance", "cost-variance", "schedule-performance-index", "cost-performance-index", "estimate-at-completion", "evm-cost"],
  ["project-risk", "risk-register", "quality-management", "procurement-management"],
  ["it-service-management", "itil", "sla", "service-level-management"],
  ["service-desk", "incident-management", "problem-management", "service-request"],
  ["release-management", "change-management", "configuration-management", "cmdb"],
  ["capacity-management", "availability-management", "it-service-continuity-management", "service-level-management"],
  ["backup", "restore", "full-backup", "differential-backup", "incremental-backup"],
  ["disaster-recovery", "bcp", "bcm", "rto", "rpo"],
  ["system-audit", "auditor", "audit-evidence", "audit-working-papers", "audit-trail"],
  ["internal-control", "it-controls", "general-it-controls", "application-controls"],
  ["segregation-of-duties", "access-control", "least-privilege", "general-it-controls"],
  ["caat", "system-audit", "audit-evidence", "data-mining"],
  ["dx", "bpr", "bpo", "outsourcing"],
  ["cloud-computing", "saas", "paas", "iaas"],
  ["on-premises", "public-cloud", "private-cloud", "hybrid-cloud"],
  ["edge-computing", "cloud-computing", "iot", "cdn"],
  ["artificial-intelligence", "machine-learning", "generative-ai", "data-mining"],
  ["supervised-learning", "unsupervised-learning", "reinforcement-learning", "machine-learning"],
  ["rpa", "sfa", "crm", "erp"],
  ["mrp", "mes", "erp", "scm"],
  ["plm", "plc", "product-life-cycle", "mes"],
  ["traceability", "edi", "pos", "scm"],
  ["bi", "data-warehouse", "olap", "data-mining"],
  ["big-data", "data-lake", "data-warehouse", "data-mining"],
  ["management-strategy", "swot-external", "pest", "three-c-analysis"],
  ["five-forces", "value-chain", "ppm", "three-c-analysis"],
  ["competitive-advantage", "differentiation-strategy", "cost-leadership-strategy", "focus-strategy"],
  ["blue-ocean-strategy", "benchmarking", "innovation", "core-competence"],
  ["kgi", "kpi", "csf", "bsc"],
  ["fixed-cost", "variable-cost", "contribution-margin", "break-even-point"],
  ["roi", "roe", "roa", "npv"],
  ["cash-flow", "assets", "liabilities", "net-assets"],
  ["depreciation", "present-value", "npv", "payback-period"],
  ["intellectual-property-rights", "copyright", "patent-right", "trademark-right"],
  ["utility-model-right", "design-right", "patent-right", "trademark-right"],
  ["trade-secret", "unfair-competition-prevention-act", "copyright", "patent-right"],
  ["personal-information-protection-act", "unauthorized-access-act", "copyright-act", "patent-act"],
  ["worker-dispatch-act", "contract-for-work", "quasi-mandate", "subcontract-transaction-act"],
  ["iso", "jis", "ieee", "rfc"],
];

function textBigrams(text: string) {
  const normalized = text.toUpperCase().replace(/[\s・（）()／/＝=、。,.：:「」『』-]/g, "");
  const result = new Set<string>();
  for (let index = 0; index < normalized.length - 1; index += 1) result.add(normalized.slice(index, index + 2));
  return result;
}

function textSimilarity(left: string, right: string) {
  const a = textBigrams(left);
  const b = textBigrams(right);
  if (!a.size || !b.size) return 0;
  const common = [...a].filter((part) => b.has(part)).length;
  return common / (a.size + b.size - common);
}

function stableNumber(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  return hash;
}

type Difficulty = "easy" | "normal" | "hard";

function getChoices(card: Term, difficulty: Difficulty, disabledIds: string[] = []) {
  const group = confusionGroups.find((ids) => ids.includes(card.id)) ?? [];
  const candidates = terms.filter((item) => item.id !== card.id && !disabledIds.includes(item.id)).map((item) => {
    const sameConfusionGroup = group.includes(item.id);
    const score = (sameConfusionGroup ? 100 : 0)
      + (item.category === card.category ? 4 : 0)
      + textSimilarity(card.term, item.term) * 18
      + textSimilarity(card.answer, item.answer) * 6
      + (item.level === card.level ? 1 : 0);
    return { item, score, sameConfusionGroup, sameCategory: item.category === card.category };
  }).sort((a, b) => b.score - a.score);

  let picked: typeof candidates = [];
  if (difficulty === "easy") {
    // やさしめでも一つは近い選択肢を含め、消去法だけで解けないようにする。
    const closePool = candidates.filter((candidate) => candidate.sameConfusionGroup);
    const close = (closePool.length ? closePool : candidates.filter((candidate) => candidate.sameCategory))[0];
    if (close) picked.push(close);
    const ordinaryPool = shuffle(candidates.filter((candidate) => candidate.sameCategory
      && !candidate.sameConfusionGroup
      && !picked.some(({ item }) => item.id === candidate.item.id)).slice(0, 18));
    picked.push(...ordinaryPool.slice(0, 2));
  } else {
    const primaryPool = difficulty === "hard"
      ? candidates.filter((candidate) => candidate.sameConfusionGroup || (candidate.sameCategory && candidate.score >= 5))
      : candidates.filter((candidate) => candidate.sameCategory);
    const orderedPool = difficulty === "hard" ? primaryPool : shuffle(primaryPool.slice(0, 14));
    picked = orderedPool.slice(0, 3);
  }
  for (const candidate of candidates) {
    if (picked.length >= 3) break;
    if (!picked.some(({ item }) => item.id === candidate.item.id)) picked.push(candidate);
  }
  return shuffle([card, ...picked.map(({ item }) => item)]);
}

function maskAnswerTerm(text: string, card: Term) {
  const escaped = card.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const isAsciiTerm = /^[A-Za-z0-9+&/-]+$/.test(card.term);
  const termPattern = isAsciiTerm ? `(^|[^A-Za-z0-9])${escaped}(?=$|[^A-Za-z0-9])` : escaped;
  let masked = text.replace(new RegExp(termPattern, "gi"), isAsciiTerm ? "$1この用語" : "この用語");
  const sentences = masked.split("。");
  const formalNamePattern = /^[A-Za-z][A-Za-z0-9+&/\- ]*(?:（[^）]*）)?(?:、[A-Za-z][A-Za-z0-9+&/\- ]*(?:（[^）]*）)?)*$/;
  if (sentences.length > 1 && formalNamePattern.test(sentences[0].trim())) masked = sentences.slice(1).join("。").trim();
  return masked
    .replace(/（[A-Za-z][A-Za-z0-9+&/\- ]*）/g, "")
    .replace(/\([A-Za-z][A-Za-z0-9+&/\- ]*\)/g, "")
    .replace(/^[、。\s]+/, "");
}

function getRetention(card: Term, savedProgress: Progress) {
  const record = savedProgress[card.id];
  if (typeof record?.retention === "number") return Math.max(0, Math.min(100, record.retention));
  const baseline = 35;
  return Math.max(5, Math.min(95,
    baseline + (record?.correct ?? 0) * 20 - (record?.wrong ?? 0) * 22,
  ));
}

function getRetentionStatus(score: number) {
  if (score < 40) return { label: "最優先", level: 3, className: "level3" } as const;
  if (score < 60) return { label: "苦手", level: 2, className: "level2" } as const;
  if (score >= 75) return { label: "定着", level: 1, className: "mastered" } as const;
  return { label: "要確認", level: 1, className: "level1" } as const;
}

export default function Home() {
  const [mode, setMode] = useState<ModeKey | "list">("study");
  const [category, setCategory] = useState<"すべて" | Category>("すべて");
  const [collectionFilter, setCollectionFilter] = useState<"all" | Collection | "disabled">("all");
  const [collectionOverrides, setCollectionOverrides] = useState<CollectionOverrides>({});
  const [disabledIds, setDisabledIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "retention-asc" | "retention-desc">("default");
  const [progress, setProgress] = useState<Progress>({});
  const [roundIds, setRoundIds] = useState<string[]>([]);
  const [roundPosition, setRoundPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [quizUnsure, setQuizUnsure] = useState(false);
  const [quizConfident, setQuizConfident] = useState(false);
  const [focusFormat, setFocusFormat] = useState<"term" | "quiz">("term");
  const [priorityIds, setPriorityIds] = useState<string[]>([]);
  const [priorityPosition, setPriorityPosition] = useState(0);
  const [weakIds, setWeakIds] = useState<string[]>([]);
  const [weakPosition, setWeakPosition] = useState(0);
  const [unseenIds, setUnseenIds] = useState<string[]>([]);
  const [unseenPosition, setUnseenPosition] = useState(0);
  const [lowQuizIds, setLowQuizIds] = useState<string[]>([]);
  const [lowQuizPosition, setLowQuizPosition] = useState(0);
  const [specialIds, setSpecialIds] = useState<string[]>([]);
  const [specialPosition, setSpecialPosition] = useState(0);
  const [modeStats, setModeStats] = useState<ModeStats>({
    study: { correct: 0, wrong: 0 },
    quiz: { correct: 0, wrong: 0 },
    priority: { correct: 0, wrong: 0 },
    weak: { correct: 0, wrong: 0 },
    unseen: { correct: 0, wrong: 0 },
    lowquiz: { correct: 0, wrong: 0 },
    special: { correct: 0, wrong: 0 },
  });
  const [questionStats, setQuestionStats] = useState<QuestionStats>({});
  const [sessionResults, setSessionResults] = useState<Record<ModeKey, SessionAnswer[]>>({ study: [], quiz: [], priority: [], weak: [], unseen: [], lowquiz: [], special: [] });
  const [completed, setCompleted] = useState<Record<ModeKey, boolean>>({ study: false, quiz: false, priority: false, weak: false, unseen: false, lowquiz: false, special: false });

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
    let savedCollections: CollectionOverrides = {};
    try {
      const parsed = JSON.parse(localStorage.getItem(collectionStorageKey) ?? "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        savedCollections = migrateCollectionOverrides(parsed as CollectionOverrides);
        localStorage.setItem(collectionStorageKey, JSON.stringify(savedCollections));
      }
    } catch { /* 古いデータや破損した設定は初期の区分を使う */ }
    setCollectionOverrides(savedCollections);
    let savedDisabledIds: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(disabledStorageKey) ?? "[]");
      if (Array.isArray(parsed)) {
        savedDisabledIds = migrateDisabledIds(parsed.filter((id): id is string => typeof id === "string"));
        localStorage.setItem(disabledStorageKey, JSON.stringify(savedDisabledIds));
      }
    } catch { /* 破損した設定は出題中として扱う */ }
    setDisabledIds(savedDisabledIds);
    const saved = localStorage.getItem("ap-study-progress");
    let savedProgress = migrateProgressRecords(saved ? JSON.parse(saved) as Progress : {});
    if (localStorage.getItem(retentionResetKey) !== "done") {
      // 過去の「全問題を-20」調整は保存済みの問題だけに適用する。
      // 初めて開いた端末や、後から追加した問題の初期値は35のままにする。
      savedProgress = Object.fromEntries(Object.entries(savedProgress).map(([id, record]) => {
        const item = terms.find((term) => term.id === id);
        if (!item) return [id, record];
        return [id, { ...record, retention: Math.max(0, getRetention(item, savedProgress) - 20) }];
      }));
      localStorage.setItem("ap-study-progress", JSON.stringify(savedProgress));
      localStorage.setItem(retentionResetKey, "done");
    }
    localStorage.setItem("ap-study-progress", JSON.stringify(savedProgress));
    setProgress(savedProgress);
    const savedStats = localStorage.getItem("ap-study-mode-stats");
    if (savedStats) setModeStats((old) => ({ ...old, ...JSON.parse(savedStats) as Partial<ModeStats> }));
    const savedQuestionStats = localStorage.getItem("ap-study-question-stats-v1");
    if (savedQuestionStats) {
      const migratedStats = migrateQuestionStats(JSON.parse(savedQuestionStats) as QuestionStats);
      setQuestionStats(migratedStats);
      localStorage.setItem("ap-study-question-stats-v1", JSON.stringify(migratedStats));
    }
    const savedRoundText = localStorage.getItem("ap-study-round");
    try {
      const savedRound = savedRoundText ? JSON.parse(savedRoundText) as { ids?: unknown; position?: unknown; category?: unknown } : null;
      const savedCategory = savedRound?.category;
      const validCategory = categoryNames.includes(savedCategory as typeof categoryNames[number]);
      const savedIds = Array.isArray(savedRound?.ids) ? savedRound.ids as unknown[] : [];
      const validIds = savedIds.length > 0
        && savedIds.length <= 5
        && new Set(savedIds).size === savedIds.length
        && savedIds.every((id) => typeof id === "string" && !savedDisabledIds.includes(id) && terms.some((item) => item.id === id && getCollection(item, savedCollections) === "regular"));
      const validPosition = typeof savedRound?.position === "number"
        && Number.isInteger(savedRound.position)
        && savedRound.position >= 0
        && validIds
        && savedRound.position < savedIds.length;
      if (validCategory && validIds && validPosition) {
        setCategory(savedCategory as typeof categoryNames[number]);
        setRoundIds(savedIds as string[]);
        setRoundPosition(savedRound.position as number);
      } else {
        setRoundIds(buildRound("すべて", savedProgress, [], false, false, false, savedCollections, "regular", savedDisabledIds));
      }
    } catch {
      setRoundIds(buildRound("すべて", savedProgress, [], false, false, false, savedCollections, "regular", savedDisabledIds));
    }
    const savedPriorityText = localStorage.getItem("ap-study-priority-round");
    try {
      const savedPriority = savedPriorityText ? JSON.parse(savedPriorityText) as { ids?: string[]; position?: number } : null;
      const validIds = Array.isArray(savedPriority?.ids) && savedPriority.ids.length > 0 && savedPriority.ids.length <= 5 && new Set(savedPriority.ids).size === savedPriority.ids.length && savedPriority.ids.every((id) => !savedDisabledIds.includes(id) && terms.some((item) => item.id === id && getCollection(item, savedCollections) === "regular" && getRetention(item, savedProgress) < 40));
      const validPosition = validIds && typeof savedPriority?.position === "number" && savedPriority.position >= 0 && savedPriority.position < savedPriority.ids!.length;
      if (validIds && validPosition) {
        setPriorityIds(savedPriority!.ids!);
        setPriorityPosition(savedPriority!.position!);
      } else {
        setPriorityIds(buildRound("すべて", savedProgress, [], true, false, false, savedCollections, "regular", savedDisabledIds));
      }
    } catch {
      setPriorityIds(buildRound("すべて", savedProgress, [], true, false, false, savedCollections, "regular", savedDisabledIds));
    }
    setUnseenIds(buildRound("すべて", savedProgress, [], false, true, false, savedCollections, "regular", savedDisabledIds));
    setWeakIds(buildRound("すべて", savedProgress, [], false, false, true, savedCollections, "regular", savedDisabledIds));
    setLowQuizIds(buildLowQuizRound("すべて", savedProgress, [], savedCollections, savedDisabledIds));
    setSpecialIds(buildRound("すべて", savedProgress, [], false, false, false, savedCollections, "special", savedDisabledIds));
    setHydrated(true);
    }, 0);
    return () => window.clearTimeout(initializationTimer);
  }, []);

  useEffect(() => {
    if (!hydrated || roundIds.length === 0) return;
    localStorage.setItem("ap-study-round", JSON.stringify({ ids: roundIds, position: roundPosition, category }));
  }, [hydrated, roundIds, roundPosition, category]);

  useEffect(() => {
    if (!hydrated || priorityIds.length === 0) return;
    localStorage.setItem("ap-study-priority-round", JSON.stringify({ ids: priorityIds, position: priorityPosition }));
  }, [hydrated, priorityIds, priorityPosition]);

  const filtered = useMemo(() => {
    const matched = terms.filter((item) => {
      const categoryMatch = category === "すべて" || item.category === category;
      const collectionMatch = collectionFilter === "all" || (collectionFilter === "disabled" ? disabledIds.includes(item.id) : getCollection(item, collectionOverrides) === collectionFilter);
      const textMatch = `${item.term} ${item.answer}`.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && collectionMatch && textMatch;
    });
    if (sortOrder === "retention-asc") return [...matched].sort((a, b) => getRetention(a, progress) - getRetention(b, progress));
    if (sortOrder === "retention-desc") return [...matched].sort((a, b) => getRetention(b, progress) - getRetention(a, progress));
    return matched;
  }, [category, collectionFilter, collectionOverrides, disabledIds, query, sortOrder, progress]);

  const activeIds = mode === "priority" ? priorityIds : mode === "weak" ? weakIds : mode === "unseen" ? unseenIds : mode === "lowquiz" ? lowQuizIds : mode === "special" ? specialIds : roundIds;
  const activePosition = mode === "priority" ? priorityPosition : mode === "weak" ? weakPosition : mode === "unseen" ? unseenPosition : mode === "lowquiz" ? lowQuizPosition : mode === "special" ? specialPosition : roundPosition;
  const card = terms.find((item) => item.id === activeIds[activePosition]);
  const retention = card ? getRetention(card, progress) : 0;
  const retentionStatus = getRetentionStatus(retention);
  const difficulty: Difficulty = retention < 40 ? "easy" : retention >= 75 ? "hard" : "normal";
  // 自信ボタンで定着度が変わっても、現在表示中の問題文と難易度は切り替えない。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questionDifficulty = useMemo(() => difficulty, [card?.id, activePosition, mode]);
  const cardRecord = card ? progress[card.id] : undefined;
  const choices = useMemo(() => card ? getChoices(card, questionDifficulty, disabledIds) : [], [card, questionDifficulty, disabledIds]);
  const questionCopy = useMemo(() => {
    if (!card) return { studyLabel: "この用語を説明できますか？", quizLabel: "この説明に当てはまる用語は？", quizText: "", difficultyLabel: "標準" };
    const studyLabels = ["この用語を説明できますか？", "意味と役割を思い出せますか？", "この用語の要点を言えますか？"];
    const copyVariant = stableNumber(`${card.id}:${activePosition}:${mode}`);
    const useFeatureQuestion = questionDifficulty === "hard" || (questionDifficulty === "normal" && copyVariant % 2 === 0);
    const hardQuestion = maskAnswerTerm(card.hardPrompt ?? card.answer, card);
    return {
      studyLabel: card.studyPrompt ?? studyLabels[copyVariant % studyLabels.length],
      quizLabel: questionDifficulty === "hard" ? "難問：状況と違いから判断してください" : useFeatureQuestion ? "次の特徴に当てはまる用語は？" : "この説明に当てはまる用語は？",
      quizText: questionDifficulty === "hard" ? hardQuestion : maskAnswerTerm(useFeatureQuestion ? card.hint : card.answer, card),
      difficultyLabel: questionDifficulty === "easy" ? "やさしめ" : questionDifficulty === "hard" ? "定着チャレンジ" : "標準",
    };
  }, [card, questionDifficulty, activePosition, mode]);
  const currentModeKey: ModeKey | null = mode === "list" ? null : mode;
  const isQuizView = mode === "quiz" || mode === "lowquiz" || ((mode === "priority" || mode === "weak" || mode === "unseen" || mode === "special") && focusFormat === "quiz");
  const currentResults = currentModeKey ? sessionResults[currentModeKey] : [];
  const sessionCorrect = currentResults.filter((item) => item.result === "correct").length;
  const sessionWrong = currentResults.length - sessionCorrect;
  const regularTerms = terms.filter((item) => getCollection(item, collectionOverrides) === "regular" && !disabledIds.includes(item.id));
  const regularTotalCount = terms.filter((item) => getCollection(item, collectionOverrides) === "regular").length;
  const specialTotalCount = terms.length - regularTotalCount;
  const specialCount = terms.filter((item) => getCollection(item, collectionOverrides) === "special" && !disabledIds.includes(item.id)).length;
  const activeTermCount = regularTerms.length + specialCount;
  const mastered = regularTerms.filter((item) => !isUnseen(item, progress) && getRetention(item, progress) >= 75).length;
  const unseenCount = regularTerms.filter((item) => isUnseen(item, progress)).length;
  const weakCount = regularTerms.filter((item) => isWeak(item, progress)).length;
  const answeredCount = regularTerms.length - unseenCount;
  const priorityCount = regularTerms.filter((item) => getRetention(item, progress) < 40).length;
  const sessionGoal = mode === "special"
    ? Math.min(5, terms.filter((item) => getCollection(item, collectionOverrides) === "special" && !disabledIds.includes(item.id) && (category === "すべて" || item.category === category)).length)
    : 5;

  function recordModeResult(key: ModeKey, questionId: string, result: "correct" | "wrong") {
    const nextStats = {
      ...modeStats,
      [key]: {
        correct: modeStats[key].correct + (result === "correct" ? 1 : 0),
        wrong: modeStats[key].wrong + (result === "wrong" ? 1 : 0),
      },
    };
    setModeStats(nextStats);
    localStorage.setItem("ap-study-mode-stats", JSON.stringify(nextStats));
    const previousQuestionStat = questionStats[questionId]?.[key] ?? { correct: 0, wrong: 0 };
    const nextQuestionStats: QuestionStats = {
      ...questionStats,
      [questionId]: {
        ...questionStats[questionId],
        [key]: {
          correct: previousQuestionStat.correct + (result === "correct" ? 1 : 0),
          wrong: previousQuestionStat.wrong + (result === "wrong" ? 1 : 0),
        },
      },
    };
    setQuestionStats(nextQuestionStats);
    localStorage.setItem("ap-study-question-stats-v1", JSON.stringify(nextQuestionStats));
  }

  function addSessionResult(key: ModeKey, id: string, result: "correct" | "wrong") {
    const nextResults = [...sessionResults[key].filter((item) => item.id !== id), { id, result }];
    setSessionResults((old) => ({ ...old, [key]: nextResults }));
    return nextResults;
  }

  function answer(result: "correct" | "wrong" | "unsure") {
    if (!card) return;
    const next = {
      ...progress,
      [card.id]: {
        correct: (progress[card.id]?.correct ?? 0) + (result === "correct" ? 1 : 0),
        wrong: (progress[card.id]?.wrong ?? 0) + (result === "wrong" ? 1 : 0),
        quizCount: progress[card.id]?.quizCount ?? 0,
        retention: Math.max(0, Math.min(100, retention + (result === "correct" ? 15 : result === "wrong" ? -20 : -12))),
      },
    };
    setProgress(next);
    localStorage.setItem("ap-study-progress", JSON.stringify(next));
    const modeKey: ModeKey = mode === "priority" ? "priority" : mode === "weak" ? "weak" : mode === "unseen" ? "unseen" : mode === "special" ? "special" : "study";
    const scoredResult = result === "correct" ? "correct" : "wrong";
    recordModeResult(modeKey, card.id, scoredResult);
    const nextResults = addSessionResult(modeKey, card.id, scoredResult);
    setRevealed(false);
    if (nextResults.length >= sessionGoal) {
      setCompleted((old) => ({ ...old, [modeKey]: true }));
      return;
    }
    if (mode === "priority") {
      if (priorityPosition >= priorityIds.length - 1) {
        setPriorityIds(buildRound("すべて", next, priorityIds, true, false, false, collectionOverrides, "regular", disabledIds));
        setPriorityPosition(0);
      } else {
        setPriorityPosition((old) => old + 1);
      }
      setSession([]);
    } else if (mode === "weak") {
      if (weakPosition >= weakIds.length - 1) {
        setWeakIds(buildRound(category, next, weakIds, false, false, true, collectionOverrides, "regular", disabledIds));
        setWeakPosition(0);
      } else setWeakPosition((old) => old + 1);
      setSession((old) => [...old, card.id]);
    } else if (mode === "unseen") {
      if (unseenPosition >= unseenIds.length - 1) {
        setUnseenIds(buildRound(category, next, unseenIds, false, true, false, collectionOverrides, "regular", disabledIds));
        setUnseenPosition(0);
      } else {
        setUnseenPosition((old) => old + 1);
      }
      setSession((old) => [...old, card.id]);
    } else if (mode === "special") {
      if (specialPosition >= specialIds.length - 1) {
        setSpecialIds(buildRound(category, next, specialIds, false, false, false, collectionOverrides, "special", disabledIds));
        setSpecialPosition(0);
      } else setSpecialPosition((old) => old + 1);
      setSession((old) => [...old, card.id]);
    } else if (roundPosition >= roundIds.length - 1) {
      setRoundIds(buildRound(category, next, roundIds, false, false, false, collectionOverrides, "regular", disabledIds));
      setRoundPosition(0);
      setSession([]);
    } else {
      setSession((old) => [...old, card.id]);
      setRoundPosition((old) => old + 1);
    }
  }

  function resetProgress() {
    if (!window.confirm("学習記録をすべてリセットしますか？")) return;
    localStorage.removeItem("ap-study-progress");
    localStorage.removeItem("ap-study-round");
    localStorage.removeItem("ap-study-priority-round");
    localStorage.removeItem("ap-study-mode-stats");
    localStorage.removeItem("ap-study-question-stats-v1");
    setProgress({});
    setRoundIds(buildRound(category, {}, [], false, false, false, collectionOverrides, "regular", disabledIds));
    setRoundPosition(0);
    setPriorityIds(buildRound("すべて", {}, [], true, false, false, collectionOverrides, "regular", disabledIds));
    setPriorityPosition(0);
    setUnseenIds(buildRound("すべて", {}, [], false, true, false, collectionOverrides, "regular", disabledIds));
    setUnseenPosition(0);
    setLowQuizIds(buildLowQuizRound("すべて", {}, [], collectionOverrides, disabledIds));
    setLowQuizPosition(0);
    setSpecialIds(buildRound("すべて", {}, [], false, false, false, collectionOverrides, "special", disabledIds));
    setSpecialPosition(0);
    setSession([]);
    setQuizChoice(null);
    setQuizResult(null);
    setQuizUnsure(false);
    setQuizConfident(false);
    setModeStats({ study: { correct: 0, wrong: 0 }, quiz: { correct: 0, wrong: 0 }, priority: { correct: 0, wrong: 0 }, weak: { correct: 0, wrong: 0 }, unseen: { correct: 0, wrong: 0 }, lowquiz: { correct: 0, wrong: 0 }, special: { correct: 0, wrong: 0 } });
    setQuestionStats({});
    setWeakIds([]);
    setWeakPosition(0);
    setSessionResults({ study: [], quiz: [], priority: [], weak: [], unseen: [], lowquiz: [], special: [] });
    setCompleted({ study: false, quiz: false, priority: false, weak: false, unseen: false, lowquiz: false, special: false });
  }

  function downloadBackup() {
    const data = Object.fromEntries(backupKeys.flatMap((key) => {
      const value = localStorage.getItem(key);
      return value === null ? [] : [[key, value]];
    }));
    const backup = { app: "ap-nigate-dojo", version: 1, exportedAt: new Date().toISOString(), termCount: terms.length, data };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ap-study-backup-${new Date().toLocaleDateString("sv-SE")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("ファイルが大きすぎます");
      const backup = JSON.parse(await file.text()) as { app?: unknown; version?: unknown; data?: unknown };
      if (backup.app !== "ap-nigate-dojo" || backup.version !== 1 || !backup.data || typeof backup.data !== "object" || Array.isArray(backup.data)) throw new Error("形式が違います");
      const data = backup.data as Record<string, unknown>;
      const entries = backupKeys.flatMap((key) => typeof data[key] === "string" ? [[key, data[key] as string] as const] : []);
      if (!entries.some(([key]) => key === "ap-study-progress")) throw new Error("成績データがありません");
      entries.forEach(([key, value]) => { if (key !== retentionResetKey) JSON.parse(value); });
      if (!window.confirm("現在の成績・問題の区分・出題設定をバックアップの内容で上書きしますか？")) return;
      backupKeys.forEach((key) => localStorage.removeItem(key));
      entries.forEach(([key, value]) => localStorage.setItem(key, value));
      window.alert("成績と問題の設定を復元しました。画面を更新します。");
      window.location.reload();
    } catch {
      window.alert("このファイルは復元できません。AP苦手だけ道場で作成したJSONバックアップを選んでください。");
    }
  }

  function goBack() {
    if (activePosition === 0) return;
    if (mode === "priority") setPriorityPosition((old) => old - 1);
    else if (mode === "weak") setWeakPosition((old) => old - 1);
    else if (mode === "unseen") setUnseenPosition((old) => old - 1);
    else if (mode === "lowquiz") setLowQuizPosition((old) => old - 1);
    else if (mode === "special") setSpecialPosition((old) => old - 1);
    else setRoundPosition((old) => old - 1);
    setSession((old) => old.slice(0, -1));
    setRevealed(false);
    setQuizChoice(null);
    setQuizResult(null);
    setQuizUnsure(false);
    setQuizConfident(false);
  }

  function goForward() {
    if (activePosition >= activeIds.length - 1) return;
    if (mode === "priority") setPriorityPosition((old) => old + 1);
    else if (mode === "weak") setWeakPosition((old) => old + 1);
    else if (mode === "unseen") setUnseenPosition((old) => old + 1);
    else if (mode === "lowquiz") setLowQuizPosition((old) => old + 1);
    else if (mode === "special") setSpecialPosition((old) => old + 1);
    else setRoundPosition((old) => old + 1);
    setRevealed(false);
    setQuizChoice(null);
    setQuizResult(null);
    setQuizUnsure(false);
    setQuizConfident(false);
  }

  function chooseQuiz(choiceId: string) {
    if (!card || quizResult) return;
    const result = choiceId === card.id ? "correct" : "wrong";
    const mistakenChoice = result === "wrong" ? terms.find((item) => item.id === choiceId) : undefined;
    const next = {
      ...progress,
      [card.id]: {
        correct: (progress[card.id]?.correct ?? 0) + (result === "correct" ? 1 : 0),
        wrong: (progress[card.id]?.wrong ?? 0) + (result === "wrong" ? 1 : 0),
        quizCount: (progress[card.id]?.quizCount ?? 0) + 1,
        retention: Math.max(0, Math.min(100, retention + (result === "correct" ? 15 : -20))),
      },
      ...(mistakenChoice ? {
        [mistakenChoice.id]: {
          correct: progress[mistakenChoice.id]?.correct ?? 0,
          wrong: progress[mistakenChoice.id]?.wrong ?? 0,
          quizCount: progress[mistakenChoice.id]?.quizCount ?? 0,
          retention: Math.max(0, getRetention(mistakenChoice, progress) - 10),
        },
      } : {}),
    };
    setProgress(next);
    localStorage.setItem("ap-study-progress", JSON.stringify(next));
    const modeKey: ModeKey = mode === "priority" ? "priority" : mode === "weak" ? "weak" : mode === "unseen" ? "unseen" : mode === "lowquiz" ? "lowquiz" : mode === "special" ? "special" : "quiz";
    recordModeResult(modeKey, card.id, result);
    addSessionResult(modeKey, card.id, result);
    setQuizChoice(choiceId);
    setQuizResult(result);
  }

  function markQuizUnsure() {
    if (!card || quizResult || quizUnsure || quizConfident) return;
    const next = {
      ...progress,
      [card.id]: {
        correct: progress[card.id]?.correct ?? 0,
        wrong: progress[card.id]?.wrong ?? 0,
        quizCount: progress[card.id]?.quizCount ?? 0,
        retention: Math.max(0, retention - 12),
      },
    };
    setProgress(next);
    localStorage.setItem("ap-study-progress", JSON.stringify(next));
    setQuizUnsure(true);
  }

  function markQuizConfident() {
    if (!card || quizResult || quizUnsure || quizConfident) return;
    const next = {
      ...progress,
      [card.id]: {
        correct: progress[card.id]?.correct ?? 0,
        wrong: progress[card.id]?.wrong ?? 0,
        quizCount: progress[card.id]?.quizCount ?? 0,
        retention: Math.min(100, retention + 8),
      },
    };
    setProgress(next);
    localStorage.setItem("ap-study-progress", JSON.stringify(next));
    setQuizConfident(true);
  }

  function nextQuiz() {
    if (!card) return;
    setQuizChoice(null);
    setQuizResult(null);
    setQuizUnsure(false);
    setQuizConfident(false);
    const modeKey: ModeKey = mode === "priority" ? "priority" : mode === "weak" ? "weak" : mode === "unseen" ? "unseen" : mode === "lowquiz" ? "lowquiz" : mode === "special" ? "special" : "quiz";
    if (sessionResults[modeKey].length >= sessionGoal) {
      setCompleted((old) => ({ ...old, [modeKey]: true }));
      return;
    }
    if (mode === "priority") {
      if (priorityPosition >= priorityIds.length - 1) {
        setPriorityIds(buildRound("すべて", progress, priorityIds, true, false, false, collectionOverrides, "regular", disabledIds));
        setPriorityPosition(0);
      } else setPriorityPosition((old) => old + 1);
    } else if (mode === "weak") {
      if (weakPosition >= weakIds.length - 1) {
        setWeakIds(buildRound(category, progress, weakIds, false, false, true, collectionOverrides, "regular", disabledIds));
        setWeakPosition(0);
      } else setWeakPosition((old) => old + 1);
    } else if (mode === "unseen") {
      if (unseenPosition >= unseenIds.length - 1) {
        setUnseenIds(buildRound(category, progress, unseenIds, false, true, false, collectionOverrides, "regular", disabledIds));
        setUnseenPosition(0);
      } else setUnseenPosition((old) => old + 1);
    } else if (mode === "lowquiz") {
      if (lowQuizPosition >= lowQuizIds.length - 1) {
        setLowQuizIds(buildLowQuizRound(category, progress, lowQuizIds, collectionOverrides, disabledIds));
        setLowQuizPosition(0);
      } else setLowQuizPosition((old) => old + 1);
    } else if (mode === "special") {
      if (specialPosition >= specialIds.length - 1) {
        setSpecialIds(buildRound(category, progress, specialIds, false, false, false, collectionOverrides, "special", disabledIds));
        setSpecialPosition(0);
      } else setSpecialPosition((old) => old + 1);
    } else if (roundPosition >= roundIds.length - 1) {
      setRoundIds(buildRound(category, progress, roundIds, false, false, false, collectionOverrides, "regular", disabledIds));
      setRoundPosition(0);
      setSession([]);
    } else {
      setSession((old) => [...old, card.id]);
      setRoundPosition((old) => old + 1);
    }
  }

  function setManualRetention(item: Term, value: number) {
    const bounded = Math.max(0, Math.min(100, value));
    const next = {
      ...progress,
      [item.id]: {
        correct: progress[item.id]?.correct ?? 0,
        wrong: progress[item.id]?.wrong ?? 0,
        quizCount: progress[item.id]?.quizCount ?? 0,
        retention: bounded,
      },
    };
    setProgress(next);
    localStorage.setItem("ap-study-progress", JSON.stringify(next));
  }

  function toggleCollection(item: Term) {
    const nextCollection: Collection = getCollection(item, collectionOverrides) === "special" ? "regular" : "special";
    const nextOverrides = { ...collectionOverrides, [item.id]: nextCollection };
    if (nextCollection === (item.collection === "special" ? "special" : "regular")) delete nextOverrides[item.id];
    setCollectionOverrides(nextOverrides);
    localStorage.setItem(collectionStorageKey, JSON.stringify(nextOverrides));
    refreshRounds(nextOverrides, disabledIds);
  }

  function toggleDisabled(item: Term) {
    const nextDisabledIds = disabledIds.includes(item.id)
      ? disabledIds.filter((id) => id !== item.id)
      : [...disabledIds, item.id];
    setDisabledIds(nextDisabledIds);
    localStorage.setItem(disabledStorageKey, JSON.stringify(nextDisabledIds));
    refreshRounds(collectionOverrides, nextDisabledIds);
  }

  function refreshRounds(nextOverrides: CollectionOverrides, nextDisabledIds: string[]) {
    setRoundIds(buildRound(category, progress, [], false, false, false, nextOverrides, "regular", nextDisabledIds));
    setRoundPosition(0);
    setPriorityIds(buildRound("すべて", progress, [], true, false, false, nextOverrides, "regular", nextDisabledIds));
    setPriorityPosition(0);
    setWeakIds(buildRound("すべて", progress, [], false, false, true, nextOverrides, "regular", nextDisabledIds));
    setWeakPosition(0);
    setUnseenIds(buildRound(category, progress, [], false, true, false, nextOverrides, "regular", nextDisabledIds));
    setUnseenPosition(0);
    setLowQuizIds(buildLowQuizRound(category, progress, [], nextOverrides, nextDisabledIds));
    setLowQuizPosition(0);
    setSpecialIds(buildRound("すべて", progress, [], false, false, false, nextOverrides, "special", nextDisabledIds));
    setSpecialPosition(0);
    setSessionResults({ study: [], quiz: [], priority: [], weak: [], unseen: [], lowquiz: [], special: [] });
    setCompleted({ study: false, quiz: false, priority: false, weak: false, unseen: false, lowquiz: false, special: false });
  }

  function startNextSession(key: ModeKey) {
    if (key === "priority") {
      setPriorityIds(buildRound("すべて", progress, priorityIds, true, false, false, collectionOverrides, "regular", disabledIds));
      setPriorityPosition(0);
    } else if (key === "weak") {
      setWeakIds(buildRound(category, progress, weakIds, false, false, true, collectionOverrides, "regular", disabledIds));
      setWeakPosition(0);
    } else if (key === "unseen") {
      setUnseenIds(buildRound(category, progress, unseenIds, false, true, false, collectionOverrides, "regular", disabledIds));
      setUnseenPosition(0);
    } else if (key === "lowquiz") {
      setLowQuizIds(buildLowQuizRound(category, progress, lowQuizIds, collectionOverrides, disabledIds));
      setLowQuizPosition(0);
    } else if (key === "special") {
      setSpecialIds(buildRound(category, progress, specialIds, false, false, false, collectionOverrides, "special", disabledIds));
      setSpecialPosition(0);
    } else {
      setRoundIds(buildRound(category, progress, roundIds, false, false, false, collectionOverrides, "regular", disabledIds));
      setRoundPosition(0);
    }
    setSessionResults((old) => ({ ...old, [key]: [] }));
    setCompleted((old) => ({ ...old, [key]: false }));
    setSession([]);
    setRevealed(false);
    setQuizChoice(null);
    setQuizResult(null);
    setQuizUnsure(false);
    setQuizConfident(false);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="ホーム">
          <span className="brandMark">AP</span>
          <span><strong>応用情報</strong><small>苦手だけ道場</small></span>
        </a>
        <nav aria-label="メインメニュー">
          <button className={mode === "study" ? "active" : ""} onClick={() => { setMode("study"); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>用語チェック</button>
          <button className={mode === "quiz" ? "active" : ""} onClick={() => { setMode("quiz"); setRevealed(false); }}>4択クイズ</button>
          <button className={mode === "priority" ? "active" : ""} onClick={() => { setMode("priority"); setPriorityIds(buildRound("すべて", progress, priorityIds, true, false, false, collectionOverrides, "regular", disabledIds)); setPriorityPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>最優先だけ <span className="navCount">{priorityCount}</span></button>
          <button className={mode === "weak" ? "active" : ""} onClick={() => { setMode("weak"); setCategory("すべて"); setWeakIds(buildRound("すべて", progress, weakIds, false, false, true, collectionOverrides, "regular", disabledIds)); setWeakPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>苦手だけ <span className="navCount">{weakCount}</span></button>
          <button className={mode === "unseen" ? "active" : ""} onClick={() => { setMode("unseen"); setUnseenIds(buildRound(category, progress, unseenIds, false, true, false, collectionOverrides, "regular", disabledIds)); setUnseenPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>未出題だけ <span className="navCount">{unseenCount}</span></button>
          <button className={mode === "lowquiz" ? "active" : ""} onClick={() => { setMode("lowquiz"); setLowQuizIds(buildLowQuizRound(category, progress, lowQuizIds, collectionOverrides, disabledIds)); setLowQuizPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>出題少なめ</button>
          <button className={mode === "special" ? "active" : ""} onClick={() => { setMode("special"); setCategory("すべて"); setSpecialIds(buildRound("すべて", progress, specialIds, false, false, false, collectionOverrides, "special", disabledIds)); setSpecialPosition(0); setSessionResults((old) => ({ ...old, special: [] })); setCompleted((old) => ({ ...old, special: false })); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>特別問題 <span className="navCount">{specialCount}</span></button>
          <button className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>用語一覧 <span className="navCount">{terms.length}</span></button>
        </nav>
        <div className="headerCount"><span>{mastered}</span> 問 定着済み</div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">WEAKNESS-FIRST LEARNING</p>
          <h1>思い出せない言葉から、<br /><em>つぶしていく。</em></h1>
          <p className="heroText">「3回出てこなかった」を最優先に。正解するまで、苦手な言葉が何度でも前に出てきます。</p>
        </div>
        <div className="stats" aria-label="学習状況">
          <div><strong>{mastered}<small>語</small></strong><span>定着度75以上</span></div>
          <div><strong>{regularTerms.length}<small>語</small></strong><span>出題中の通常問題</span></div>
          <div><strong>{answeredCount}<small>語</small></strong><span>回答済み</span></div>
          <div><strong>{weakCount}<small>語</small></strong><span>苦手問題</span></div>
          <div><strong>{unseenCount}<small>語</small></strong><span>未出題</span></div>
          <div><strong>{priorityCount}<small>語</small></strong><span>最優先</span></div>
        </div>
      </section>

      <section className="workspace">
        <div className="sectionHead">
          <div>
            <span className="sectionNumber">01</span>
            <h2>{mode === "study" ? "用語を説明できるか確認" : mode === "quiz" ? "説明から用語を当てる" : mode === "priority" ? "最優先だけを集中復習" : mode === "weak" ? "苦手問題だけをまとめて復習" : mode === "unseen" ? "まだ解いていない用語に挑戦" : mode === "lowquiz" ? "4択の出題回数が少ない問題" : mode === "special" ? "特別問題を集中復習" : "用語一覧"}</h2>
          </div>
          {mode !== "priority" && <div className="filters" role="group" aria-label="分野を絞り込む">
            {categoryNames.map((name) => (
              <button key={name} className={category === name ? "selected" : ""} onClick={() => { setCategory(name); if (mode === "weak") { setWeakIds(buildRound(name, progress, weakIds, false, false, true, collectionOverrides, "regular", disabledIds)); setWeakPosition(0); } else if (mode === "unseen") { setUnseenIds(buildRound(name, progress, unseenIds, false, true, false, collectionOverrides, "regular", disabledIds)); setUnseenPosition(0); } else if (mode === "lowquiz") { setLowQuizIds(buildLowQuizRound(name, progress, lowQuizIds, collectionOverrides, disabledIds)); setLowQuizPosition(0); } else if (mode === "special") { setSpecialIds(buildRound(name, progress, specialIds, false, false, false, collectionOverrides, "special", disabledIds)); setSpecialPosition(0); } else { setRoundIds(buildRound(name, progress, [], false, false, false, collectionOverrides, "regular", disabledIds)); setRoundPosition(0); } setSession([]); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); if (currentModeKey) { setSessionResults((old) => ({ ...old, [currentModeKey]: [] })); setCompleted((old) => ({ ...old, [currentModeKey]: false })); } }}>{name}</button>
            ))}
          </div>}
          {(mode === "priority" || mode === "weak" || mode === "unseen" || mode === "special") && <div className="formatSwitch" role="group" aria-label="問題形式を選ぶ">
            <button className={focusFormat === "term" ? "selected" : ""} onClick={() => { setFocusFormat("term"); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>用語チェック</button>
            <button className={focusFormat === "quiz" ? "selected" : ""} onClick={() => { setFocusFormat("quiz"); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>4択問題</button>
          </div>}
        </div>

        {(mode === "study" || mode === "quiz" || mode === "priority" || mode === "weak" || mode === "unseen" || mode === "lowquiz" || mode === "special") && card ? (
          <div className="studyGrid">
            <aside className="priorityPanel">
              <p className="panelLabel">TODAY&apos;S FOCUS</p>
              <h3>{mode === "priority" ? <>最優先だけを<br />5問集中。</> : mode === "weak" ? <>苦手問題だけを<br />5問復習。</> : mode === "unseen" ? <>未出題だけを<br />5問挑戦。</> : mode === "lowquiz" ? <>出題が少ない順に<br />4択を5問。</> : mode === "special" ? <>特別問題を<br />{sessionGoal}問集中。</> : <>苦手と未出題を<br />5問だけ。</>}</h3>
              <div className="meter"><i style={{ width: `${sessionGoal ? currentResults.length / sessionGoal * 100 : 0}%` }} /></div>
              <p className="meterText"><strong>{currentResults.length}</strong> / {sessionGoal} 問</p>
              <div className="legend">
                <span><i className="dot red" />最優先</span>
                <span><i className="dot yellow" />苦手</span>
                <span><i className="dot gray" />要確認</span>
              </div>
              {session.length > 0 && <p className="encourage">いいペースです。答えを声に出すと定着しやすくなります。</p>}
            </aside>

            {currentModeKey && completed[currentModeKey] ? <article className="resultCard">
              <p className="resultEyebrow">SESSION COMPLETE</p>
              <h3>{sessionGoal}問、おつかれさまでした。</h3>
              <div className="resultScore">
                <div><strong>{currentResults.length ? Math.round(sessionCorrect / currentResults.length * 100) : 0}<small>%</small></strong><span>今回の正答率</span></div>
                <div><strong>{sessionCorrect}</strong><span>正解</span></div>
                <div><strong>{sessionWrong}</strong><span>もう一度</span></div>
              </div>
              <div className="resultList">
                {currentResults.map((item) => {
                  const resultTerm = terms.find((term) => term.id === item.id);
                  return <div key={item.id} className={item.result}>
                    <span>{item.result === "correct" ? "○" : "×"}</span>
                    <div className="resultSummary">
                      <strong>{resultTerm?.term}</strong>
                      <p>{resultTerm?.answer}</p>
                    </div>
                    <small>{item.result === "correct" ? "正解" : "復習へ"}</small>
                  </div>;
                })}
              </div>
              <button className="nextSessionButton" onClick={() => startNextSession(currentModeKey)}>次の{sessionGoal}問へ <span>→</span></button>
            </article> : isQuizView && activeTermCount < 4 ? <article className="resultCard">
              <h3>4択には出題中の用語が4語必要です。</h3>
              <p>用語一覧から出題を再開してください。</p>
              <button className="nextSessionButton" onClick={() => { setCategory("すべて"); setCollectionFilter("disabled"); setMode("list"); }}>用語一覧へ →</button>
            </article> : !isQuizView ? <article className={`flashcard level${retentionStatus.level} ${revealed ? "revealed" : ""}`}>
              <div className="cardMeta">
                <div className="cardMetaLeft">
                  <div className="cardNavigation" aria-label="問題を移動">
                    <button className="backButton" onClick={goBack} disabled={activePosition === 0} aria-label="1つ前の問題に戻る">← 1つ前</button>
                    <button className="forwardButton" onClick={goForward} disabled={activePosition >= activeIds.length - 1} aria-label="1つ次の問題に進む">1つ進む →</button>
                  </div>
                  <span>{card.category}</span>
                </div>
                <b>{retentionStatus.label}</b>
              </div>
              <div className={`retentionBox ${retention < 40 ? "low" : retention >= 75 ? "high" : ""}`}>
                <div><span>定着度</span><strong>{retention}<small>/100</small></strong></div>
                <div className="retentionBar"><i style={{ width: `${retention}%` }} /></div>
                <p>言えた {cardRecord?.correct ?? 0}回 / 間違い {cardRecord?.wrong ?? 0}回 / 定着度だけで苦手・定着を判定</p>
              </div>
              <div className="questionSide">
                <p className="questionLabel">{questionCopy.studyLabel}<b className={`difficultyTag ${questionDifficulty}`}>{questionCopy.difficultyLabel}</b></p>
                <h3>{card.term}</h3>
                {questionDifficulty !== "hard" && <p className="hint"><span>ヒント</span>{card.hint}</p>}
              </div>
              {revealed ? (
                <div className="answerSide" aria-live="polite">
                  <p className="answerLabel">答え</p>
                  <p className="answerText">{card.answer}</p>
                  {card.confusion && <p className="confusion"><strong>混同注意</strong>{card.confusion}</p>}
                  <div className="answerButtons">
                    <button className="wrong" onClick={() => answer("wrong")}><span>×</span> まだ怪しい</button>
                    <button className="unsure" onClick={() => answer("unsure")}><span>△</span> 自信なし</button>
                    <button className="correct" onClick={() => answer("correct")}><span>○</span> 言えた</button>
                  </div>
                </div>
              ) : (
                <button className="revealButton" onClick={() => setRevealed(true)}>答えを見る <span>→</span></button>
              )}
              <p className="cardCount">{activePosition + 1} / {activeIds.length}</p>
            </article> : <article className={`flashcard quizCard level${retentionStatus.level}`}>
              <div className="cardMeta">
                <div className="cardMetaLeft">
                  <div className="cardNavigation" aria-label="問題を移動">
                    <button className="backButton" onClick={goBack} disabled={activePosition === 0} aria-label="1つ前の問題に戻る">← 1つ前</button>
                    <button className="forwardButton" onClick={goForward} disabled={activePosition >= activeIds.length - 1} aria-label="1つ次の問題に進む">1つ進む →</button>
                  </div>
                  <span>{card.category}</span>
                </div>
                <b>4択・出題 {cardRecord?.quizCount ?? 0}回</b>
              </div>
              <div className={`retentionBox ${retention < 40 ? "low" : retention >= 75 ? "high" : ""}`}>
                <div><span>定着度</span><strong>{retention}<small>/100</small></strong></div>
                <div className="retentionBar"><i style={{ width: `${retention}%` }} /></div>
                <p>正解 {cardRecord?.correct ?? 0}回 / 間違い {cardRecord?.wrong ?? 0}回 / 定着度だけで苦手・定着を判定</p>
              </div>
              <div className="quizQuestion">
                <p className="questionLabel">{questionCopy.quizLabel}<b className={`difficultyTag ${questionDifficulty}`}>{questionCopy.difficultyLabel}</b></p>
                <h3>{questionCopy.quizText}</h3>
              </div>
              <div className="quizConfidence" role="group" aria-label="回答への自信">
                <button className={`quizConfidentButton ${quizConfident ? "selected" : ""}`} onClick={markQuizConfident} disabled={Boolean(quizResult) || quizUnsure || quizConfident} aria-pressed={quizConfident}>◎ 自信あり {quizConfident && <span>定着度 +8</span>}</button>
                <button className={`quizUnsureButton ${quizUnsure ? "selected" : ""}`} onClick={markQuizUnsure} disabled={Boolean(quizResult) || quizUnsure || quizConfident} aria-pressed={quizUnsure}>△ 自信なし {quizUnsure && <span>定着度 −12</span>}</button>
              </div>
              <div className="choiceGrid" role="group" aria-label="選択肢">
                {choices.map((choice) => {
                  const choiceState = quizResult
                    ? choice.id === card.id ? "isCorrect" : choice.id === quizChoice ? "isWrong" : "isMuted"
                    : "";
                  return <button key={choice.id} className={choiceState} onClick={() => chooseQuiz(choice.id)} disabled={Boolean(quizResult)}>
                    {choice.term}
                  </button>;
                })}
              </div>
              {quizResult && <div className={`quizFeedback ${quizResult}`} aria-live="polite">
                <div className="quizExplanation">
                  <strong>{quizResult === "correct" ? "正解！" : `正解は「${card.term}」`}</strong>
                  <p className="correctDetail"><b>{card.term}</b>{card.answer}</p>
                  {card.confusion && <p className="quizConfusion"><b>混同注意</b>{card.confusion}</p>}
                  <p className="differenceTitle">なぜ他の選択肢は違う？</p>
                  <div className="differenceList">
                    {choices.filter((choice) => choice.id !== card.id).map((choice) => <p key={choice.id} className={choice.id === quizChoice ? "yourChoice" : ""}>
                      <b>{choice.term}</b><span>{choice.answer}</span>{choice.id === quizChoice && <small>あなたの回答</small>}
                    </p>)}
                  </div>
                </div>
                <button onClick={nextQuiz}>{currentModeKey && sessionResults[currentModeKey].length >= sessionGoal ? "結果を見る" : "次の問題へ"} →</button>
              </div>}
              <p className="cardCount">{activePosition + 1} / {activeIds.length}</p>
            </article>}
          </div>
        ) : mode === "list" ? (
          <div className="listArea">
            <div className="searchRow">
              <label className="searchInput"><span>用語を検索</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例：セッション、DDL、IPsec" /></label>
              <div className="listSummary">
                <strong>全 {terms.length} 語</strong><span>通常 {regularTotalCount} 語・特別 {specialTotalCount} 語</span><span>出題停止 {disabledIds.length} 語</span><span>現在の表示 {filtered.length} 語</span>
                <div className="backupActions">
                  <button className="backupButton" onClick={downloadBackup}>成績・設定をバックアップ</button>
                  <label className="restoreButton">成績・設定を復元<input className="visuallyHidden" type="file" accept="application/json,.json" onChange={restoreBackup} /></label>
                  <button className="reset" onClick={resetProgress}>学習記録をリセット</button>
                </div>
              </div>
            </div>
            <div className="collectionFilters" role="group" aria-label="問題の区分で絞り込む">
              <button className={collectionFilter === "all" ? "selected" : ""} onClick={() => setCollectionFilter("all")}>すべて</button>
              <button className={collectionFilter === "regular" ? "selected" : ""} onClick={() => setCollectionFilter("regular")}>通常問題 {regularTotalCount}</button>
              <button className={collectionFilter === "special" ? "selected" : ""} onClick={() => setCollectionFilter("special")}>特別問題 {specialTotalCount}</button>
              <button className={collectionFilter === "disabled" ? "selected" : ""} onClick={() => setCollectionFilter("disabled")}>出題しない {disabledIds.length}</button>
            </div>
            <div className="termTable">
              <div className="tableHeader"><span>優先度</span><span>用語</span><span>覚えるポイント</span><button className="retentionSort" onClick={() => setSortOrder((old) => old === "retention-asc" ? "retention-desc" : "retention-asc")} aria-label={`定着度を${sortOrder === "retention-asc" ? "高い順" : "低い順"}に並べ替える`}>定着度 <b>{sortOrder === "retention-asc" ? "↑" : sortOrder === "retention-desc" ? "↓" : "↕"}</b></button></div>
              {filtered.map((item) => {
                const itemProgress = progress[item.id];
                const itemStatus = getRetentionStatus(getRetention(item, progress));
                const itemCollection = getCollection(item, collectionOverrides);
                const isDisabled = disabledIds.includes(item.id);
                const openItem = () => {
                  if (isDisabled) return;
                  const nextRound = [item.id, ...buildRound(item.category, progress, [item.id], false, false, false, collectionOverrides, itemCollection, disabledIds).filter((id) => id !== item.id)].slice(0, 5);
                  const nextMode: ModeKey = itemCollection === "special" ? "special" : "study";
                  setCategory(item.category);
                  if (nextMode === "special") { setSpecialIds(nextRound); setSpecialPosition(0); }
                  else { setRoundIds(nextRound); setRoundPosition(0); }
                  setSession([]);
                  setSessionResults((old) => ({ ...old, [nextMode]: [] }));
                  setCompleted((old) => ({ ...old, [nextMode]: false }));
                  setMode(nextMode);
                  setFocusFormat("term");
                  setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false);
                };
                return <div className={`termRow ${isDisabled ? "isDisabled" : ""}`} key={item.id} role={isDisabled ? undefined : "button"} tabIndex={isDisabled ? undefined : 0} onClick={isDisabled ? undefined : openItem} onKeyDown={(event) => { if (!isDisabled && (event.key === "Enter" || event.key === " ")) openItem(); }}>
                  <span><b className={`priority ${itemStatus.className}`}>{itemStatus.label}</b></span>
                  <span className="termName"><small>{item.category}</small>{item.term}{isDisabled && <small className="disabledBadge">出題しない</small>}<span className="termActions"><button type="button" className={`collectionToggle ${itemCollection}`} onClick={(event) => { event.stopPropagation(); toggleCollection(item); }} onKeyDown={(event) => event.stopPropagation()} aria-label={`${item.term}を${itemCollection === "special" ? "通常問題に戻す" : "特別問題に移す"}`}>{itemCollection === "special" ? "通常へ変更" : "特別へ変更"}</button><button type="button" className={`questionToggle ${isDisabled ? "disabled" : ""}`} onClick={(event) => { event.stopPropagation(); toggleDisabled(item); }} onKeyDown={(event) => event.stopPropagation()} aria-label={`${item.term}の出題を${isDisabled ? "再開" : "停止"}`}>{isDisabled ? "出題を再開" : "出題を停止"}</button></span></span>
                  <span className="termAnswer">{item.answer}</span>
                  <span className="record retentionEdit" onClickCapture={(event) => event.stopPropagation()}>
                    <label><input type="number" min="0" max="100" value={getRetention(item, progress)} onKeyDown={(event) => event.stopPropagation()} onChange={(event) => setManualRetention(item, Number(event.target.value))} aria-label={`${item.term}の定着度`} /><small>/100</small></label>
                    <small>○{itemProgress?.correct ?? 0} ×{itemProgress?.wrong ?? 0}</small>
                  </span>
                </div>;
              })}
              {filtered.length === 0 && <p className="empty">該当する用語がありません。</p>}
            </div>
          </div>
        ) : (
          <div className="emptyRound">
            <strong>{mode === "special" ? "この分野に出題中の特別問題はありません。" : mode === "weak" ? "この分野に苦手問題はありません。" : mode === "unseen" ? "この分野の未出題問題はありません。" : "この分野に出題中の通常問題はありません。"}</strong>
            <p>{disabledIds.length > 0 ? "出題を停止した問題は、用語一覧から再開できます。" : mode === "special" ? "用語一覧から問題ごとに特別問題へ移せます。" : mode === "weak" ? "定着度60未満の問題が対象です。" : "別の分野を選ぶか、用語一覧で区分を変更できます。"}</p>
            <button onClick={() => { setCategory("すべて"); setCollectionFilter(disabledIds.length > 0 ? "disabled" : "all"); setMode("list"); }}>用語一覧へ</button>
          </div>
        )}
      </section>

      <footer>
        <span>AP 苦手だけ道場</span>
        <p>迷った言葉を、次の得点源に。</p>
      </footer>
    </main>
  );
}
