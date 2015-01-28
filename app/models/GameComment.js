'use strict';

var modelUtil = require(appModules.util.modelUtil);
var ObjectId = mongoose.Schema.Types.ObjectId;

var fieldsDefine = {
    gameId: ObjectId,
    commentedBy: Number,
    comment: String,
    createdAt: {
        type: Number,
        default: Date.now()
    }
};
var GameComment = modelUtil.buildModel('GameComment', fieldsDefine, database.doudou);

module.exports = GameComment;
