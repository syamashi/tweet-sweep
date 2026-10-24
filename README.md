# Tweet Sweep — Delete Tweets for X

Free, open-source Chrome extension to bulk delete tweets, posts and replies, and undo reposts on X (Twitter). English / 日本語. No developer API key required.

[Download latest ZIP](https://github.com/syamashi/tweet-sweep/releases/latest) · [Privacy](PRIVACY.md)

## Install

1. Download the release ZIP and extract it.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select the extracted folder containing `manifest.json`.
4. Open your own X profile and click the extension icon.

No Node.js or Chrome Web Store developer registration needed. Keep the extracted folder in place. Reload the extension and X tab after updating.

## Use

1. Confirm the displayed account and item types. **∞ All** is the default; uncheck it to enter a count. Use X's **Replies** tab to include replies.
2. Check the acknowledgment, then click **Delete**. There is no preview or second confirmation. Deletion is permanent.
3. Each post is read, recorded and deleted sequentially before moving to the next. **Stop** stops further operations.
4. **Save JSON** exports the text, ID, URL, date and per-item results, after completion, stop or error. Saving is disabled while processing. Export before closing or reloading the tab: records are held in memory, not automatically written to disk. Media files are not included.

## Limits

- Processes only history X actually loads. All mode is not a guarantee of removing the entire account history.
- Keep X visible for reliable operation. Chrome can throttle or suspend hidden tabs. The extension does not deliberately stop on visibility changes.
- Navigation within the X tab, account changes, errors and the Stop button stop processing. Results are verified from the page, not an API.
- X prohibits non-API automation; account restrictions are possible. [X automation rules](https://help.x.com/en/rules-and-policies/x-automation).
- Prototype tested with simulated DOM fixtures. Live X end-to-end behavior has not been independently verified.
- Independent project; not affiliated with X or an official successor to Delete_Tweets.

## 日本語

X（旧Twitter）のツイート・ポスト・返信を一括削除する個人用Chrome拡張です。リポスト解除、全件・件数指定、停止、日英切り替えに対応します。

### 導入

1. ReleasesのZIPを展開します。
2. Chromeで `chrome://extensions` →「デベロッパーモード」→「パッケージ化されていない拡張機能を読み込む」。
3. `manifest.json` のあるフォルダを選択します。
4. Xで自分のプロフィールを開き、拡張アイコンを押します。

### 操作

- 全件が初期設定です。チェックを外すと件数を入力できます。返信も含める場合はXの「返信」タブを開きます。
- アカウントと対象を確認してチェックを入れ、「削除する」を押します。候補の事前読み込みや二段階の確認はありません。削除は取り消せません。
- 1件ずつ読み込み、削除前の本文・ID・URL・日時を記録して削除します。その都度、結果を追加します。
- 「JSONを保存」は終了・停止・エラー後に使えます。処理中は無効です。記録はタブのメモリに保持します。ファイルへの自動追記ではないため、閉じる・再読み込みの前に保存してください。画像・動画原本は含みません。
- Xが表示できた範囲だけが対象です。非API自動化に関するXの規則と、アカウント制限のリスクをご確認ください。

## Development

`npm ci` then `npm test`. Tests use simulated DOM fixtures and do not delete real posts. Node.js is only needed for development. Source is MIT licensed. [Report issues](https://github.com/syamashi/tweet-sweep/issues).

Search terms: delete tweets, Twitter bulk delete, X post cleanup, ツイート一括削除、ポスト全削除。
