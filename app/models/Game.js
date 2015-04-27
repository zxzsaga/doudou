'use strict';

var modelUtil = appModules.util.modelUtil;
var Mixed = mongoose.Schema.Types.Mixed;

var fieldsDefine = {
    name: {
        type: String,
        required: true
    },
    platform: Mixed,
    coverUrl: String,
    releaseDate: Date,
    developer: String,
    description: String,
    tag: Array,
    addedBy: Number,
    addedAt: {
        type: Number,
        default: Date.now()
    }
};
var Game = modelUtil.buildModel('Game', fieldsDefine, database.doudou);

module.exports = Game;
