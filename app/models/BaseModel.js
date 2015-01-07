'use strict';

module.exports = BaseModel;

function BaseModel(doc) {
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
