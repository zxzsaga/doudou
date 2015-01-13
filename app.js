'use strict';

var path = require('path');
var util = require('util');

var express    = require('express'), app = express();
var glob       = require('glob');
var log4js     = require('log4js'), logger = log4js.getLogger();
var mongoose   = require('mongoose');
var underscore = require('underscore');

var nodePort = process.env.NODE_PORT || 3000;

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

global.appModules = appModules;
global.logger = logger;
global.mongoose = mongoose;
global.database = database;

var Game = require(appModules.models.Game);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.jade');
});

app.get('/game/new', function(req, res) {
    res.render('game/new.jade');
});

app.post('/game/create', function(req, res) {
    
});

app.listen(nodePort);
