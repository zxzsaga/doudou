'use strict';

var GameRatingSchema = new mongoose.Schema(
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

var GameRating = mongoose.model('GameRating', GameRatingSchema);

module.exports = GameRating;
