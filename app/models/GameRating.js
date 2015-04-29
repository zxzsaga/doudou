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

var options = {
    collections: 'GameRating'
};

var schema = new Schema(definition, options);

var GameRating = database.doudou.model('GameRating', schema);
module.exports = GameRating;
