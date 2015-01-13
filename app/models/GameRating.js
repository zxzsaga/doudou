'use strict';

var gameRatingSchema = new mongoose.Schema(
    {
        gameId: ObjectId,
        raterId: ObjectId,
        rating: {
            overall: Number,
            presentation: Number,
            graphics: Number,
            sound: Number,
            gameplay: Number,
            lastingAppeal: Number
        },
        createdAt: Date
    },
    { collection: 'GameRating' }
);

var GameRating = mongoose.model('GameRating', gameRatingSchema);

module.exports = GameRating;
