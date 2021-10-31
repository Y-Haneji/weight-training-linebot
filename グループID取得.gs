// LINE Botにreplyさせるトリガーとなるキーワード
var keyword = "グループID";

// getID(e) を doPost(e) 内で実行すればグループIDを取得できる
function getID(e) {
  var contents = e.postData.contents;
  var obj = JSON.parse(contents);
  obj["events"].forEach(function(event) {
    if (event.type == "message") {
      // メッセージテキストが特定のキーワードだったらreplyを返す（それ以外での反応を抑制する）
      if (event.message.text == keyword) {    
        var post_data = {
          "replyToken": event.replyToken,
          "messages": [
            {
              "type": "text",
              "text": event.source.groupId
            }
          ]
        };
        var options = {
          "method": "POST",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + LINE_TOKEN
          },
          "payload": JSON.stringify(post_data),
          "muteHttpExceptions": true
        };
        UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);
      }
    }
  })
}