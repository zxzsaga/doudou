'use strict';

var modelUtil = require(appModules.util.modelUtil);

var fieldsDefine = {
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
var User = modelUtil.buildModel('User', fieldsDefine, database.doudou);

module.exports = User;
