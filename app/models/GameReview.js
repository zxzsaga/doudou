'use strict';

var modelUtil = appModules.util.modelUtil;
var ObjectId = mongoose.Schema.Types.ObjectId;

var fieldsDefine = {
    gameId: ObjectId,
    reviewerId: ObjectId,
    review: String,
    createdAt: Date
};
var GameReview = modelUtil.buildModel('GameReview', fieldsDefine, database.doudou);

module.exports = GameReview;
