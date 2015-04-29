'use strict';

var fs   = require('fs');
var path = require('path');
var util = require('util');

// 第三方库
var express    = require('express'), app = express(), router = express.Router;
var glob       = require('glob');
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
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 端口设置
var nodePort = process.env.NODE_PORT || 80;
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

// 全局变量定义
global.publicPath = publicPath;
global.express    = express;
global.logger     = logger;
global.mongoose   = mongoose;
global.database   = database;
global.appModules = {};

// 文件加载
var rootPath = path.join(__dirname);
// 加载是有顺序的
var moduleMaps = {
    'app'         : path.join(rootPath, 'app', '*.js'),
    'util'        : path.join(rootPath, 'app', 'util', '*.js'),
    'models'      : path.join(rootPath, 'app', 'models', '*.js'),
    'filters'     : path.join(rootPath, 'app', 'routers', 'filters', '*.js'),
    'routers'     : path.join(rootPath, 'app', 'routers', '*.js')
};
function loadModulesPath() {
    Object.keys(moduleMaps).forEach(function(mods){
        appModules[mods] = {};
        var files = glob.sync(moduleMaps[mods]);
        files.forEach(function(file){
            var filename = path.basename(file, '.js');
            appModules[mods][filename] = require(file);
        })
    })
}
loadModulesPath();

// 全局变量定义, 需要先加载文件的变量
global.Constants  = appModules.app.Constants;

// 自定义模块加载
var Game        = appModules.models.Game;
var User        = appModules.models.User;
var GameRating  = appModules.models.GameRating;
var GameComment = appModules.models.GameComment;

app.use('/'     , appModules.routers.UserRouter);
app.use('/game' , appModules.routers.GameRouter);

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
