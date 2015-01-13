'use strict';

function buildModel(modelName, fieldsDefine, database, collectionName) {
    var schema = new mongoose.Schema(fieldsDefine, { collection: collectionName || modelName });
    var model = database.model(modelName, schema);
    return model;
}

exports.buildModel = buildModel;
