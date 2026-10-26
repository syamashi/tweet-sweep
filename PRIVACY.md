# Privacy / プライバシー

Tweet Sweep runs in the X tab you activate using the extension button. It reads visible post content, post links and your profile link to build candidates and check the target account. It operates X’s interface to delete posts or undo reposts. X’s own network requests occur as a result.

The extension does not independently send data to a developer server, collect analytics, read cookies, or ask for passwords or API keys. Post content and deletion results are held in memory and checkpointed in extension local storage before automatic refresh and at finish or stop. The checkpoint includes the account, exact timeline URL, remaining limit, categories, attempted IDs and cumulative records. It is scoped to the same tab and removed when that tab closes. A one-use resume token in session storage prevents auto-resuming after browser restart. If you export JSON, a file is saved on your computer. Your preferred language and follow job (account handle, source post URLs, queued handles, outcomes, interval and worker tab ID) are persisted in Chrome extension local storage. The follow feature reads X profiles and liker lists and clicks Follow on X. Use New queue to clear the follow job. Removing the extension removes local settings and jobs. No remote code is loaded.

Permissions: `activeTab` and `scripting` inject bundled code; `storage` saves preferences, deletion checkpoints and the follow queue; `alarms` schedules follow steps; access to `https://x.com/*` allows the dedicated follow tab to continue after navigation. No other website access is requested. GitHub handles visits, downloads and issues according to its own privacy policy. Avoid posting private exports in public issues.

Xの投稿・プロフィール・いいね一覧を読み取り、削除・フォロー操作を行います。独自の外部送信・分析・Cookie取得はありません。言語設定とフォロー待ちリスト（アカウント名・投稿URL・状態・実行間隔など）は拡張専用ストレージへ保存します。「新しいリスト」で待ちリストを消去できます。削除記録・投稿本文・再開設定も再読み込み前と終了・停止時にPC内の拡張専用ストレージへ保存し、同じタブで復元します。タブを閉じるとその保存記録を削除します。JSONファイルは任意で書き出します。操作によるX自身の通信は発生します。

Questions: https://github.com/syamashi/tweet-sweep/issues
