XでポストしたらBlueskyにクロスポストするやつ

- IFTTT: https://ifttt.com/applets/pBZAL7R4-if-new-tweet-by-satory074-then-add-row-to-satory074-gmail-com-s-google-drive-spreadsheet

```mermaid
graph LR
  User[User] -- post --> X
  X -- IFTTT --> GSS[Google Spreadsheets]
  GSS -- This program --> bsky[Bluesky]
```
