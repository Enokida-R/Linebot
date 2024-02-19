require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
//const ngrok = require('@ngrok/ngrok');

const app = express();

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});


app.get('/', (req, res) => {
    res.send('Hello World!');
  });

//イベントハンドラー関数
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        //テキストメッセージ以外は無視
        return Promise.resolve(null);
    }

    //ユーザーからのメッセージに対する応答
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text,
    });
}


//LINE SDK クライアントの作成
const client = new line.Client(config);

//サーバーの起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
