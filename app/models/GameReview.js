'use strict';

var gameReviewSchema = new mongoose.Schema(
    {
        gameId: ObjectId,
        reviewerId: ObjectId,
        review: String,
        createdAt: Date
    },
    { collection: 'GameReview' }
);

var GameReview = mongoose.model('GameReview', gameReviewSchema);

module.exports = GameReview;
