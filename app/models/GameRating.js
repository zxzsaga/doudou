'use strict';

var modelUtil = require(appModules.util.modelUtil);
var ObjectId = mongoose.Schema.Types.ObjectId;

var fieldsDefine = {
    gameId: ObjectId,
    raterId: Number,
    rating: {
        overall: Number,
        presentation: Number,
        graphics: Number,
        sound: Number,
        gameplay: Number,
        lastingAppeal: Number
    },
    createdAt: Date
};
var GameRating = modelUtil.buildModel('GameRating', fieldsDefine, database.doudou);

module.exports = GameRating;
