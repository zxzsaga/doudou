'use strict';

var util = require('util');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function BaseSchema(definition, options) {
    BaseSchema.super_.call(this, definition, options);

    this.statics.getFieldsDefine = function() {
        return null;
    };

    this.statics.getMaxId = function(callback) {
        this.find().sort({ _id: -1 }).limit(1).exec(function(err, users) {
            if (err) {
                callback(err);
                return;
            }
            var maxId = users[0] && users[0]._id; // maybe undefined
            callback(null, maxId);
        });
    };
}
util.inherits(BaseSchema, Schema);

module.exports = BaseSchema;
