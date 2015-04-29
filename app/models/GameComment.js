'use strict';

var util = require('util');
var ObjectId = mongoose.Schema.Types.ObjectId;
var BaseSchema = appModules.models.BaseSchema;

function Schema(definition, options) {
    Schema.super_.call(this, definition, options);
}
util.inherits(Schema, BaseSchema);

var definition = {
    gameId: ObjectId,
    commentedBy: Number,
    comment: String,
    createdAt: {
        type: Number,
        default: Date.now()
    }
};

var options = {
    collection: 'GameComment'
};

var schema = new Schema(definition, options);

var GameComment = database.doudou.model('GameComment', schema);
module.exports = GameComment;
