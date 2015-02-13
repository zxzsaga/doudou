'use strict';

var modelUtil = appModules.util.modelUtil;
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
    createdAt: {
        type: Number,
        default: Date.now()
    }
};
var GameRating = modelUtil.buildModel('GameRating', fieldsDefine, database.doudou);

module.exports = GameRating;
