var message = "新入部員の伊藤くん。よろしく！";

// LINEでPushメッセージを送る
function pushPost(){
  // 指定のグルチャにPOSTする
  UrlFetchApp.fetch(LINE_PUSH_URL, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + LINE_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': GROUP_ID,
      'messages':[{
        'type': 'text',
        'text': message,
      }]
     })
   })
}