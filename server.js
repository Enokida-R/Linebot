require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const axios = require ('axios');
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
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        //テキストメッセージ以外は無視
        return Promise.resolve(null);
    }

    //ユーザーからのメッセージに対する応答
    if (event.message.text === 'イッヌ') {
        try {
            const response = await axios.get('https://dog.ceo/api/breeds/image/random/');
            const imageUrl = response.message; //APIからのレスポンスから画像のUrl

            return client.replyMessage(event.replyToken, {
                type: 'image',
                originalContentUrl: imageUrl,
                previewImageUrl: imageUrl,
            });
        } catch (error) {
            console.error(error);
            return client.replyMessage(event.replyMessage, {
                type: 'text',
                text: 'エラーが発生しました。',
            });
        }
    } else {
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: event.message.text,
        });
    }




    
}


//LINE SDK クライアントの作成
const client = new line.Client(config);

//サーバーの起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
