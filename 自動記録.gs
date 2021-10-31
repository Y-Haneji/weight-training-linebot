//postリクエストを受取ったときに発火する関数
function doPost(e) {

  // 応答用Tokenを取得
  var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
  // メッセージを取得
  var userMessage = JSON.parse(e.postData.contents).events[0].message.text;

  //メッセージを改行ごとに分割
  var all_msg = userMessage.split("\n");
  var msg_num = all_msg.length-1;

  // ***************************
  // スプレットシートからデータを抽出
  // ***************************
  // 1. 今開いている（紐付いている）スプレッドシートを定義
  var sheet     = SpreadsheetApp.getActiveSpreadsheet();
  // 2. ここでは、デフォルトの「シート1」の名前が書かれているシートを呼び出し
  var listSheet = sheet.getSheetByName("シート1");
  // 3. 最終列の列番号を取得
  let numColumn = listSheet.getLastColumn();
  // 4. 最終行の行番号を取得
  let numRow    = listSheet.getLastRow()-1;
  // 5. 範囲を指定（上、左、下、右）
  let topRange  = listSheet.getRange(1, 1, 1, numColumn);      // 一番上のオレンジ色の部分の範囲を指定
  let dataRange = listSheet.getRange(2, 1, numRow, numColumn); // データの部分の範囲を指定
  // 6. 値を取得
  let topData   = topRange.getValues();  // 一番上のオレンジ色の部分の範囲の値を取得
  let data      = dataRange.getValues(); // データの部分の範囲の値を取得
  let dataNum; // 新しくデータを入れたいセルの行の番号を取得
  if (numRow === 0) {
    dataNum = 2;       
  } else {
    dataNum = data.length +2;
  }
  // 7. 集計グラフのシートのurlを取得
  var graph = sheet.getUrl() + '#gid=' + String(sheet.getSheetByName("グラフ1").getSheetId());

  if (all_msg[0] == '完了') {
    // ***************************
    // スプレッドシートにデータを入力
    // ***************************
    var currentTime = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
    listSheet.getRange(dataNum, 1).setValue(currentTime);
    listSheet.getRange(dataNum, 2).setValue(all_msg[1]);
    // 最終列の番号まで、順番にスプレッドシートの左からデータを新しく入力
    for (let i = 2; i <= msg_num; i=i+2) { //各トレーニングを入力していく
      let exist = false;
      for (let j=0; j< topData[0].length; j++) {
        if(topData[0][j] == all_msg[i]) { //既存のトレーニング種目の場合
          exist = true;
          listSheet.getRange(dataNum, j+1).setValue(all_msg[i+1]);
        }
      }
      if (exist === false) { //新規のトレーニング種目の場合
        listSheet.getRange(1, numColumn+1).setValue(all_msg[i]);
        listSheet.getRange(dataNum, numColumn+1).setValue(all_msg[i+1]);
        //列が増えることによる変数の更新
        numColumn = listSheet.getLastColumn();
        topRange  = listSheet.getRange(1, 1, 1, numColumn);      // 一番上のオレンジ色の部分の範囲を指定
        dataRange = listSheet.getRange(2, 1, numRow, numColumn); // データの部分の範囲を指定
        topData   = topRange.getValues();  // 一番上のオレンジ色の部分の範囲の値を取得
        data      = dataRange.getValues(); // データの部分の範囲の値を取得
      }        
    }
    
    //lineで返答する
    UrlFetchApp.fetch(LINE_REPLY_URL, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + LINE_TOKEN,
      },
      'method': 'post',
      'payload': JSON.stringify({
        'replyToken': replyToken,
        'messages': [{
          'type': 'text',
          'text': '入力しました\n集計はコチラ\n' + graph,
        }],
      }),
    });
    return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
  }
}