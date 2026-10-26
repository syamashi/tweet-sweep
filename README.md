# Tweet Sweep — Delete Tweets for X

Free, open-source Chrome extension to bulk delete tweets, posts and replies, and undo reposts on X (Twitter). English / 日本語. No developer API key required.

[Download latest ZIP](https://github.com/syamashi/tweet-sweep/releases/latest) · [Privacy](PRIVACY.md) · [Support development](https://github.com/sponsors/syamashi?frequency=one-time)

If Tweet Sweep helped you, please consider [supporting development and maintenance](https://github.com/sponsors/syamashi?frequency=one-time).

## Follow (experimental)

Open your own profile or one of your posts, then choose **Follow** in the panel. Set the interval (default 60 seconds), check the acknowledgment and start. A dedicated X tab collects your loaded posts, scans their liker lists and begins following as soon as people are found. Between follows it scans more posts; the interval applies to follows, not each post scan. Existing follows and requests are skipped. The queue stays in extension local storage; use **Start / resume** after stopping, or **New queue** to scan again. Keep the dedicated tab open. Restrictions, verification prompts and ambiguous results stop the job; intervals do not guarantee avoiding limits or compliance with X rules. Automated proactive following is prohibited by [X's rules](https://help.x.com/en/rules-and-policies/x-rules-and-best-practices). This feature has fixture tests only, and has not been verified on live X.

## Install

1. Download the release ZIP and extract it.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select the extracted folder containing `manifest.json`.
4. Open your own X profile and click the extension icon. The default profile opens **All** (`/all`). Explicit Replies / Media tabs are preserved.

No Node.js or Chrome Web Store developer registration needed. Keep the extracted folder in place. Reload the extension and X tab after updating.

## Use

1. Confirm the displayed account and item types. **∞ All** is the default; uncheck it to enter a count. Use X's **Replies** tab to include replies.
2. Check the acknowledgment, then click **Delete**. There is no preview or second confirmation. Deletion is permanent.
3. Confirmed counts accumulate across restarts in the same tab; a specified count applies to each run. Reloading clears the in-memory totals. Each post is read, recorded and deleted sequentially before moving to the next. **Stop** stops further operations.
4. **Save JSON** exports only the original post date and text, after completion, stop or error. Saving is disabled while processing. Export before closing or reloading the tab: records include attempted items even if deletion was not confirmed and are held in memory, not automatically written to disk. Media files are not included.

## Limits

- Response timeouts hold the current item as unconfirmed and continue with the next item. The same item is not clicked again in that run. Repeated failures trigger increasing waits (up to two minutes). Blocked menus/dialogs pause processing until cleared. Account changes, navigation, explicit Stop and unrecognized destructive dialogs still stop the run. Unconfirmed items remain on X if deletion failed; review them on a later run. JSON remains a simple date/text memo, not a deletion audit.

- Processes only history X actually loads. All mode is not a guarantee of removing the entire account history.
- Keep X visible for reliable operation. Chrome can throttle or suspend hidden tabs. The extension does not deliberately stop on visibility changes.
- Navigation within the X tab, account changes, errors and the Stop button stop processing. Results are verified from the page, not an API.
- X prohibits non-API automation; account restrictions are possible. [X automation rules](https://help.x.com/en/rules-and-policies/x-automation).
- Prototype tested with simulated DOM fixtures. Live X end-to-end behavior has not been independently verified.
- Independent project; not affiliated with X or an official successor to Delete_Tweets.

## 日本語

X（旧Twitter）のツイート・ポスト・返信を一括削除する個人用Chrome拡張です。リポスト解除、全件・件数指定、停止、日英切り替えに対応します。

気に入ったら、[開発・保守へのご支援](https://github.com/sponsors/syamashi?frequency=one-time)をお願いします。

### フォロー（試験版）

自分のプロフィールか投稿を開き、パネルの「フォロー」→同意チェック→「開始・再開」。専用タブで取得できた人から設定間隔（初期60秒）でフォローします。待ち時間には次の投稿を調べます。投稿の調査ごとに設定間隔を空けることはありません。フォロー・申請済みは飛ばします。リストは保存され、停止後も再開できます。「新しいリスト」で再取得します。専用タブは開いたままにしてください。制限・認証・結果不明時は停止します。時間を空けてもXの規約に適合するわけではありません。全員の取得・動作は保証できず、実際のXでは未検証です。

### 導入

1. ReleasesのZIPを展開します。
2. Chromeで `chrome://extensions` →「デベロッパーモード」→「パッケージ化されていない拡張機能を読み込む」。
3. `manifest.json` のあるフォルダを選択します。
4. Xで自分のプロフィールを開き、拡張アイコンを押します。通常のプロフィールでは「すべて」（`/all`）を標準で開きます。「返信」「メディア」の選択は維持します。

### 操作

- 同じタブでの再開は件数を累積表示します。件数指定は今回の実行分です。再読み込みで記録と累計は消えます。
- 全件が初期設定です。チェックを外すと件数を入力できます。返信も含める場合はXの「返信」タブを開きます。
- アカウントと対象を確認してチェックを入れ、「削除する」を押します。候補の事前読み込みや二段階の確認はありません。削除は取り消せません。
- 1件ずつ読み込み、削除前の投稿日時と本文を記録して削除します。JSONにはdateとtextだけを保存します。
- 「JSONを保存」は終了・停止・エラー後に使えます。処理中は無効です。削除を確認できなかった投稿も、読み取ったメモとして含まれます。記録はタブのメモリに保持します。ファイルへの自動追記ではないため、閉じる・再読み込みの前に保存してください。画像・動画原本は含みません。
- Xが表示できた範囲だけが対象です。非API自動化に関するXの規則と、アカウント制限のリスクをご確認ください。

## Development

`npm ci` then `npm test`. Tests use simulated DOM fixtures and do not delete real posts. Node.js is only needed for development. Source is MIT licensed. [Report issues](https://github.com/syamashi/tweet-sweep/issues).

Search terms: delete tweets, Twitter bulk delete, X post cleanup, ツイート一括削除、ポスト全削除。
