'use strict';

var GameReviewSchema = new mongoose.Schema(
    {
        gameId: ObjectId,
        reviewerId: ObjectId,
        review: String,
        createdAt: Date
    },
    { collection: 'GameReview' }
);

var GameReview = mongoose.model('GameReview', GameReviewSchema);

module.exports = GameReview;
