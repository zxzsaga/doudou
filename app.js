'use strict';

var path = require('path');
var util = require('util');

var express    = require('express'), app = express();
var glob       = require('glob');
var log4js     = require('log4js'), logger = log4js.getLogger();
var mongoose   = require('mongoose');
var underscore = require('underscore');

var nodePort = process.env.NODE_PORT || 3000;

mongoose.connect('mongodb://localhost/doudou');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log('opened');
});

// 文件加载
var appModules = {};
var rootPath = path.join(__dirname);
var moduleMaps = {
    'app'         : path.join(rootPath, 'app', '*.js'),
    'models'      : path.join(rootPath, 'app', 'models', '*.js')
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



app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.jade');
});

app.listen(nodePort);
