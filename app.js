'use strict';

var fs   = require('fs');
var path = require('path');
var util = require('util');

// 第三方库
var express    = require('express'), app = express(), router = express.Router;
var glob       = require('glob');
var im         = require('imagemagick');
var log4js     = require('log4js'), logger = log4js.getLogger();
var mongoose   = require('mongoose');
var multiparty = require('multiparty');
var underscore = require('underscore');

// express 相关库
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');
var bodyParser     = require('body-parser');

// app 设置
var publicPath = __dirname + '/public';
app.use(express.static(publicPath));

// app express 相关设置
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser('secret'));
app.use(session({ secret: 'keyboard cat' }));
app.use(bodyParser());

// 端口设置
var nodePort = process.env.NODE_PORT || 3000;
app.listen(nodePort);

// 数据库设置
var database = {
    doudou: mongoose.createConnection('mongodb://localhost/doudou')
};
for (var i in database) {
    database[i].on('error', console.error.bind(console, 'connection error:'));
    database[i].once('open', function(callback) {
        console.log('opened');
    });
}

// 文件加载
var appModules = {};
var rootPath = path.join(__dirname);
var moduleMaps = {
    'app'         : path.join(rootPath, 'app', '*.js'),
    'controllers' : path.join(rootPath, 'app', 'controllers', '*.js'),
    'models'      : path.join(rootPath, 'app', 'models', '*.js'),
    'util'        : path.join(rootPath, 'app', 'util', '*.js')
};
function loadModulesPath() {
    Object.keys(moduleMaps).forEach(function(mods){
        appModules[mods] = {};
        var files = glob.sync(moduleMaps[mods]);
        files.forEach(function(file){
            var filename = path.basename(file, '.js');
            appModules[mods][filename] = file;
        })
    })
}
loadModulesPath();

// 全局变量定义
global.appModules = appModules;
global.logger     = logger;
global.express    = express
global.mongoose   = mongoose;
global.database   = database;
global.Constants  = require(appModules.app.Constants);

// 自定义模块加载
var Game       = require(appModules.models.Game);
var User       = require(appModules.models.User);
var GameRating = require(appModules.models.GameRating);


// 登陆相关
app.get('/', function(req, res) {
    if (!req.session.user) {
        res.render('login.jade');
        return;
    }
    Game.find().limit(10).exec(function(err, games) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        games.forEach(function(game) {
            game.coverUrl = '/' + game.coverUrl;
        });
        res.render('index.jade', { games: games });
    });
});
app.get('/login', function(req, res) {
    res.render('login.jade');
});
app.post('/login', function(req, res) {
    var userParams = {
        name: req.param('name'),
        pwd: req.param('pwd')
    };
    User.findOne(userParams, function(err, user) {
        if (err) {
            logger.error(err);
            res.send('find user error');
            return;
        }
        if (!user) {
            res.render('login.jade', { error: 'Wrong username or password.' });
        } else {
            req.session.user = {
                id: user.id,
                name: user.name
            }
            res.redirect('/');
        }
    });
});
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            logger.error(err);
            res.send('logout error');
            return;
        }
        res.redirect('/');
    })
});
app.get('/register', function(req, res) {
    res.render('register.jade');
});
app.post('/register', function(req, res) {
    var userParams = {
        name: req.param('name'),
        pwd: req.param('pwd')
    };
    User.findOne({ name: userParams.name }, function(err, user) {
        if (err) {
            logger.error(err);
            res.send('find user error');
            return;
        }

        if (user) {
            res.render('register.jade', { error: 'Username already exist.' });
            return;
        }

        User.getMaxId(function(err, maxId) {
            if (err) {
                logger.error(err);
                res.send('get user max id error');
                return;
            }

            var userId = maxId ? maxId + 1 : 100000;
            userParams._id = userId;
            var user = new User(userParams);
            user.save(function(err, user) {
                if (err) {
                    logger.error(err);
                    res.send('game save error');
                    return;
                }
                req.session.user = {
                    id: user._id,
                    name: user.name
                };
                res.redirect('/');
            });
        });
    });
});

// session filter
app.use(function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }
    next();
});

app.get('/game/new', function(req, res) {
    var params = {
        platforms: Constants.GAME.PLATFORM
    };
    res.render('game/new.jade', params);
});

app.post('/game/create', function(req, res) {
    // 游戏基本信息
    var gameParams = {};
    var gameFields = Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }
    gameParams.addedBy = req.session.user.id;
    gameParams.addedAt = Date.now();

    // 封面裁剪信息
    var coverKeys = [ 'imgUrl', 'x1', 'y1', 'x2', 'y2' ];
    var coverParams = {};
    coverKeys.forEach(function(key) {
        coverParams[key] = req.param(key);
    });

    Game.findOne({ name: gameParams.name }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }

        if (game) {
            res.send('This game is already exist');
            return;
        }

        if (coverParams.x1 !== undefined) {
            handleCover(addGame);
        } else {
            addGame();
        }
    });

    function handleCover(cb) {
        im.identify(publicPath + coverParams.imgUrl, function(err, features) {
            if (err) {
                logger.error(err);
                res.send('im identify error');
                return;
            }
            // console.log(features); { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
            var scale = features.width / 128;

            var cropWidth = Math.round(coverParams.x2 - coverParams.x1);
            var cropHeight = Math.round(coverParams.y2 - coverParams.y1);
            var desImgPath = 'img/game/cover/' + gameParams.platform + '-' + gameParams.name + '.png';

            var imParam = [
                publicPath + coverParams.imgUrl,
                '-gravity', 'northwest',
                '-crop', cropWidth * scale + 'x' + cropHeight * scale + '+' + coverParams.x1 * scale + '+' + coverParams.y1 * scale,
                '-resize', 128,
                publicPath + '/' + desImgPath
            ];

            im.convert(imParam, function(err, stdout) {
                if (err) {
                    logger.error(err);
                    res.send('im convert error');
                    return;
                }
                gameParams.coverUrl = desImgPath;
                fs.rename(
                    publicPath + coverParams.imgUrl,
                    publicPath + '/img/game/album/' + gameParams.platform + '-' + gameParams.name + '-cover-origin.png',
                    function(err) {
                        if (err) {
                            logger.error(err);
                            res.send('fs.rename error');
                            return;
                        }
                        cb();
                    }
                );
            });
        });
    }

    function addGame() {
        var game = new Game(gameParams);
        game.save(function(err, game) {
            if (err) {
                logger.error(err);
                res.send('game save error');
                return;
            }
            res.send('ok');
            return;
        });
    }
});

app.post('/img/upload', function(req, res) {
    var form = new multiparty.Form({ uploadDir: publicPath + '/upload' });
    form.parse(req, function(err, fields, files) {
        if (err) {
            logger.error(err);
            res.send({ code: -1, error: 'form parse error' });
            return;
        }
        var filePath;
        for (var key in files) {
            filePath = files[key][0] && files[key][0].path;
            break;
        }
        filePath = filePath.slice(publicPath.length);
        res.send({ code: 0, imgUrl: filePath });
    });
});

app.get('/game/main/:id', function(req, res) {
    var id = req.param('id');
    Game.findOne({ _id: id }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        game.coverUrl = '/' + game.coverUrl;

        GameRating.find({ gameId: id }, function(err, gameRatings) {
            if (err) {
                logger.error(err);
                res.send('find gameRating error');
                return;
            }
            var finalRating = {
                overall: 0,
                presentation: 0,
                graphics: 0,
                sound: 0,
                gameplay: 0,
                lastingAppeal: 0
            };
            gameRatings.forEach(function(gameRating) {
                for (var key in finalRating) {
                    finalRating[key] += gameRating.rating[key];
                }
            });
            for (var key in finalRating) {
                var rating = finalRating[key] / gameRatings.length;
                rating = Math.round(rating * 10) / 10;    // 保留 1 位小数
                finalRating[key] = rating;
            }
            res.render('game/main.jade', { game: game, gameRating: finalRating });
        });
    });
});

app.post('/game/rating/:id', function(req, res) {
    var gameId = req.param('id');
    var userId = req.session.user.id;
    var overall = req.param('overall');
    var presentation = req.param('presentation');
    var graphics = req.param('graphics');
    var sound = req.param('sound');
    var gameplay = req.param('gameplay');
    var lastingAppeal = req.param('lastingAppeal');
    var ratingDoc = {
        gameId: gameId,
        raterId: userId,
        rating: {
            overall: overall,
            presentation: presentation,
            graphics: graphics,
            sound: sound,
            gameplay: gameplay,
            lastingAppeal: lastingAppeal
        }
    };

    var gameRating = new GameRating(ratingDoc);
    gameRating.save(function(err, gameRating) {
        if (err) {
            logger.error(err);
            res.send('gameRating save error');
            return;
        }
        res.redirect('/game/main/' + req.param('id'));
    });
});

app.get('/maxUserId', function(req, res) {
    User.getMaxId(function(err, maxId) {
        if (err) {
            logger.error(err);
            res.send('get max user id error');
            return;
        }
        res.send(maxId || 'null');
    });
});
