# Tweet Sweep — Delete Tweets for X

**A free, open-source Chrome extension to bulk delete tweets, posts and replies, and undo reposts on X (Twitter).** No developer API key required. Preview candidates, choose a count or ∞ mode, stop at any time, and optionally export JSON. Includes **English / 日本語**, selected automatically and switchable in the panel.

[Download v0.4.0](https://github.com/syamashi/tweet-sweep/releases/latest) · [日本語の導入手順](#インストール) · [Privacy](PRIVACY.md)

## Install in Chrome

1. Download `tweet-sweep-v0.4.0.zip` from Releases and extract it.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked**, then select the extracted folder containing `manifest.json`.
4. Open your own profile on `https://x.com` and click the Tweet Sweep extension icon.
5. Start with **1 disposable post** and manual confirmation enabled. Use the **Replies** tab to include replies.

No Node.js installation or Chrome Web Store developer registration is needed to use this unpacked extension. Keep the extracted folder in place. After updates, reload the extension and the X tab.

## Features and limits

- Start directly: the extension reads and deletes progressively. Preloading candidates is optional. The initial confirmation covers the selected account, item types and count (or all loaded history).
- Each item's text, ID, link and timestamp are captured before deletion. JSON results are updated through pending, deleted or unconfirmed states. You can export a snapshot while processing. Data is held in tab memory, not automatically appended to a disk file; export before closing/reloading. Images and video files are not included.

- Bulk delete your own posts, replies and quotes; undo identifiable reposts.
- ∞ mode removes the tool’s item cap; it only covers history X actually loads. It does **not** guarantee deletion of your entire account history.
- Saving candidates and results is optional. Account confirmation is required before execution.
- Japanese and English panel; language preference is stored locally in extension storage. This is independent of X’s display language.
- No independent network requests, analytics, API keys, password collection or backend server.
- Prototype: DOM fixture tests pass; live X end-to-end behavior has not been independently verified. X layout changes can stop the tool.
- X prohibits non-API automation; using this tool may risk account restrictions. See [X automation rules](https://help.x.com/en/rules-and-policies/x-automation). Distribution via GitHub does not remove this issue.

Searching for “delete tweets”, “Twitter bulk delete”, or an alternative to older Delete_Tweets tools? Tweet Sweep is an independent project, not an official successor or affiliated product. Not affiliated with X.

## Development

Run `npm ci` and `npm test` (Node.js required for development only). Tests use simulated DOM fixtures and never delete real posts. Licensed under MIT. Bug reports: [GitHub Issues](https://github.com/syamashi/tweet-sweep/issues).

## 日本語

## v0.4.0 の変更

- 全件の事前読み込みを廃止。「削除する」から、読み込みと削除を順番に繰り返します。「候補を見る」は任意のプレビューです。
- 最初の確認で、対象アカウント・投稿の種類・件数または全件を指定します。確認した範囲内で、後から読み込んだ投稿も順次処理します。
- 投稿の本文・ID・URL・日時を削除前に記録し、処理結果を逐次更新します。「投稿JSONを保存」は実行中でも利用できます。
- JSONはタブのメモリに蓄積します。PCのファイルへ自動追記する方式ではありません。再読み込み・タブを閉じる前に保存してください。画像・動画の原本は含みません。
- 読み込みが止まると待機・再スクロールを2回試します。Xが表示しない履歴の取得は保証しません。

X（旧Twitter）のツイート・ポスト・返信を一括削除する個人用Chrome拡張。リポスト解除、全件削除（∞）、件数指定、開始・停止に対応。APIキー不要、バックアップ保存は任意です。

## v0.3.4 の変更

- 全件を初期設定にし、解除した場合だけ件数を入力できます。パネルの説明を短縮しました。

## v0.3.1 の変更

- 一括削除時の確認も自動操作する設定を標準にしました。毎回の手動確認は、希望する場合だけチェックを付けて使います。開始前の対象アカウント確認は残ります。

## v0.3.0 の変更

- パネル右上に日本語 / English切り替えを追加。Chromeの言語を初期値とし、選択をローカルに保存します。投稿本文は翻訳しません。

### v0.2.0

- 「∞ 全件を対象にする」を追加。件数の500件上限、収集の60回スクロール上限、投稿再表示の65回上限を廃止しました。件数指定の場合も500件を超える整数を指定できます。
- 全件モードでは、画面上の投稿とスクロール位置に変化がない状態が12回続くまで候補を収集します。Xが途中で読み込みを止める可能性があるため、全履歴取得の保証ではありません。
- v0.2.0では読み込んだ候補だけを処理していました。v0.4.0以降は、開始時に確認した対象範囲で順次読み込み・削除します。返信を含める場合はプロフィールの「返信」タブを使ってください。
- JSON保存は完全に任意です。保存なしで最終確認・実行できます。削除の不可逆性とアカウントの確認は残しています。
- 表示名を Post Clear から **Tweet Sweep — Delete Tweets for X** に変更しました。同じフォルダから更新できます。

「delete tweets」「ツイート 一括削除」「X ポスト 全削除」など、利用者が探す言葉を名称・説明に自然に含めています。Delete_Tweets などの旧ツールの代替を探している方に向けた独立した作品であり、旧ツールの公式後継・提携品ではありません。検索順位や名称の独占利用可能性を保証するものではありません。

ログイン済みのXプロフィール画面で、投稿の「… → 削除 → 確認」を操作する個人用ツールです。リポストは取り消しとして処理します。開発者向けX API、APIキー、外部サーバーへの送信、課金機能はありません。

**試作版です。実際のXアカウントでは動作未検証です。最初は不要な投稿1件で、1件ごとの手動確認を有効にして試してください。削除は元に戻せません。**

## インストール

1. 配布ZIPを右クリックして「すべて展開」します。既にソースフォルダがある場合は展開不要です。
2. Chromeのアドレスバーに `chrome://extensions` と入力します。
3. 右上の「デベロッパーモード」をオンにします。
4. 「パッケージ化されていない拡張機能を読み込む」を押します。
5. **manifest.jsonが入っているフォルダ**を選択します（ZIPそのものは選びません）。
6. ツールバーのパズルアイコンから「Tweet Sweep」をピン留めします。

拡張のインストールにNode.jsやnpmは不要です。フォルダは導入後も削除・移動しないでください。更新時はファイルを更新し、拡張管理画面の再読み込みボタンを押し、Xのページも再読み込みします。

## 使い方

1. `https://x.com` にログインし、左メニューの「プロフィール」を開きます。ホーム画面や他人のプロフィールでは実行できません。
2. **返信も整理したい場合はプロフィールの「返信」タブを開いてください。** 投稿タブだけでは返信を網羅できません。メディアタブでも実行できます。
3. 拡張アイコンを押して右側のパネルを開きます。他の自動削除拡張は停止してください。
4. 最初は最大件数を **1** に設定してください。全件を対象にする場合は「∞ 全件を対象にする」を選びます。1日50件などの製品側の回数制限はありません。
5. 対象の種類とアカウントを確認します。「候補を見る」は任意です。全件を先に読み込む必要はありません。
6. 内容確認のチェックを付け、「削除する」を押します。保存していなくても進めます。
7. 開始後は投稿の読み込み・記録・削除を順次繰り返します。「投稿JSONを保存」で、それまでの投稿と処理結果を保存できます。画像や動画の原本は含みません。
8. 表示された `DELETE @ユーザー名` を入力します。初期設定では **削除の確認も自動で押す** 方式です。手動確認を希望する場合はチェックを付けてください。候補一式の削除確定も自動で行う場合は、そのチェックを外してから「開始」を押します。
9. 手動方式ではXの確認画面で「削除」または「リポストを取り消す」を押してください。キャンセル・2分の待機・画面不一致では停止します。
10. 終了後の「結果を保存」も任意です。残りは再度「候補を読み込む」から実行します。

タブ切り替え・最小化では停止しません。Chrome側の制御で処理が遅くなる場合があります。Xタブ内のページ移動・再読み込み、アカウント変更、画面を識別できない場合は停止します。「停止」は次の操作を止めます。すでにXへ送信された削除は取り消せません。停止後にXの確認画面が残っていたら、キャンセルして閉じてください。

パネルがXの確認画面に重なる場合は、ヘッダーの「−」で折りたたんでください。「＋」で戻せます。拡張アイコンでもパネルの表示・非表示を切り替えられます。

処理済みは画面上の対象消失・リポスト解除で判定します。通信成功をAPIで確認する機能はなく、一覧再描画などで判定がずれる可能性もあります。処理後はX上でも確認してください。不明な結果を無条件で再実行しません。次回の対象読み込みで残っているものを確認してください。

## 制限と規則

- 日本語・英語の画面にある既知のメニュー項目とXのdata-testidを使います。Xの画面変更、別言語、ダイアログ形式の違いでは停止する場合があります。
- リポストは「自分のリポスト」という表示と解除ボタンを両方識別できたものだけ対象です。識別できないものは候補に入りません。
- Xで表示・収集できた範囲が対象です。「∞ 全件」は製品の件数上限をなくす設定であり、X側で表示できない履歴の取得を保証するものではありません。件数指定も目標上限であり、保証件数ではありません。
- Xの速度制限やアクセス制限を回避しません。制限が表示された場合は停止し、手動で状態を確認してください。
- Xは非API方式の自動操作を禁止しています。個人用・無料・任意の寄付制でも規則上の問題は残ります。アカウント制限の可能性を理解して利用してください。
- 公式規則: https://help.x.com/en/rules-and-policies/x-automation

## プライバシー

権限は `activeTab`、`scripting`、`storage` です。storageは言語設定の保存だけに使います。ツールバーのアイコンを押したx.comのタブへコードを注入します。全サイトへの常時アクセス、Cookieの読み取り、パスワード/APIキー入力、テレメトリ、独自のネットワーク通信はありません。対象投稿と実行結果はそのタブのメモリだけに保持します。ページを再読み込みすると消えます。ユーザーが保存したJSONファイルはPCに残ります。削除ボタンの押下に伴うX自身の通信は発生します。

## 公開・任意の支援

GitHubのPublicリポジトリでソースを公開し、配布ZIPはReleasesに掲載します。Chrome Web Storeには申請しません。インストール・使用は寄付の有無に依存しません。寄付先が決まるまでは寄付ボタンを設けていません。

## 開発とテスト

Node.jsで `npm ci`、`npm test`。jsdomを使うテスト専用の開発依存です。配布ZIPにnode_modulesを含めません。Chrome公式の拡張開発手順: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world

MIT License。Xの公式サービスではありません。
