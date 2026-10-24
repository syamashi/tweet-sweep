# Privacy / プライバシー

Tweet Sweep runs in the X tab you activate using the extension button. It reads visible post content, post links and your profile link to build candidates and check the target account. It operates X’s interface to delete posts or undo reposts. X’s own network requests occur as a result.

The extension does not independently send data to a developer server, collect analytics, read cookies, or ask for passwords or API keys. Candidate posts and results remain in tab memory until reload. If you export JSON, a file is saved on your computer. Only your preferred language (`ja` or `en`) is persisted in Chrome extension local storage. Removing the extension removes that setting. No remote code is loaded.

Permissions: `activeTab` and `scripting` inject bundled code after your click; `storage` saves your language preference. GitHub handles visits, downloads and issues according to its own privacy policy. Avoid posting private post exports in public issues.

Xの表示中の投稿・リンク・プロフィールを読み取り、候補と対象アカウントを確認します。独自の外部送信・分析・Cookie取得はありません。言語設定だけを拡張専用ストレージへ保存します。投稿と実行結果はタブのメモリ、任意で保存したJSONはPCに残ります。削除操作によるX自身の通信は発生します。

Questions: https://github.com/syamashi/tweet-sweep/issues
