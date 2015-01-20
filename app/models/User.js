'use strict';

var modelUtil = require(appModules.util.modelUtil);

var fieldsDefine = {
    name: {
        type: String,
        required: true
    },
    pwd: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now()
    }
};
var User = modelUtil.buildModel('User', fieldsDefine, database.doudou);

module.exports = User;
