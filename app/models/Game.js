'use strict';

var modelUtil = require(appModules.util.modelUtil);

var fieldsDefine = {
    name: String,
    platform: String,
    tag: Array,
    coverUrl: String,
    releaseData: Date,
    developer: String,
    publisher: String
};
var Game = modelUtil.buildModel('Game', fieldsDefine, database.doudou);

module.exports = Game;

