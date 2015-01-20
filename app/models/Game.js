'use strict';

var modelUtil = require(appModules.util.modelUtil);

var fieldsDefine = {
    name: {
        type: String,
        required: true
    },
    platform: String,
    tag: Array,
    coverUrl: String,
    // releaseDate: Date,
    developer: String,
    description: String,
};
var Game = modelUtil.buildModel('Game', fieldsDefine, database.doudou);

module.exports = Game;
