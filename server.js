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

    //サイコロ関数
    function dice() {
        const dice = Math.floor(Math.random()*6)+1;
        return dice;
    }



    //歌詞検索の関数
    async function searchSong(lyrics){
        const accessToken = process.env.GENIUS_ACCESS_TOKEN;
        try {
            const responseS = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(lyrics)}`, {
                headers: { 'Authorization': `Bearer ${accessToken}`}
            });

            return responseS.data.response.hits.map(hit => ({
                title: hit.result.title,
                artist: hit.result.primary_artist.name,
                url: hit.result.url
            })).slice(0, 5);//最大5個の結果を出す
        } catch (error) {
            console.error('Error', error);
            return [];
        }
    }

    
    //ユーザーからのメッセージに対する応答
    if (event.message.text === 'イッヌ') {
            try {
                let columns = [];
                for (let i = 0; i < 6; i++){
                    const responseD = await axios.get('https://dog.ceo/api/breeds/image/random/');
                    const imageUrlD = responseD.data.message; //APIからのレスポンスから画像のUrl

                    const column = {
                        thumbnailImageUrl: imageUrlD,
                        imageBackgroundColor: "#FFFFFF",
                        title: 'わんわん',
                        text: 'イッヌたちです',
                        actions: [
                            {
                                type: "uri",
                                label: "画像を見る",
                                uri: imageUrlD
                            }
                        ]
                    };
                    columns.push(column);


                    /*return client.replyMessage(event.replyToken, {
                        type: 'image',
                        originalContentUrl: imageUrlD,
                        previewImageUrl: imageUrlD,
                    });*/

                    
                }
                
                if (columns.length > 0) {
                        return client.replyMessage(event.replyToken, {
                            type: "template",
                            altText: "イッヌの画像",
                            template: {
                                type: "carousel",
                                columns: columns
                            }
                        });
                    }
                
            } catch (error) {
                console.error(error);
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: 'エラーが発生しました。',
                });
            }
        } else if (event.message.text === 'ネコ') {
            try {
                const responseC = await axios.get('https://api.thecatapi.com/v1/images/search?limit=1');
                const imageUrlC =responseC.data[0].url;

                return client.replyMessage(event.replyToken, {
                    type: 'image',
                    originalContentUrl: imageUrlC,
                    previewImageUrl: imageUrlC,
                });
            } catch (error) {
                console.log(error);
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: 'エラーが発生しました。',
                });
            }
        } else if (event.message.text === 'サイコロ') {
            try {
                const diceImageUrls = [
                    'https://i.imgur.com/1uTWOlT.png',
                    'https://i.imgur.com/3EKPjss.png',
                    'https://i.imgur.com/1okJPPa.png',
                    'https://i.imgur.com/Sj1o7mA.png',
                    'https://i.imgur.com/qSMKlao.png',
                    'https://i.imgur.com/0AWQkIw.png',
                ];

                const diceImageUrl = diceImageUrls[ dice() - 1];

                return client.replyMessage(event.replyToken, {
                    type: 'image',
                    originalContentUrl: diceImageUrl,
                    previewImageUrl: diceImageUrl,
                });
                /*return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: dice,
                });*/
                

            } catch (error) {
                console.log(error);
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: 'エラーが発生しました。',
                });
            }
        } else if (event.message.text === 'ねこ') {
            try {
                const haruCatImgs = [
                    'https://i.imgur.com/ksjMY1N.jpg',
                    'https://i.imgur.com/PfB61Z7.jpg',
                    'https://i.imgur.com/m13lGgr.jpg',
                    'https://i.imgur.com/gczZzMz.jpg',
                    'https://i.imgur.com/jUmloeF.jpg',
                    'https://i.imgur.com/qHImYOP.jpg',
                ];
                const haruCatImg = haruCatImgs[ dice() - 1];
                
                return client.replyMessage(event.replyToken, {
                    type: 'image',
                    originalContentUrl: haruCatImg,
                    previewImageUrl: haruCatImg,
                });
            } catch (error) {
                console.log(error);
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: 'エラーが発生しました。',
                });
            }
        }else if (event.message.text.startsWith('歌詞')) {
            const lyrics = event.message.text.slice(2).trim();//'歌詞'を除いて
            const songInfo = await searchSong(lyrics);

            if (songInfo && songInfo.length > 0) {
                //検索がヒットした場合
                const messages = songInfo.slice(0, 5).map(song => ({
                    type: 'text',
                    text: `曲名: ${song.title}\nアーティスト: ${song.artist}\nUrl: ${song.url}`
                }));

                return client.replyMessage(event.replyToken, messages);
            } else {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '該当する曲が見つかりませんでした。'
            })
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
