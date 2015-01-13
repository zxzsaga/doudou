'use strict';

function BaseModel(fieldsDefine, database, collectionName) {
    this.doc = doc
}

BaseModel.prototype.toDoc = function() {
    return this.doc;
};

BaseModel.prototype.$destroy = function() {
    for (var key in self) {
        if (self.hasOwnProperty(key)) {
            self[key] = null;
        }
    }
};

module.exports = BaseModel;
