'use strict';

var GameSchema = new mongoose.Schema(
    {
        name: String,
        platform: String,
        tag: Array,
        coverUrl: String,
        releaseData: Date,
        developer: String,
        publisher: String
    },
    { collection: 'Game' }
);

var Game = mongoose.model('Game', GameSchema);

module.exports = Game;
