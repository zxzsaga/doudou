'use strict';

var fs   = require('fs');
var path = require('path');
var util = require('util');

// 第三方库
var express    = require('express'), app = express();
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
    var gameParams = {};
    var gameFields = Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }
    res.send('ok');
});

console.log(global);

var form = new multiparty.Form({ uploadDir: publicPath + '/upload' });
app.post('/file/upload', function(req, res) {
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
        }
        console.log('files: ');
        console.log(files);
        res.send('ok');
    });
});
