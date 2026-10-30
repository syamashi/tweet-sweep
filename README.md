# Tweet Sweep — Delete Tweets for X

Free, open-source Chrome extension to bulk delete tweets, posts and replies, and undo reposts on X (Twitter). English / 日本語. No developer API key required.

[Download latest ZIP](https://github.com/syamashi/tweet-sweep/releases/latest) · [Privacy](PRIVACY.md) · [Support development](https://github.com/sponsors/syamashi?frequency=one-time)

If Tweet Sweep helped you, please consider [supporting development and maintenance](https://github.com/sponsors/syamashi?frequency=one-time).

## Follow (experimental)

- **Collect**: open your own profile or post. Collects people who liked your loaded posts into the saved list, without clicking Follow. Existing entries and progress are preserved. Stop and resume collection, or run it again to append more people.
- **Follow saved list**: acknowledge the action and set an interval (default 60 seconds). Processes only the saved pending people. It does not collect more posts or restart discovery when the list is empty. Uses Likes-page Follow buttons where available; otherwise checks the profile. Following / pending requests are skipped.
- **Manage list → Export list / Import list**: portable JSON backup. Import merges without duplicates, preserves processed states and never starts a job. The backup must match the logged-in account.
- Lists survive closed tabs and Chrome restarts. To update, overwrite the **same extracted extension folder**, then reload the existing extension and X tab. Do not uninstall the extension or load a different folder if you want its existing storage. Export a backup before moving folders or profiles. Updates pause active jobs and keep all list entries.

Keep the dedicated X tab open while working. Restrictions and verification prompts stop the job. Missing or unrecognized follow buttons are skipped too. An unconfirmed follow stays on the waiting list and is skipped until the next manual start; other people continue at the configured interval. Collection covers only history X displays. Automated proactive following is prohibited by [X's rules](https://help.x.com/en/rules-and-policies/x-rules-and-best-practices); intervals do not guarantee compliance or avoiding limits. This feature has fixture tests only, not independent live-X verification.

## Install

1. Download the release ZIP and extract it.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select the extracted folder containing `manifest.json`.
4. Open your own X profile and click the extension icon. The default profile opens **All** (`/all`). Explicit Replies / Media tabs are preserved.

No Node.js or Chrome Web Store developer registration needed. Keep the extracted folder in place. Reload the extension and X tab after updating.

## Use

1. Confirm the displayed account and item types. **∞ All** is the default; uncheck it to enter a count. Use X's **Replies** tab to include replies.
2. Check the acknowledgment, then click **Delete**. There is no preview or second confirmation. Deletion is permanent.
3. Confirmed counts accumulate across restarts in the same tab; a specified count applies to each run. The same-tab checkpoint restores totals after reloading. Each post is read, recorded and deleted sequentially before moving to the next. **Stop** stops further operations.
4. **Save JSON** exports only the original post date and text, after completion, stop or error. Saving is disabled while processing. Export before closing the tab: records include attempted items even if deletion was not confirmed. A local checkpoint is saved before automatic refresh and when a run finishes or stops; no JSON file is written automatically. Media files are not included.

## Limits

- If a previously confirmed post reappears as a live row, it is rechecked rather than skipped solely because of the old record. Counts are corrected, not double-counted. Rechecking old IDs does not reset the no-progress refresh limit.

- Deletion continues near the current row instead of returning to the top after every item. Restarting in the same tab keeps the current position. If loading stalls, the extension saves a local checkpoint, reloads the same timeline and resumes only after verifying the same account and URL. Counts, remaining item limit, categories and JSON records carry over. After two refreshes without confirmed progress it stops. Stop, navigation, tab closure or a browser restart do not authorize auto-resume.

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

- **収集する**：自分のプロフィールか投稿で開始。いいねした人を保存します。フォローはしません。既存リストへ重複を除いて追記します。
- **リストからフォロー**：保存済みの待ちリストだけを設定間隔で処理します。新しい投稿の収集は行いません。Following・申請済みは押しません。
- **リスト管理 → リストを書き出す／読み込む**：JSONでバックアップ・復元できます。読み込みは重複を除いて追加し、処理済みの状態を維持します。読み込んでも自動開始しません。同じアカウント用のリストのみ使用できます。
- タブやChromeを閉じてもリストは残ります。更新は**今読み込んでいる同じフォルダに上書きし、既存の拡張を再読み込み**してください。拡張の削除・別フォルダでの新規読み込みでは保存先が変わります。別フォルダや別Chromeプロフィールに移す前にJSONを書き出してください。更新時は実行中の処理だけを止め、リストは保持します。

収集できるのはXが表示した範囲です。処理中は専用タブを開いたままにしてください。制限・認証時は停止します。アカウント不存在・ボタン未検出も保留して続行します。フォロー結果が未確認の人は待ちリストに残して次へ進み、次回の手動開始で再確認します。

### 導入

1. ReleasesのZIPを展開します。
2. Chromeで `chrome://extensions` →「デベロッパーモード」→「パッケージ化されていない拡張機能を読み込む」。
3. `manifest.json` のあるフォルダを選択します。
4. Xで自分のプロフィールを開き、拡張アイコンを押します。通常のプロフィールでは「すべて」（`/all`）を標準で開きます。「返信」「メディア」の選択は維持します。

### 操作

- 削除確認済みでも再び表示された投稿は再確認します。過去の記録だけで除外せず、重複カウントもしません。

- 削除ごとに先頭へ戻らず、今の位置から続けます。同じタブでの再開も今の位置から。読み込みが止まると記録を保存し、同じ一覧を再読み込みして自動再開します。アカウント・URLを確認し、累計・残り件数・対象設定・JSON記録を引き継ぎます。進展なしの再読み込みは2回で停止します。停止・ページ移動・タブ終了・Chrome再起動では勝手に再開しません。

- 同じタブでの再開は件数を累積表示します。件数指定は今回の実行分です。同じタブの保存記録から累計を復元します。
- 全件が初期設定です。チェックを外すと件数を入力できます。返信も含める場合はXの「返信」タブを開きます。
- アカウントと対象を確認してチェックを入れ、「削除する」を押します。候補の事前読み込みや二段階の確認はありません。削除は取り消せません。
- 1件ずつ読み込み、削除前の投稿日時と本文を記録して削除します。JSONにはdateとtextだけを保存します。
- 「JSONを保存」は終了・停止・エラー後に使えます。処理中は無効です。削除を確認できなかった投稿も、読み取ったメモとして含まれます。再読み込み前と終了・停止時に、記録を拡張内へ自動保存します。JSONファイルへの自動追記ではありません。タブを閉じる前に書き出してください。画像・動画原本は含みません。
- Xが表示できた範囲だけが対象です。非API自動化に関するXの規則と、アカウント制限のリスクをご確認ください。

## Development

`npm ci` then `npm test`. Tests use simulated DOM fixtures and do not delete real posts. Node.js is only needed for development. Source is MIT licensed. [Report issues](https://github.com/syamashi/tweet-sweep/issues).

Search terms: delete tweets, Twitter bulk delete, X post cleanup, ツイート一括削除、ポスト全削除。
