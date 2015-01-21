'use strict';

function buildModel(modelName, fieldsDefine, database, collectionName) {
    var schema = new mongoose.Schema(fieldsDefine, { collection: collectionName || modelName });

    schema.static('getFieldsDefine', function() {
        return fieldsDefine;
    });

    schema.static('getMaxId', function(cb) {
        this.find().sort({ _id: -1 }).limit(1).exec(function(err, users) {
            if (err) {
                cb(err);
                return;
            }
            var maxId = users[0] && users[0]._id; // maybe undefined
            cb(null, maxId);
        });
    });

    var model = database.model(modelName, schema);

    return model;
}

exports.buildModel = buildModel;
