var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function (req, res, next) {
    var text = fs.readFileSync('please-edit-me.txt', 'utf8');
    var articleArray = text.split(/\n+/);
    var articles = [];
    var lineCount = 0;
    var totalLine = articleArray.length;
    var isLogin = false;
    var userId = '';
    var avatarUrl = '';
    if (req.user) {
        isLogin = true;
        userId = req.user.username;
        avatarUrl = req.user._json.avatar_url;
        // console.log(req.user);
        // console.log(req.user._json.avatar_url);
    }

    articleArray.forEach(function (str) {
        if (str) {
            var data = str.split(/\s+/);
            var tags = [];
            i = 3;
            while (data[i]) {
                tags.push(data[i]);
                i++;
            }
            articles.push({'idx': data[0], 'user_id': data[1], 'url': data[2], 'tags': tags});
            lineCount += 1;

            if (lineCount === totalLine - 1) {
                var counter = 0;
                articles.forEach(function (obj, i) {
                    // 비동기적 이미지, 제목, 내용 크롤링
                    request(obj.url, function (err, result, body) {
                        counter += 1;
                        const $ = cheerio.load(body);
                        // 1. 제목
                        var title = '';
                        title = $('h1').text();
                        if (title.length == 0) {
                            title = $('h2').text();
                        }
                        if (title.length == 0) {
                            title = $('h3').text();
                        }
                        articles[i].title = title;

                        // 2. 내용
                        var contents = '';
                        contents = $('p').text().substr(0,100);
                        articles[i].contents = contents;

                        // 3. 이미지
                        var imageUrl = '';
                        imageUrl = $('img').attr('src');
                        articles[i].image = imageUrl;

                        console.log(articles);

                        if (counter === totalLine - 1) {
                            res.render('index', {
                                data: articles,
                                isLogin: isLogin,
                                userId: userId,
                                avatarUrl: avatarUrl
                            });
                        }
                    });


                });

            }
        }
    });
});


module.exports = router;
