function loadData() {
  const url = 'https://bsky.social/xrpc/com.atproto.server.createSession';

  const data = {
    'identifier': 'xxxx.bsky.social', // アカウント名
    'password': 'xxxx' // パスワード
  };

  const options = {
    'method': 'post',
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    'payload': JSON.stringify(data),
  };

  const response = UrlFetchApp.fetch(url, options);
  console.log(response);
  return JSON.parse(response.getContentText());
}


function getUrlInfo(url) {
  const content = UrlFetchApp.fetch(url).getContentText();
  const $ = Cheerio.load(content);

  const imageUrl = $('meta[property="og:image"]').attr('content');
  const title = $('title').text();
  const description = $('meta[name="description"]').attr('content');

  return {
    'title': title,
    'description': description,
    'imageUrl': imageUrl
  }
}


function uploadImage(imageUlr) {
  const loadedData = loadData();
  const accessJwt = loadedData.accessJwt;

  const blob = UrlFetchApp.fetch(imageUlr).getBlob();

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': `Bearer ${accessJwt}`
    },
    'payload': blob,
  };

  const url = 'https://bsky.social/xrpc/com.atproto.repo.uploadBlob';

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}


function createThumb(imageUrl) {
  const imageData = uploadImage(imageUrl);
  return imageData.blob;
}


function createRecord(text, url, title, description, thumb) {
  const record = {
    'text': text,
    'createdAt': (new Date()).toISOString(),
    // 'embed': {
    //   '$type': 'app.bsky.embed.external',
    //   'external': {
    //     'uri': url,
    //     'title': title,
    //     'description': description,
    //     'thumb': thumb
    //   }
    // }
  }

  return record;
}


function post(record) {
  const loadedData = loadData();
  const accessJwt = loadedData.accessJwt;
  const did = loadedData.did;

  const url = 'https://bsky.social/xrpc/com.atproto.repo.createRecord';

  const data = {
    'repo': did,
    'collection': 'app.bsky.feed.post',
    'record': record
  };

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': `Bearer ${accessJwt}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    'payload': JSON.stringify(data),
  };

  const response = UrlFetchApp.fetch(url, options);
  return responseJSON = JSON.parse(response.getContentText());
}


function extractUrl(text) {
  // 正規表現
  let urlPattern = /https?:\/\/[^\s]+/g;
  let urls = text.match(urlPattern);

  // 検出した URL をログに出力
  if (urls) {
    urls.forEach(function(url) {
      Logger.log(url);
    });
    return urls; // URL のリストを返す
  } else {
    Logger.log("URL not found.");
    return ""; 
  }
}


function main() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // C列のデータを取得する
  let columnC = sheet.getRange(1, 3, sheet.getLastRow(), 1).getValues();
  
  // C列の各セルの値をコンソールにログ出力する
  columnC.forEach(function(row) {
    let text = row[0];
    let urls = extractUrl(text);
    let url = "";
    console.log(text);

    if (urls) {
      //const urlInfo = getUrlInfo(urls[0]);
      //const thumb = createThumb(urlInfo.imageUrl);
      url = urls[0];
    }

    // const record = createRecord(text, url, urlInfo.title, urlInfo.description, thumb)
    const record = createRecord(text, url, '', '', '');
    post(record);
  });

  sheet.deleteRows(1, sheet.getLastRow());
}
