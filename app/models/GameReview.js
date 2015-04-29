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
    reviewerId: ObjectId,
    review: String,
    createdAt: Date
};

var options = {
    collection: 'GameReview'
};

var schema = new Schema(definition, options);

var GameReview = database.doudou.model('GameReview', schema);
module.exports = GameReview;
