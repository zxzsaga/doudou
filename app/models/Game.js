'use strict';

module.exports = Game;

function Game(doc) {
    Gamer.super_.call(this, doc);
}
util.inherits(Game, BaseModel);

var getters = [
    
];

getters.forEach(function(name) {
    Game.prototype.__defineGetter__(name, function() {
        return this.doc[name];
    });
});
