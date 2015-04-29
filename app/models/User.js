'use strict';

var util = require('util');
var BaseSchema = appModules.models.BaseSchema;

function Schema(definition, options) {
    Schema.super_.call(this, definition, options);
}
util.inherits(Schema, BaseSchema);

var definition = {
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    pwd: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Number,
        default: Date.now()
    }
};

var options = {
    collection: 'User'
};

var schema = new Schema(definition, options);

var User = database.doudou.model('User', schema);
module.exports = User;
