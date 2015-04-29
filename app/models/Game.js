'use strict';

var util = require('util');
var Mixed = mongoose.Schema.Types.Mixed;
var BaseSchema = appModules.models.BaseSchema;

function Schema(definition, options) {
    Schema.super_.call(this, definition, options);
}
util.inherits(Schema, BaseSchema);

var definition = {
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

var options = {
    collection: 'Game'
};

var schema = new Schema(definition, options);

var Game = database.doudou.model('Game', schema);
module.exports = Game;
