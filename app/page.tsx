"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Category = "セキュリティ" | "データベース" | "ネットワーク" | "マネジメント" | "ストラテジ" | "テクノロジ";
type Term = {
  id: string;
  term: string;
  category: Category;
  hint: string;
  hardPrompt?: string;
  answer: string;
  level: 1 | 2 | 3;
  confusion?: string;
  collection?: "special";
};

const terms: Term[] = [
  { id: "https", term: "HTTPS", category: "セキュリティ", hint: "安全性と処理速度を両立させたい。最初の握手と、その後の会話を分けて考える。", answer: "公開鍵暗号で共通鍵を安全に共有し、その後は高速な共通鍵暗号で通信する。", level: 1 },
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
  { id: "ca", term: "CAの署名検証", category: "セキュリティ", hint: "電子署名のルールを、認証局にそのまま当てはめる。", answer: "CAの公開鍵で検証し、証明書が信頼できるCAによって署名されたことを確認する。", level: 2 },
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
  { id: "union", term: "UNION", category: "データベース", hint: "JOINは表を横へ。この演算子は検索結果をどちらの方向へ足す？", answer: "複数のSELECT結果を一つに結合する。列数と対応するデータ型を合わせる。重複は除かれる。", level: 3, confusion: "サブクエリではなく、検索結果どうしの結合" },
  { id: "orderby", term: "ORDER BY", category: "データベース", hint: "ASCとDESCを後ろに付ける句。", hardPrompt: "抽出対象の行は変えず、検索結果の表示順だけを列と昇順・降順で指定するSQL句は？", answer: "検索結果を指定列で並べ替える。ASCは昇順（既定）、DESCは降順。", level: 3 },
  { id: "lock", term: "排他制御", category: "データベース", hint: "一人が編集中の書類に『使用中』の札を掛ける。", hardPrompt: "複数のトランザクションが同じデータを扱うとき、アクセスの競合を制御して整合性を保つ仕組みは？", answer: "共有ロックや専有ロックなどを使って同時アクセスを制御し、データの整合性を保つ仕組み。", level: 3, confusion: "専有ロックは排他制御に使うロックの一種。デッドロックは互いの解除待ちで進めない状態" },
  { id: "distinct", term: "DISTINCT", category: "データベース", hint: "名簿から都道府県の種類だけを取り出したい。", answer: "SELECT DISTINCT 列名 の形で、検索結果から重複する行を除外する。綴りは DISTINCT。", level: 3, confusion: "destinct ではなく DISTINCT" },
  { id: "exists", term: "EXISTS", category: "データベース", hint: "件数や値ではなく、『該当する行が一つでもあるか』だけを問う。", answer: "サブクエリの結果が1行でも存在すれば真になる条件。存在確認に使う。", level: 3 },
  { id: "ddl", term: "DDL", category: "データベース", hint: "建物でいえば、設計図や間取りを扱う言語。", hardPrompt: "既存の表へ列を追加する命令が分類されるSQL言語は？", answer: "Data Definition Language。CREATE、ALTER、DROPなど、データベースの構造を定義する言語。", level: 2 },
  { id: "dml", term: "DML", category: "データベース", hint: "建物ではなく、その中に置く荷物を出し入れする言語。", hardPrompt: "表の行を検索・追加・更新・削除する命令が分類されるSQL言語は？", answer: "Data Manipulation Language。SELECT、INSERT、UPDATE、DELETEなど、データを操作する言語。", level: 2, confusion: "DDLは構造、DMLは中身" },
  { id: "grant", term: "GRANT", category: "データベース", hint: "英語では『与える』。対になる命令はREVOKE。", hardPrompt: "データベース利用者へSELECT権限を付与するSQL命令は？", answer: "ユーザーやロールに、SELECTやUPDATEなどの権限を付与するSQL文。取り消しはREVOKE。", level: 3 },
  { id: "truncate", term: "TRUNCATE", category: "データベース", hint: "DELETEより大胆だが、DROPほどではない。", answer: "テーブルの構造を残したまま全行を高速に削除するDDL。条件を指定するWHEREは使えない。", level: 2, confusion: "DELETEはDML、TRUNCATEはDDL" },
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
  { id: "dmz", term: "DMZ", category: "セキュリティ", hint: "インターネットと社内LANの間に、公開用の緩衝地帯を置く。", answer: "Webサーバなどの公開サーバを配置し、インターネットと社内LANの両方から隔離する領域。", level: 1 },
  { id: "fp-method", term: "FP法", category: "マネジメント", hint: "プログラムの行数ではなく、利用者から見える入出力や機能を数える。", answer: "利用者から見た機能の種類と数を基に、ソフトウェアの規模をファンクションポイントで見積もる方法。", level: 1 },
  { id: "swot-external", term: "SWOTの外部環境", category: "ストラテジ", hint: "自社の中では制御しにくい、追い風と向かい風の二つ。", answer: "Opportunity（機会）とThreat（脅威）。StrengthとWeaknessは内部環境。", level: 1 },
  { id: "ppm", term: "PPM", category: "ストラテジ", hint: "事業を二つの軸で四象限に置く。縦は市場の伸び、横は自社の強さ。", answer: "市場成長率と相対的市場シェアで事業を分類し、経営資源の配分を検討する手法。", level: 1 },
  { id: "ppm-problem-child", term: "PPM：問題児", category: "ストラテジ", hint: "市場は伸びているが、自社はまだ強くない事業。", answer: "市場成長率が高く、相対的市場シェアが低い事業。育成には大きな投資が必要。", level: 1 },
  { id: "balance-sheet", term: "貸借対照表", category: "ストラテジ", hint: "ある時点の会社の財産と、その調達元を左右で見る。", answer: "B/S。一定時点の資産・負債・純資産を示し、財政状態を表す財務諸表。", level: 1 },
  { id: "income-statement", term: "損益計算書", category: "ストラテジ", hint: "一定期間に、いくら稼ぎ、いくら使い、いくら残ったか。", answer: "P/L。一定期間の売上・費用・利益を示し、経営成績を表す財務諸表。", level: 1 },
  { id: "incident-management", term: "インシデント管理", category: "マネジメント", hint: "まず通常サービスへ早く戻す。原因究明は別の管理プロセス。", answer: "サービス中断や品質低下から、可能な限り早く通常サービスを復旧するための管理。", level: 1, confusion: "問題管理は根本原因と再発防止を扱う" },
  { id: "problem-management", term: "問題管理", category: "マネジメント", hint: "火を消すだけでなく、なぜ燃えたかを調べて次を防ぐ。", answer: "インシデントの根本原因を特定し、恒久対策によって再発を防止するための管理。", level: 1, confusion: "インシデント管理は早期復旧を優先する" },
  { id: "service-request", term: "サービス要求", category: "マネジメント", hint: "障害ではなく、利用者からの定型的なお願い。", answer: "パスワードリセットや情報提供など、通常のサービス提供に関する利用者からの依頼。", level: 1 },
  { id: "sla", term: "SLA", category: "マネジメント", hint: "提供者と利用者が、応答時間や稼働率などの目標を約束する。", hardPrompt: "サービス提供者と顧客が、稼働率99.9％や応答時間などの目標値を文書で合意した。この文書は？", answer: "Service Level Agreement。サービスの品質水準について、提供者と利用者の間で合意した文書。稼働率や応答時間などを定める。", level: 1, confusion: "SLMはSLAの達成状況を管理・改善する活動" },
  { id: "service-level-management", term: "サービスレベル管理（SLM）", category: "マネジメント", hint: "品質目標を決めるだけでなく、実績を測定し、未達なら改善する。", hardPrompt: "合意したサービス水準の実績を測定・報告し、未達時に改善を続ける管理活動は？", answer: "Service Level Management。SLAを合意し、サービス水準を監視・報告して、目標を達成できるよう継続的に改善する管理プロセス。", level: 1, confusion: "SLAは品質水準についての合意そのもの" },
  { id: "configuration-management", term: "構成管理", category: "マネジメント", hint: "サービスを構成する機器やソフトと、それらの関係を記録する。", answer: "サーバ、ネットワーク機器、ソフトウェア、文書などの構成アイテムと、その属性・関係・履歴を正確に管理する活動。", level: 1, confusion: "変更管理は変更の影響とリスクを評価・承認する" },
  { id: "change-management", term: "変更管理", category: "マネジメント", hint: "本番環境を変える前に、影響や危険性を評価して承認する。", answer: "ITサービスへの変更について、実施前に影響・リスク・優先度を評価し、承認や計画を行って障害を抑える管理。", level: 1, confusion: "構成管理は機器やソフトなどの構成情報を管理する" },
  { id: "availability-management", term: "可用性管理", category: "マネジメント", hint: "通常時に、必要なサービスを必要なとき使えるようにする。", answer: "事業が必要とする可用性を満たすため、稼働率、信頼性、保守性などを設計・測定・改善する管理。", level: 1, confusion: "ITサービス継続性管理は大規模災害などからの継続・復旧を扱う" },
  { id: "it-service-continuity-management", term: "ITサービス継続性管理", category: "マネジメント", hint: "災害や重大障害が起きても、重要サービスを継続・復旧できるよう備える。", answer: "災害など重大な中断時にも必要なITサービスを継続し、合意した時間内に復旧できるよう計画・訓練・対策を行う管理。", level: 1, confusion: "可用性管理は主に通常時の利用可能性を維持・改善する" },
  { id: "knowledge-management", term: "ナレッジ管理", category: "マネジメント", hint: "FAQや障害対応の経験を、個人の記憶だけにせず再利用する。", answer: "FAQ、既知のエラー、障害対応手順などの知識を収集・整理・共有し、適切な判断と迅速な対応に活用する管理。", level: 1 },
  { id: "event-management", term: "イベント管理", category: "マネジメント", hint: "機器やサービスから届く警告・通知・状態変化を見張る。", answer: "ITサービスや構成アイテムで発生する通知・警告・例外などのイベントを検知、記録、分類し、必要な対応へつなげる管理。", level: 1, confusion: "インシデント管理はサービスを早期復旧する" },
  { id: "itil", term: "ITIL", category: "マネジメント", hint: "ITサービス管理をうまく行うための、実践知をまとめた体系。", answer: "ITサービスマネジメントのベストプラクティスを体系化したフレームワーク。組織がサービス価値を継続的に生み出すための考え方を示す。", level: 1, confusion: "ISO/IEC 20000は認証にも用いられる国際規格" },
  { id: "iso-iec-20000", term: "ISO/IEC 20000", category: "マネジメント", hint: "ITサービスマネジメントの仕組みに対する国際的な要求事項。", answer: "ITサービスマネジメントシステムに関する国際規格。組織がサービスを計画・提供・評価・改善するための要求事項を定める。", level: 1, confusion: "ITILはベストプラクティスをまとめたフレームワーク" },
  { id: "kpi", term: "KPI", category: "マネジメント", hint: "目標に近づいているかを途中で測る重要なものさし。", answer: "Key Performance Indicator。組織や業務が目標達成へどの程度進んでいるかを測定する重要業績評価指標。", level: 1 },
  { id: "evm-cost", term: "EVMのコスト評価", category: "マネジメント", hint: "出来高に対して、実際にいくら使ったかを比べる。", answer: "EV（出来高）とAC（実コスト）を比較する。CV＝EV－AC、CPI＝EV÷ACで評価する。", level: 1 },
  { id: "earliest-finish", term: "最早終了時刻", category: "マネジメント", hint: "作業を最も早く始められる時刻に、その作業時間を足す。", answer: "最早開始時刻＋所要時間で求める、その作業を最も早く終了できる時刻。", level: 1 },
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
  { id: "replication", term: "レプリケーション", category: "データベース", hint: "同じデータの写しを別のDBにも持たせる。", answer: "同じデータを複数のデータベースへ複製し、可用性向上や読み取り負荷の分散に利用する仕組み。", level: 1 },
  { id: "sharding", term: "シャーディング", category: "データベース", hint: "コピーを作るのではなく、データの担当範囲を分けて別々に持つ。", answer: "データをキーなどで水平分割し、複数のデータベースへ分散して保持する方式。容量や処理負荷を分散する。", level: 1, confusion: "レプリケーションは同じデータを複製する" },
  { id: "primary-db", term: "プライマリDB", category: "データベース", hint: "複製構成で、変更を最初に受け付ける中心側。", answer: "レプリケーション構成で主に更新処理を受け付け、変更内容をレプリカDBへ送る側のデータベース。", level: 1 },
  { id: "replica-db", term: "レプリカDB", category: "データベース", hint: "中心側から送られたデータの写しを保持する側。", answer: "プライマリDBのデータの複製を保持する側。読み取り分散や障害時の切替先などに利用する。", level: 1 },
  { id: "sync-replication", term: "同期レプリケーション", category: "データベース", hint: "複製先にも届いたことを確認してから、更新完了とする。", answer: "レプリカへの反映完了を待ってからプライマリの更新を完了する方式。整合性に強いが、遅延が増えやすい。", level: 1 },
  { id: "async-replication", term: "非同期レプリケーション", category: "データベース", hint: "複製先への到着を待たず、中心側は先に更新完了を返す。", answer: "レプリカへの反映完了を待たずにプライマリの更新を完了する方式。高速だが、反映遅延や障害時のデータ欠損リスクがある。", level: 1, confusion: "同期方式はレプリカ反映を待ってから完了する" },
  { id: "database-design", term: "DB設計", category: "データベース", hint: "業務で必要な情報を、だんだん実装に近い形へ落とし込む。", answer: "業務要件を基にデータの構造や関係を決める作業。概念設計、論理設計、物理設計の順に具体化する。", level: 1 },
  { id: "conceptual-design", term: "概念設計", category: "データベース", hint: "最初に、業務上どんなものと関係があるかを整理する段階。", answer: "業務の対象となる実体（エンティティ）とその関係を整理する設計。DBMSや表の実装方法には依存しない。", level: 1, confusion: "論理設計は表・主キー・外部キーなどへ落とし込む" },
  { id: "logical-design", term: "論理設計", category: "データベース", hint: "業務上の実体を、表やキーとして整理する段階。", answer: "概念設計を基に、テーブル、列、主キー、外部キー、正規化などの論理的な構造を決める設計。", level: 1, confusion: "物理設計はインデックスや格納方法などを決める" },
  { id: "physical-design", term: "物理設計", category: "データベース", hint: "性能や容量を考え、実際のDBMS上での置き方を決める段階。", answer: "使用するDBMSに合わせ、インデックス、格納領域、パーティション、データ型などの物理的な実装を決める設計。", level: 1, confusion: "概念設計は業務上の実体と関係を整理する" },
  { id: "transaction-isolation-level", term: "トランザクション分離レベル", category: "データベース", hint: "同時実行中の別処理から、どこまで影響を受けないようにするか。", answer: "複数のトランザクションを同時実行するときの隔離の強さ。一般にREAD UNCOMMITTED、READ COMMITTED、REPEATABLE READ、SERIALIZABLEの順に強くなる。", level: 1 },
  { id: "read-uncommitted", term: "READ UNCOMMITTED", category: "データベース", hint: "分離レベルは最低。まだ確定していない変更も見えてしまう。", hardPrompt: "別トランザクションがまだ確定していない更新値まで読める、最も低い分離レベルは？", answer: "最も低い分離レベル。未コミットのデータを読めるため、ダーティリード、ノンリピータブルリード、ファントムリードが発生し得る。", level: 1, confusion: "READ COMMITTEDはダーティリードを防ぐ" },
  { id: "read-committed", term: "READ COMMITTED", category: "データベース", hint: "確定した値だけを読むが、同じ行を後で読むと変わることはある。", hardPrompt: "ダーティリードは防ぐが、同じ行を再読したときの値までは保証しない分離レベルは？", answer: "コミット済みのデータだけを読む分離レベル。ダーティリードは防ぐが、ノンリピータブルリードとファントムリードは発生し得る。", level: 1, confusion: "REPEATABLE READは同じ行の再読結果を保つ" },
  { id: "repeatable-read", term: "REPEATABLE READ", category: "データベース", hint: "一度読んだ同じ行は、処理中にもう一度読んでも同じ値。", hardPrompt: "ダーティリードとノンリピータブルリードを防ぐが、標準上は行の増減が起こり得る分離レベルは？", answer: "同じトランザクション内で一度読んだ行を再読しても同じ値を保証する分離レベル。ダーティリードとノンリピータブルリードを防ぐが、標準上はファントムリードが発生し得る。", level: 1, confusion: "SERIALIZABLEはファントムリードも防ぐ" },
  { id: "serializable-isolation", term: "SERIALIZABLE", category: "データベース", hint: "分離レベルは最高。同時実行でも一つずつ順番に処理した結果になる。", hardPrompt: "三つのリード異常をすべて防ぐ代わりに、並行性が最も低くなりやすい分離レベルは？", answer: "最も高い分離レベル。直列実行と同等の結果を保証し、ダーティリード、ノンリピータブルリード、ファントムリードを防ぐ。", level: 1, confusion: "分離性は高いが、並行性や性能は低下しやすい" },
  { id: "primary-key", term: "主キー", category: "データベース", hint: "各行を一つに特定する代表者。重複も空欄も許さない。", answer: "テーブルの各行を一意に識別するキー。重複を許さず、NULLにもできない。候補キーから一つ選ぶ。", level: 1 },
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
  { id: "full-backup", term: "フルバックアップ", category: "データベース", hint: "毎回、対象データを全部保存する。", answer: "対象データ全体を毎回バックアップする方式。復元は単純だが、取得時間と保存容量が大きい。", level: 1 },
  { id: "differential-backup", term: "差分バックアップ", category: "データベース", hint: "最後のフル以降に変わった分を、毎回まとめて保存する。", answer: "直近のフルバックアップ以降に変更された全データを保存する方式。復元にはフルと最新の差分が必要。", level: 1 },
  { id: "incremental-backup", term: "増分バックアップ", category: "データベース", hint: "直前のバックアップ以降に変わった分だけ保存する。", answer: "直前のフルまたは増分バックアップ以降の変更分だけを保存する方式。取得は速いが、復元には一連のバックアップが必要。", level: 1, confusion: "差分は直近のフル以降の変更を毎回保存する" },
  { id: "database-index", term: "インデックス", category: "データベース", hint: "本の索引のように、目的の行を速く探すための別構造。", answer: "検索対象の列の値と行の位置を管理し、検索を高速化するデータ構造。B+木やハッシュなどがある。", level: 1 },
  { id: "index-tradeoff", term: "インデックスのトレードオフ", category: "データベース", hint: "読むのは速くなるが、書くたびに索引も直す必要がある。", hardPrompt: "検索を高速化する目的で索引を多数追加したところ、更新処理が遅くなった。主な理由は？", answer: "検索や並べ替えを高速化できる一方、追加・更新・削除のたびに索引の更新負荷と保存容量が増えること。作り過ぎると更新性能が下がる。", level: 1, confusion: "インデックスは参照性能を高める一方、更新時には保守コストがかかる" },
  { id: "optimizer", term: "オプティマイザ", category: "データベース", hint: "SQLをどう実行すれば速いか、候補から選ぶ。", answer: "SQLの複数の実行方法をコストなどで評価し、結合順序やインデックス利用を含む効率的な実行計画を選ぶ機能。", level: 1 },
  { id: "execution-plan", term: "実行計画", category: "データベース", hint: "表を読む順番や索引利用など、SQL実行の手順書。", answer: "DBMSがSQLを処理する具体的な手順。アクセス方法、結合方法、結合順序、推定コストなどを示す。", level: 1 },
  { id: "partitioning", term: "パーティショニング", category: "データベース", hint: "一つの大きな表を、日付や範囲などで内部的に分ける。", answer: "大規模なテーブルやインデックスを範囲・リスト・ハッシュなどで複数領域に分割し、管理性や性能を高める方式。", level: 1, confusion: "シャーディングは複数DBへデータを分散する" },
  { id: "view", term: "VIEW", category: "データベース", hint: "検索結果を表のように見せるが、通常は結果自体を保存しない。", answer: "SELECT文を定義として保存し、仮想的なテーブルとして扱う仕組み。複雑な検索の簡略化やアクセス制御に使う。", level: 1, confusion: "マテリアライズドビューは検索結果を実データとして保存する" },
  { id: "not-null", term: "NOT NULL制約", category: "データベース", hint: "その列を空欄にはできない。", answer: "指定した列にNULLを格納することを禁止し、必ず値が入るようにする制約。", level: 1 },
  { id: "two-phase-commit", term: "2相コミット", category: "データベース", hint: "複数DBへ、準備確認と確定の二段階で一斉に反映する。", answer: "分散トランザクションで、各参加者にコミット可能か確認する準備フェーズと、全体を確定・取消する決定フェーズに分けて原子性を保つ方式。", level: 1 },
  { id: "failover", term: "フェイルオーバー", category: "データベース", hint: "稼働中の系が故障したら、待機系へ役割を切り替える。", answer: "障害発生時に、処理を現用系から待機系やレプリカへ自動または手動で切り替えてサービスを継続すること。", level: 1 },
  { id: "oltp", term: "OLTP", category: "データベース", hint: "日々の注文や入出金など、短い更新処理を大量に扱う。", answer: "Online Transaction Processing。多数の短いトランザクションをリアルタイムに処理する方式。更新の速さと整合性を重視する。", level: 1 },
  { id: "olap", term: "OLAP", category: "データベース", hint: "大量の履歴を多角的に集計し、意思決定に使う。", answer: "Online Analytical Processing。蓄積した大量データを多次元的に集計・分析する方式。複雑な参照処理を重視する。", level: 1, confusion: "OLTPは日常業務の短い更新処理を扱う" },
  { id: "data-warehouse", term: "データウェアハウス（DWH）", category: "データベース", hint: "業務データを分析しやすい形へ整理・加工し、長期的に蓄積する。", answer: "Data Warehouse。複数システムのデータを目的別・時系列に統合、整理、加工して蓄積し、分析や意思決定に利用するデータ基盤。", level: 1, confusion: "データレイクは加工前を含む多様なデータを元の形式に近いまま蓄積する" },
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
  { id: "externalization", term: "表出化", category: "マネジメント", hint: "経験や勘を、文章・図・手順として言葉にする。", answer: "SECIモデルで、個人の暗黙知を言語化・図式化して形式知へ変換するプロセス。暗黙知から形式知。", level: 1 },
  { id: "combination", term: "連結化", category: "マネジメント", hint: "複数の文書やデータを編集し、新しい体系的な知識にまとめる。", answer: "SECIモデルで、複数の形式知を組み合わせ、整理・編集して新たな形式知を生み出すプロセス。形式知から形式知。", level: 1 },
  { id: "socialization", term: "共同化", category: "マネジメント", hint: "一緒に作業し、言葉にしにくいコツを体験から受け継ぐ。", answer: "SECIモデルで、共通体験や観察・模倣を通じて暗黙知を共有するプロセス。暗黙知から暗黙知。", level: 1 },
  { id: "internalization", term: "内面化", category: "マネジメント", hint: "手順書などを実践し、自分の経験や技能として身に付ける。", answer: "SECIモデルで、形式知を実践・学習によって個人の暗黙知として身に付けるプロセス。形式知から暗黙知。", level: 1 },
  { id: "initiating-process-group", term: "立上げのプロセス群", category: "マネジメント", hint: "プロジェクトやフェーズを正式に始め、目的と責任者を明確にする。", hardPrompt: "プロジェクト憲章を作成し、プロジェクトを正式に開始する承認を得るプロセス群は？", answer: "プロジェクトまたはフェーズを正式に開始し、目的、主要な利害関係者、プロジェクトマネージャなどを明確にするプロセス群。", level: 1 },
  { id: "planning-process-group", term: "計画のプロセス群", category: "マネジメント", hint: "プロジェクトの目的、範囲、日程、費用、リスクへの進め方を決める。", hardPrompt: "スコープ、スケジュール、コスト、品質、リスクなどの実行方針を具体化するプロセス群は？", answer: "プロジェクトの目標を明確にし、スコープ、スケジュール、コスト、品質、リスクなどの計画を作成するプロセス群。", level: 1 },
  { id: "executing-process-group", term: "実行のプロセス群", category: "マネジメント", hint: "作成した計画に従い、人や資源を動かして成果物を作る。", hardPrompt: "プロジェクト計画に従ってチームと資源を調整し、成果物を作成するプロセス群は？", answer: "プロジェクトマネジメント計画に沿って作業を実施し、人や資源を調整して要求された成果物を作るプロセス群。", level: 1 },
  { id: "controlling-process-group", term: "監視・コントロールのプロセス群", category: "マネジメント", hint: "計画と実績のずれを確認し、必要なら進め方を修正する。", hardPrompt: "進捗と実績を計画値と比較し、差異を分析して是正処置や変更を行うプロセス群は？", answer: "プロジェクトの実績を測定して計画と比較し、差異を分析して是正処置や変更を行うプロセス群。", level: 1 },
  { id: "closing-process-group", term: "終結のプロセス群", category: "マネジメント", hint: "成果物の受入れを確認し、契約や記録を閉じて正式に完了させる。", hardPrompt: "成果物の正式な受入れ、契約の完了、教訓の記録などを行うプロセス群は？", answer: "プロジェクトまたはフェーズの成果物を正式に受け入れ、契約・文書・教訓などを整理して完了させるプロセス群。", level: 1 },
  { id: "metadata", term: "メタデータ", category: "データベース", hint: "図書館の本に対する、タイトル・著者・分類番号のような情報。", answer: "表名、列名、データ型、制約など、データの構造や性質を説明する情報。", level: 3 },
  { id: "tuckman-model", term: "タックマンモデル", category: "マネジメント", hint: "チームができてから機能するまでの段階を考える。", hardPrompt: "新しいチームが形成・混乱・統一・機能を経て成熟する過程を説明するモデルは？", answer: "チームの発達を形成期・混乱期・統一期・機能期などの段階で捉えるモデル。意見の対立を経て役割や規範が定まり、協働できるようになる。", level: 1, collection: "special" },
  { id: "mes", term: "MES", category: "ストラテジ", hint: "企業全体の計画と、工場の現場作業の間をつなぐ。", hardPrompt: "工場の製造現場で作業指示・進捗・品質・設備稼働などを管理するシステムは？", answer: "Manufacturing Execution System（製造実行システム）。製造現場の作業指示や進捗、品質、設備稼働などを管理し、ERPの計画と現場をつなぐ。", level: 1, collection: "special", confusion: "ERPは企業全体の経営資源、MESは製造現場の実行を管理する" },
  { id: "scala-language", term: "Scala", category: "テクノロジ", hint: "オブジェクト指向と関数型の両方を使える言語。", hardPrompt: "オブジェクト指向と関数型プログラミングを統合し、JVM上でも動く静的型付け言語は？", answer: "オブジェクト指向と関数型の特徴を併せ持つ静的型付けプログラミング言語。JVM上で動作し、Javaの資産も利用できる。", level: 1, collection: "special" },
  { id: "delphi-method", term: "デルファイ法", category: "ストラテジ", hint: "専門家の予測を一度で決めず、回答を集めて繰り返し見直す。", hardPrompt: "専門家へ匿名で質問を繰り返し、集計結果を示しながら意見を収束させる予測手法は？", answer: "複数の専門家へ匿名のアンケートを反復し、前回の集計結果を知らせながら将来予測などの意見を収束させる手法。", level: 1, collection: "special", confusion: "ブレーンストーミングは対面などで自由にアイデアを出す手法" },
  { id: "brainstorming", term: "ブレーンストーミング", category: "ストラテジ", hint: "まず量を出す。人の案をその場で批判しない。", hardPrompt: "批判を控え、自由な発想や他人の案との結合を促してアイデアを広げる手法は？", answer: "参加者が批判を避けて自由に多数のアイデアを出し、他人の案の発展や組合せも歓迎する発想法。", level: 1, collection: "special", confusion: "デルファイ法は専門家への反復アンケートで意見を収束させる" },
  { id: "feasibility-study", term: "フィージビリティスタディ", category: "ストラテジ", hint: "本格着手の前に、実現できるかを調べる。", hardPrompt: "新規事業やシステム化の着手前に、技術・費用・期間などから実現可能性を評価する調査は？", answer: "計画に本格着手する前に、技術面・費用・期間・効果などを調べ、実現可能性を評価すること。FSともいう。", level: 1, collection: "special" },
  { id: "reverse-proxy", term: "リバースプロキシ", category: "ネットワーク", hint: "利用者ではなく、Webサーバの手前に置く代理窓口。", hardPrompt: "外部利用者からの要求を受け、背後のサーバへ振り分ける中継サーバは？", answer: "クライアントからの要求をサーバの手前で受け、背後のWebサーバへ転送する仕組み。負荷分散、キャッシュ、TLS終端などに使う。", level: 1, collection: "special", confusion: "通常のフォワードプロキシは利用者側の代理として外部へアクセスする" },
  { id: "marketing-4p-4c", term: "マーケティングの4P・4C", category: "ストラテジ", hint: "売り手の施策と、買い手から見た価値を対応させる。", hardPrompt: "Product・Price・Place・Promotionと、顧客価値・顧客コスト・利便性・コミュニケーションを対応させる考え方は？", answer: "4Pは売り手視点の製品・価格・流通・販促。4Cは買い手視点の顧客価値・顧客コスト・利便性・コミュニケーション。両者を対応させて施策を考える。", level: 1, collection: "special" },
  { id: "immersion-cooling", term: "液浸冷却", category: "テクノロジ", hint: "サーバの熱を空気ではなく液体へ逃がす。", hardPrompt: "サーバなどの電子機器を絶縁性の液体に浸して熱を取り除く冷却方式は？", answer: "サーバなどを電気を通しにくい冷却液へ浸し、機器の熱を液体へ移して冷却する方式。空冷と異なり液体で直接熱を回収する。", level: 1, collection: "special" },
  { id: "iot", term: "IoT", category: "ストラテジ", hint: "身近な機器や設備がネットにつながり、データをやり取りする。", hardPrompt: "センサを備えた機器などをネットワークにつなぎ、状態の収集や遠隔制御に利用する仕組みは？", answer: "Internet of Things（モノのインターネット）。機器や設備をネットワークにつなぎ、データの収集・分析や遠隔制御などに活用する。", level: 1, collection: "special" },
  { id: "soa", term: "SOA", category: "テクノロジ", hint: "業務機能を独立したサービスとして組み合わせる設計。", hardPrompt: "業務機能を再利用可能なサービスとして分け、連携させてシステムを構築する考え方は？", answer: "Service-Oriented Architecture（サービス指向アーキテクチャ）。業務機能を独立したサービスとして公開・連携し、再利用しやすくする設計思想。", level: 1, collection: "special" },
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
const backupKeys = ["ap-study-progress", "ap-study-round", "ap-study-priority-round", "ap-study-mode-stats", "ap-study-question-stats-v1", collectionStorageKey, retentionResetKey] as const;

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

function buildRound(selectedCategory: "すべて" | Category, savedProgress: Progress, previousRound: string[] = [], onlyPriority = false, onlyUnseen = false, onlyWeak = false, overrides: CollectionOverrides = {}, collection: Collection = "regular") {
  const pool = terms.filter((item) => {
    return (selectedCategory === "すべて" || item.category === selectedCategory)
      && getCollection(item, overrides) === collection
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

function buildLowQuizRound(selectedCategory: "すべて" | Category, savedProgress: Progress, previousRound: string[] = [], overrides: CollectionOverrides = {}) {
  const pool = shuffle(terms.filter((item) => getCollection(item, overrides) === "regular" && (selectedCategory === "すべて" || item.category === selectedCategory)));
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
  ["acid", "transaction", "serializability", "transaction-isolation-level"],
  ["lock", "shared-lock", "deadlock", "consistency"],
  ["swot-external", "ppm", "ppm-problem-child", "pest"],
  ["balance-sheet", "income-statement", "intellectual-assets", "core-competence"],
  ["incident-management", "problem-management", "service-request"],
  ["sla", "service-level-management", "kpi", "itil"],
  ["configuration-management", "change-management", "event-management", "knowledge-management"],
  ["availability-management", "it-service-continuity-management", "incident-management", "problem-management"],
  ["itil", "iso-iec-20000", "service-level-management", "sla"],
  ["crm", "scm", "erp", "bpr"],
  ["segmentation", "targeting", "positioning", "product-life-cycle"],
  ["fp-method", "analogy-estimation", "evm-cost", "earliest-finish"],
  ["napt", "dhcp", "spf", "packet"],
  ["functional-dependency", "partial-functional-dependency", "transitive-functional-dependency", "normalization"],
  ["unique-constraint", "check-constraint", "referential-integrity", "foreign-key"],
  ["bplus-tree-index", "hash-index", "composite-index", "materialized-view"],
  ["replication", "sharding", "primary-db", "replica-db"],
  ["sync-replication", "async-replication", "replication", "replica-db"],
  ["conceptual-design", "logical-design", "physical-design", "database-design"],
  ["read-uncommitted", "read-committed", "repeatable-read", "serializable-isolation", "transaction-isolation-level"],
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
  ["optimizer", "execution-plan", "partitioning", "index-tradeoff"],
  ["view", "materialized-view", "not-null", "check-constraint"],
  ["two-phase-commit", "failover", "replication", "sharding"],
  ["oltp", "olap", "data-warehouse", "etl"],
  ["data-mart", "data-lake", "star-schema", "data-warehouse"],
  ["exploit-code", "heuristic", "polymorphic", "rootkit"],
  ["external-schema", "conceptual-schema", "internal-schema", "view"],
  ["false-negative", "false-positive", "heuristic", "exploit-code"],
  ["hot-standby", "warm-standby", "cold-standby", "failover"],
  ["rto", "rpo", "it-service-continuity-management", "checkpoint"],
  ["externalization", "combination", "socialization", "internalization"],
  ["initiating-process-group", "planning-process-group", "executing-process-group", "controlling-process-group", "closing-process-group"],
  ["tuckman-model", "planning-process-group", "controlling-process-group", "incident-management"],
  ["mes", "erp", "scm", "iot"],
  ["scala-language", "soa", "iot", "mes"],
  ["delphi-method", "brainstorming", "feasibility-study", "analogy-estimation"],
  ["reverse-proxy", "napt", "packet", "dmz"],
  ["marketing-4p-4c", "segmentation", "targeting", "positioning"],
  ["immersion-cooling", "warm-standby", "hot-standby", "availability-management"],
  ["soa", "erp", "scm", "crm"],
];

function textBigrams(text: string) {
  const normalized = text.toUpperCase().replace(/[\s・（）()／/＝=、。,.：:「」『』\-]/g, "");
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

type Difficulty = "easy" | "normal" | "hard";

function getChoices(card: Term, difficulty: Difficulty) {
  const group = confusionGroups.find((ids) => ids.includes(card.id)) ?? [];
  const candidates = terms.filter((item) => item.id !== card.id).map((item) => {
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
  const isAsciiTerm = /^[A-Za-z0-9+&/\-]+$/.test(card.term);
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
  const [collectionFilter, setCollectionFilter] = useState<"all" | Collection>("all");
  const [collectionOverrides, setCollectionOverrides] = useState<CollectionOverrides>({});
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
    let savedCollections: CollectionOverrides = {};
    try {
      const parsed = JSON.parse(localStorage.getItem(collectionStorageKey) ?? "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        savedCollections = Object.fromEntries(Object.entries(parsed).filter(([id, value]) => terms.some((item) => item.id === id) && (value === "regular" || value === "special"))) as CollectionOverrides;
      }
    } catch { /* 古いデータや破損した設定は初期の区分を使う */ }
    setCollectionOverrides(savedCollections);
    const saved = localStorage.getItem("ap-study-progress");
    let savedProgress = saved ? JSON.parse(saved) as Progress : {};
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
    setProgress(savedProgress);
    const savedStats = localStorage.getItem("ap-study-mode-stats");
    if (savedStats) setModeStats((old) => ({ ...old, ...JSON.parse(savedStats) as Partial<ModeStats> }));
    const savedQuestionStats = localStorage.getItem("ap-study-question-stats-v1");
    if (savedQuestionStats) setQuestionStats(JSON.parse(savedQuestionStats) as QuestionStats);
    const savedRoundText = localStorage.getItem("ap-study-round");
    try {
      const savedRound = savedRoundText ? JSON.parse(savedRoundText) as { ids?: unknown; position?: unknown; category?: unknown } : null;
      const savedCategory = savedRound?.category;
      const validCategory = categoryNames.includes(savedCategory as typeof categoryNames[number]);
      const savedIds = Array.isArray(savedRound?.ids) ? savedRound.ids as unknown[] : [];
      const validIds = savedIds.length > 0
        && savedIds.length <= 5
        && new Set(savedIds).size === savedIds.length
        && savedIds.every((id) => typeof id === "string" && terms.some((item) => item.id === id && getCollection(item, savedCollections) === "regular"));
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
        setRoundIds(buildRound("すべて", savedProgress, [], false, false, false, savedCollections));
      }
    } catch {
      setRoundIds(buildRound("すべて", savedProgress, [], false, false, false, savedCollections));
    }
    const savedPriorityText = localStorage.getItem("ap-study-priority-round");
    try {
      const savedPriority = savedPriorityText ? JSON.parse(savedPriorityText) as { ids?: string[]; position?: number } : null;
      const validIds = Array.isArray(savedPriority?.ids) && savedPriority.ids.length > 0 && savedPriority.ids.length <= 5 && new Set(savedPriority.ids).size === savedPriority.ids.length && savedPriority.ids.every((id) => terms.some((item) => item.id === id && getCollection(item, savedCollections) === "regular" && getRetention(item, savedProgress) < 40));
      const validPosition = validIds && typeof savedPriority?.position === "number" && savedPriority.position >= 0 && savedPriority.position < savedPriority.ids!.length;
      if (validIds && validPosition) {
        setPriorityIds(savedPriority!.ids!);
        setPriorityPosition(savedPriority!.position!);
      } else {
        setPriorityIds(buildRound("すべて", savedProgress, [], true, false, false, savedCollections));
      }
    } catch {
      setPriorityIds(buildRound("すべて", savedProgress, [], true, false, false, savedCollections));
    }
    setUnseenIds(buildRound("すべて", savedProgress, [], false, true, false, savedCollections));
    setWeakIds(buildRound("すべて", savedProgress, [], false, false, true, savedCollections));
    setLowQuizIds(buildLowQuizRound("すべて", savedProgress, [], savedCollections));
    setSpecialIds(buildRound("すべて", savedProgress, [], false, false, false, savedCollections, "special"));
    setHydrated(true);
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
    const collectionMatch = collectionFilter === "all" || getCollection(item, collectionOverrides) === collectionFilter;
    const textMatch = `${item.term} ${item.answer}`.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && collectionMatch && textMatch;
    });
    if (sortOrder === "retention-asc") return [...matched].sort((a, b) => getRetention(a, progress) - getRetention(b, progress));
    if (sortOrder === "retention-desc") return [...matched].sort((a, b) => getRetention(b, progress) - getRetention(a, progress));
    return matched;
  }, [category, collectionFilter, collectionOverrides, query, sortOrder, progress]);

  const activeIds = mode === "priority" ? priorityIds : mode === "weak" ? weakIds : mode === "unseen" ? unseenIds : mode === "lowquiz" ? lowQuizIds : mode === "special" ? specialIds : roundIds;
  const activePosition = mode === "priority" ? priorityPosition : mode === "weak" ? weakPosition : mode === "unseen" ? unseenPosition : mode === "lowquiz" ? lowQuizPosition : mode === "special" ? specialPosition : roundPosition;
  const card = terms.find((item) => item.id === activeIds[activePosition]);
  const retention = card ? getRetention(card, progress) : 0;
  const retentionStatus = getRetentionStatus(retention);
  const difficulty: Difficulty = retention < 40 ? "easy" : retention >= 75 ? "hard" : "normal";
  const questionDifficulty = useMemo(() => difficulty, [card?.id, activePosition, mode]);
  const cardRecord = card ? progress[card.id] : undefined;
  const choices = useMemo(() => card ? getChoices(card, questionDifficulty) : [], [card?.id, activePosition, mode]);
  const questionCopy = useMemo(() => {
    if (!card) return { studyLabel: "この用語を説明できますか？", quizLabel: "この説明に当てはまる用語は？", quizText: "", difficultyLabel: "標準" };
    const studyLabels = ["この用語を説明できますか？", "意味と役割を思い出せますか？", "この用語の要点を言えますか？"];
    const useFeatureQuestion = questionDifficulty === "hard" || (questionDifficulty === "normal" && Math.random() < 0.5);
    const hardQuestion = maskAnswerTerm(card.hardPrompt ?? card.answer, card);
    return {
      studyLabel: studyLabels[Math.floor(Math.random() * studyLabels.length)],
      quizLabel: questionDifficulty === "hard" ? "難問：状況と違いから判断してください" : useFeatureQuestion ? "次の特徴に当てはまる用語は？" : "この説明に当てはまる用語は？",
      quizText: questionDifficulty === "hard" ? hardQuestion : maskAnswerTerm(useFeatureQuestion ? card.hint : card.answer, card),
      difficultyLabel: questionDifficulty === "easy" ? "やさしめ" : questionDifficulty === "hard" ? "定着チャレンジ" : "標準",
    };
  }, [card?.id, activePosition, mode]);
  const currentModeKey: ModeKey | null = mode === "list" ? null : mode;
  const isQuizView = mode === "quiz" || mode === "lowquiz" || ((mode === "priority" || mode === "weak" || mode === "unseen" || mode === "special") && focusFormat === "quiz");
  const currentResults = currentModeKey ? sessionResults[currentModeKey] : [];
  const sessionCorrect = currentResults.filter((item) => item.result === "correct").length;
  const sessionWrong = currentResults.length - sessionCorrect;
  const regularTerms = terms.filter((item) => getCollection(item, collectionOverrides) === "regular");
  const specialCount = terms.length - regularTerms.length;
  const mastered = regularTerms.filter((item) => !isUnseen(item, progress) && getRetention(item, progress) >= 75).length;
  const unseenCount = regularTerms.filter((item) => isUnseen(item, progress)).length;
  const weakCount = regularTerms.filter((item) => isWeak(item, progress)).length;
  const answeredCount = regularTerms.length - unseenCount;
  const priorityCount = regularTerms.filter((item) => getRetention(item, progress) < 40).length;
  const sessionGoal = mode === "special"
    ? Math.min(5, terms.filter((item) => getCollection(item, collectionOverrides) === "special" && (category === "すべて" || item.category === category)).length)
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
        setPriorityIds(buildRound("すべて", next, priorityIds, true, false, false, collectionOverrides));
        setPriorityPosition(0);
      } else {
        setPriorityPosition((old) => old + 1);
      }
      setSession([]);
    } else if (mode === "weak") {
      if (weakPosition >= weakIds.length - 1) {
        setWeakIds(buildRound(category, next, weakIds, false, false, true, collectionOverrides));
        setWeakPosition(0);
      } else setWeakPosition((old) => old + 1);
      setSession((old) => [...old, card.id]);
    } else if (mode === "unseen") {
      if (unseenPosition >= unseenIds.length - 1) {
        setUnseenIds(buildRound(category, next, unseenIds, false, true, false, collectionOverrides));
        setUnseenPosition(0);
      } else {
        setUnseenPosition((old) => old + 1);
      }
      setSession((old) => [...old, card.id]);
    } else if (mode === "special") {
      if (specialPosition >= specialIds.length - 1) {
        setSpecialIds(buildRound(category, next, specialIds, false, false, false, collectionOverrides, "special"));
        setSpecialPosition(0);
      } else setSpecialPosition((old) => old + 1);
      setSession((old) => [...old, card.id]);
    } else if (roundPosition >= roundIds.length - 1) {
      setRoundIds(buildRound(category, next, roundIds, false, false, false, collectionOverrides));
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
    setRoundIds(buildRound(category, {}, [], false, false, false, collectionOverrides));
    setRoundPosition(0);
    setPriorityIds(buildRound("すべて", {}, [], true, false, false, collectionOverrides));
    setPriorityPosition(0);
    setUnseenIds(buildRound("すべて", {}, [], false, true, false, collectionOverrides));
    setUnseenPosition(0);
    setLowQuizIds(buildLowQuizRound("すべて", {}, [], collectionOverrides));
    setLowQuizPosition(0);
    setSpecialIds(buildRound("すべて", {}, [], false, false, false, collectionOverrides, "special"));
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
      entries.forEach(([, value]) => JSON.parse(value));
      if (!window.confirm("現在の成績と問題の区分をバックアップの内容で上書きしますか？")) return;
      backupKeys.forEach((key) => localStorage.removeItem(key));
      entries.forEach(([key, value]) => localStorage.setItem(key, value));
      window.alert("成績と問題の区分を復元しました。画面を更新します。");
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
        setPriorityIds(buildRound("すべて", progress, priorityIds, true, false, false, collectionOverrides));
        setPriorityPosition(0);
      } else setPriorityPosition((old) => old + 1);
    } else if (mode === "weak") {
      if (weakPosition >= weakIds.length - 1) {
        setWeakIds(buildRound(category, progress, weakIds, false, false, true, collectionOverrides));
        setWeakPosition(0);
      } else setWeakPosition((old) => old + 1);
    } else if (mode === "unseen") {
      if (unseenPosition >= unseenIds.length - 1) {
        setUnseenIds(buildRound(category, progress, unseenIds, false, true, false, collectionOverrides));
        setUnseenPosition(0);
      } else setUnseenPosition((old) => old + 1);
    } else if (mode === "lowquiz") {
      if (lowQuizPosition >= lowQuizIds.length - 1) {
        setLowQuizIds(buildLowQuizRound(category, progress, lowQuizIds, collectionOverrides));
        setLowQuizPosition(0);
      } else setLowQuizPosition((old) => old + 1);
    } else if (mode === "special") {
      if (specialPosition >= specialIds.length - 1) {
        setSpecialIds(buildRound(category, progress, specialIds, false, false, false, collectionOverrides, "special"));
        setSpecialPosition(0);
      } else setSpecialPosition((old) => old + 1);
    } else if (roundPosition >= roundIds.length - 1) {
      setRoundIds(buildRound(category, progress, roundIds, false, false, false, collectionOverrides));
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
    setRoundIds(buildRound(category, progress, [], false, false, false, nextOverrides));
    setRoundPosition(0);
    setPriorityIds(buildRound("すべて", progress, [], true, false, false, nextOverrides));
    setPriorityPosition(0);
    setWeakIds(buildRound("すべて", progress, [], false, false, true, nextOverrides));
    setWeakPosition(0);
    setUnseenIds(buildRound(category, progress, [], false, true, false, nextOverrides));
    setUnseenPosition(0);
    setLowQuizIds(buildLowQuizRound(category, progress, [], nextOverrides));
    setLowQuizPosition(0);
    setSpecialIds(buildRound("すべて", progress, [], false, false, false, nextOverrides, "special"));
    setSpecialPosition(0);
    setSessionResults({ study: [], quiz: [], priority: [], weak: [], unseen: [], lowquiz: [], special: [] });
    setCompleted({ study: false, quiz: false, priority: false, weak: false, unseen: false, lowquiz: false, special: false });
  }

  function startNextSession(key: ModeKey) {
    if (key === "priority") {
      setPriorityIds(buildRound("すべて", progress, priorityIds, true, false, false, collectionOverrides));
      setPriorityPosition(0);
    } else if (key === "weak") {
      setWeakIds(buildRound(category, progress, weakIds, false, false, true, collectionOverrides));
      setWeakPosition(0);
    } else if (key === "unseen") {
      setUnseenIds(buildRound(category, progress, unseenIds, false, true, false, collectionOverrides));
      setUnseenPosition(0);
    } else if (key === "lowquiz") {
      setLowQuizIds(buildLowQuizRound(category, progress, lowQuizIds, collectionOverrides));
      setLowQuizPosition(0);
    } else if (key === "special") {
      setSpecialIds(buildRound(category, progress, specialIds, false, false, false, collectionOverrides, "special"));
      setSpecialPosition(0);
    } else {
      setRoundIds(buildRound(category, progress, roundIds, false, false, false, collectionOverrides));
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
          <button className={mode === "priority" ? "active" : ""} onClick={() => { setMode("priority"); setPriorityIds(buildRound("すべて", progress, priorityIds, true, false, false, collectionOverrides)); setPriorityPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>最優先だけ <span className="navCount">{priorityCount}</span></button>
          <button className={mode === "weak" ? "active" : ""} onClick={() => { setMode("weak"); setCategory("すべて"); setWeakIds(buildRound("すべて", progress, weakIds, false, false, true, collectionOverrides)); setWeakPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>苦手だけ <span className="navCount">{weakCount}</span></button>
          <button className={mode === "unseen" ? "active" : ""} onClick={() => { setMode("unseen"); setUnseenIds(buildRound(category, progress, unseenIds, false, true, false, collectionOverrides)); setUnseenPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>未出題だけ <span className="navCount">{unseenCount}</span></button>
          <button className={mode === "lowquiz" ? "active" : ""} onClick={() => { setMode("lowquiz"); setLowQuizIds(buildLowQuizRound(category, progress, lowQuizIds, collectionOverrides)); setLowQuizPosition(0); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>出題少なめ</button>
          <button className={mode === "special" ? "active" : ""} onClick={() => { setMode("special"); setCategory("すべて"); setSpecialIds(buildRound("すべて", progress, specialIds, false, false, false, collectionOverrides, "special")); setSpecialPosition(0); setSessionResults((old) => ({ ...old, special: [] })); setCompleted((old) => ({ ...old, special: false })); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); }}>特別問題 <span className="navCount">{specialCount}</span></button>
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
          <div><strong>{regularTerms.length}<small>語</small></strong><span>通常問題数</span></div>
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
              <button key={name} className={category === name ? "selected" : ""} onClick={() => { setCategory(name); if (mode === "weak") { setWeakIds(buildRound(name, progress, weakIds, false, false, true, collectionOverrides)); setWeakPosition(0); } else if (mode === "unseen") { setUnseenIds(buildRound(name, progress, unseenIds, false, true, false, collectionOverrides)); setUnseenPosition(0); } else if (mode === "lowquiz") { setLowQuizIds(buildLowQuizRound(name, progress, lowQuizIds, collectionOverrides)); setLowQuizPosition(0); } else if (mode === "special") { setSpecialIds(buildRound(name, progress, specialIds, false, false, false, collectionOverrides, "special")); setSpecialPosition(0); } else { setRoundIds(buildRound(name, progress, [], false, false, false, collectionOverrides)); setRoundPosition(0); } setSession([]); setRevealed(false); setQuizChoice(null); setQuizResult(null); setQuizUnsure(false); setQuizConfident(false); if (currentModeKey) { setSessionResults((old) => ({ ...old, [currentModeKey]: [] })); setCompleted((old) => ({ ...old, [currentModeKey]: false })); } }}>{name}</button>
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
                <p>言えた {cardRecord?.correct ?? 0}回　間違い {cardRecord?.wrong ?? 0}回　定着度だけで苦手・定着を判定</p>
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
                <p>正解 {cardRecord?.correct ?? 0}回　間違い {cardRecord?.wrong ?? 0}回　定着度だけで苦手・定着を判定</p>
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
                <strong>全 {terms.length} 語</strong><span>通常 {regularTerms.length} 語・特別 {specialCount} 語</span><span>現在の表示 {filtered.length} 語</span>
                <div className="backupActions">
                  <button className="backupButton" onClick={downloadBackup}>成績・区分をバックアップ</button>
                  <label className="restoreButton">成績・区分を復元<input className="visuallyHidden" type="file" accept="application/json,.json" onChange={restoreBackup} /></label>
                  <button className="reset" onClick={resetProgress}>学習記録をリセット</button>
                </div>
              </div>
            </div>
            <div className="collectionFilters" role="group" aria-label="問題の区分で絞り込む">
              <button className={collectionFilter === "all" ? "selected" : ""} onClick={() => setCollectionFilter("all")}>すべて</button>
              <button className={collectionFilter === "regular" ? "selected" : ""} onClick={() => setCollectionFilter("regular")}>通常問題 {regularTerms.length}</button>
              <button className={collectionFilter === "special" ? "selected" : ""} onClick={() => setCollectionFilter("special")}>特別問題 {specialCount}</button>
            </div>
            <div className="termTable">
              <div className="tableHeader"><span>優先度</span><span>用語</span><span>覚えるポイント</span><button className="retentionSort" onClick={() => setSortOrder((old) => old === "retention-asc" ? "retention-desc" : "retention-asc")} aria-label={`定着度を${sortOrder === "retention-asc" ? "高い順" : "低い順"}に並べ替える`}>定着度 <b>{sortOrder === "retention-asc" ? "↑" : sortOrder === "retention-desc" ? "↓" : "↕"}</b></button></div>
              {filtered.map((item) => {
                const itemProgress = progress[item.id];
                const itemStatus = getRetentionStatus(getRetention(item, progress));
                const itemCollection = getCollection(item, collectionOverrides);
                const openItem = () => {
                  const nextRound = [item.id, ...buildRound(item.category, progress, [item.id], false, false, false, collectionOverrides, itemCollection).filter((id) => id !== item.id)].slice(0, 5);
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
                return <div className="termRow" key={item.id} role="button" tabIndex={0} onClick={openItem} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openItem(); }}>
                  <span><b className={`priority ${itemStatus.className}`}>{itemStatus.label}</b></span>
                  <span className="termName"><small>{item.category}</small>{item.term}<button type="button" className={`collectionToggle ${itemCollection}`} onClick={(event) => { event.stopPropagation(); toggleCollection(item); }} onKeyDown={(event) => event.stopPropagation()} aria-label={`${item.term}を${itemCollection === "special" ? "通常問題に戻す" : "特別問題に移す"}`}>{itemCollection === "special" ? "特別問題 → 通常に戻す" : "通常問題 → 特別に移す"}</button></span>
                  <span className="termAnswer">{item.answer}</span>
                  <span className="record retentionEdit" onClick={(event) => event.stopPropagation()}>
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
            <strong>{mode === "special" ? "この分野に特別問題はありません。" : mode === "weak" ? "この分野に苦手問題はありません。" : mode === "unseen" ? "この分野の未出題問題はありません。" : "この分野に通常問題はありません。"}</strong>
            <p>{mode === "special" ? "用語一覧から問題ごとに特別問題へ移せます。" : mode === "weak" ? "定着度60未満の問題が対象です。" : "別の分野を選ぶか、用語一覧で区分を変更できます。"}</p>
            <button onClick={() => setMode(mode === "special" ? "list" : "study")}>{mode === "special" ? "用語一覧へ" : "用語チェックへ"}</button>
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
