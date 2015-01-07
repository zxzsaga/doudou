'use strict';

var express = require('express');
var app = express();
var log4js = require('log4js');
var logger = log4js.getLogger();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.jade');
});


app.listen(3000);
