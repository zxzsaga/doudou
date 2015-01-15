'use strict';

function buildModel(modelName, fieldsDefine, database, collectionName) {
    var schema = new mongoose.Schema(fieldsDefine, { collection: collectionName || modelName });
    schema.static('getFieldsDefine', function() {
        return fieldsDefine;
    });
    var model = database.model(modelName, schema);
    return model;
}

exports.buildModel = buildModel;
