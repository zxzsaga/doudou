'use strict';

var fs   = require('fs');
var path = require('path');
var util = require('util');

// 第三方库
var express    = require('express'), app = express();
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
global.logger = logger;
global.mongoose = mongoose;
global.database = database;
global.Constants = require(appModules.app.Constants);

// 自定义模块加载
var Game = require(appModules.models.Game);

// 自定义方法
function getRequiredFields(){}

// GET controller
app.get('/', function(req, res) {
    res.render('index.jade');
});
app.get('/game/new', function(req, res) {
    var params = {
        platforms: Constants.GAME.PLATFORM
    };
    res.render('game/new.jade', params);
});

// POST controller
app.post('/game/create', function(req, res) {
    // 游戏基本信息
    var gameParams = {};
    var gameFields = Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }
    // 封面裁剪信息
    var coverKeys = [ 'imgUrl', 'x1', 'y1', 'x2', 'y2' ];
    var coverParams = {};
    coverKeys.forEach(function(key) {
        coverParams[key] = req.param(key);
    });

    if (coverParams.x1 !== undefined) {
        handleCover(addGame);
    } else {
        addGame();
    }

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
