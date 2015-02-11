'use strict';

var modelUtil = appModules.util.modelUtil;

var fieldsDefine = {
    gameId: ObjectId,
    reviewerId: ObjectId,
    review: String,
    createdAt: Date
};
var GameReview = modelUtil.buildModel('GameReview', fieldsDefine, database.doudou);

module.exports = Game;
