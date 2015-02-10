'use strict';

var Game        = appModules.models.Game;
var User        = appModules.models.User;
var GameRating  = appModules.models.GameRating;
var GameComment = appModules.models.GameComment;

var GameRouter = module.exports = express.Router();

// before filters
GameRouter.use(appModules.filters.SessionFilter);

GameRouter.get('/new', function(req, res) {
    var params = {
        platforms: Constants.GAME.PLATFORM
    };
    res.render('game/new.jade', params);
});

GameRouter.post('/create', function(req, res) {
    // 游戏基本信息
    var gameParams = {};
    var gameFields = Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }
    gameParams.addedBy = req.session.user.id;
    gameParams.addedAt = Date.now();

    // 封面裁剪信息
    var coverKeys = [ 'imgUrl', 'x1', 'y1', 'x2', 'y2' ];
    var coverParams = {};
    coverKeys.forEach(function(key) {
        coverParams[key] = req.param(key);
    });

    if (!coverParams.imgUrl || coverParams.imgUrl === '') {
        res.send('no cover img');
        return;
    }

    Game.findOne({ name: gameParams.name }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }

        if (game) {
            res.send('This game is already exist');
            return;
        }

        if (coverParams.x1 !== undefined) {
            handleCover(addGame);
        } else {
            addGame();
        }
    });

    function handleCover(cb) {
        im.identify(publicPath + coverParams.imgUrl, function(err, features) {
            if (err) {
                logger.error(err);
                res.send('im identify error');
                return;
            }
            // console.log(features); { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
            var scale = features.width / 128;

            var cropWidth = Math.round(coverParams.x2 - coverParams.x1);
            var cropHeight = Math.round(coverParams.y2 - coverParams.y1);
            var desImgPath = 'img/game/cover/' + gameParams.platform + '-' + gameParams.name + '.png';

            var imParam = [
                publicPath + coverParams.imgUrl,
                '-gravity', 'northwest',
                '-crop', cropWidth * scale + 'x' + cropHeight * scale + '+' + coverParams.x1 * scale + '+' + coverParams.y1 * scale,
                '-resize', 128,
                publicPath + '/' + desImgPath
            ];

            im.convert(imParam, function(err, stdout) {
                if (err) {
                    logger.error(err);
                    res.send('im convert error');
                    return;
                }
                gameParams.coverUrl = desImgPath;
                fs.rename(
                    publicPath + coverParams.imgUrl,
                    publicPath + '/img/game/album/' + gameParams.platform + '-' + gameParams.name + '-cover-origin.png',
                    function(err) {
                        if (err) {
                            logger.error(err);
                            res.send('fs.rename error');
                            return;
                        }
                        cb();
                    }
                );
            });
        });
    }

    function addGame() {
        var game = new Game(gameParams);
        game.save(function(err, game) {
            if (err) {
                logger.error(err);
                res.send('game save error');
                return;
            }
            res.redirect('/');
            return;
        });
    }
});

GameRouter.get('/main/:id', function(req, res) {
    // TODO 优化这个接口, 在用户点击评分的时候再查找自己对这个游戏的评分和评价
    var gameId = req.param('id');
    var userId = req.session.user.id;
    Game.findOne({ _id: gameId }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        game.coverUrl = '/' + game.coverUrl;
        // game 表示这个 game 其 model 里的相关属性

        var aggregateCondition = [
            {
                $match: {
                    gameId: mongoose.Types.ObjectId(gameId)
                },
            },
            {
                $group: {
                    _id           : '$gameId',
                    overall       : { $avg: '$rating.overall' },
                    presentation  : { $avg: '$rating.presentation' },
                    graphics      : { $avg: '$rating.graphics' },
                    sound         : { $avg: '$rating.sound' },
                    gameplay      : { $avg: '$rating.gameplay' },
                    lastingAppeal : { $avg: '$rating.lastingAppeal' }
                }
            }
        ];
        GameRating.aggregate(aggregateCondition, function(err, aggregateDocs) {
            if (err) {
                logger.error(err);
                res.send('find gameRating error');
                return;
            }

            var finalRating = {};
            if (aggregateDocs && (aggregateDocs.length !== 0)) {
                finalRating = aggregateDocs[0];
                for (var key in finalRating) {
                    if (key !== '_id') {
                        finalRating[key] = Math.round(finalRating[key] * 10) / 10;    // 保留 1 位小数
                    }
                }
            }
            // finalRating 表示游戏的平均评分

            GameComment.find({ gameId: gameId }).limit(10).exec(function(err, gameComments) {
                if (err) {
                    logger.error(err);
                    res.send('find gameComment error');
                    return;
                }
                // gameComments 表示游戏的短评

                var gameCommentByIdArr = [];
                gameComments.forEach(function(gameComment) {
                    gameCommentByIdArr.push(gameComment.commentedBy);
                });
                User.find({ _id: { $in: gameCommentByIdArr } }, { name: 1 }, function(err, users) {
                    if (err) {
                        logger.error(err);
                        res.send('fin user error');
                        return;
                    }
                    var userIdNameMap = {};
                    users.forEach(function(user) {
                        userIdNameMap[user._id] = user.name;
                    });

                    var gameCommentsToUser = [];
                    gameComments.forEach(function(gameComment) {
                        var gameCommentToUser = {
                            commentedBy: userIdNameMap[gameComment.commentedBy],
                            comment: gameComment.comment
                        };
                        gameCommentsToUser.push(gameCommentToUser);
                    });
                    // gameCommentsToUser 将 gameComments 中的 commentedBy 从 id 改为 name, 以便显示给用户

                    GameRating.findOne({ gameId: gameId, raterId: userId }, function(err, myGameRating) {
                        if (err) {
                            logger.error(err);
                            res.send('find myGameRating error');
                            return;
                        }
                        // myGameRating 表示我对这个游戏的评分

                        GameComment.findOne({ gameId: gameId, commentedBy: userId }, function(err, myGameComment) {
                            if (err) {
                                logger.error(err);
                                res.send('find myGameComment error');
                                return;
                            }
                            // myGameComment 表示我对这个游戏的短评

                            var gameRelativeDoc = {
                                game: game,
                                gameRating: finalRating,
                                gameComments: gameCommentsToUser,
                                myGameRating: (myGameRating && myGameRating.rating) || {},
                                myGameComment: myGameComment && myGameComment.comment
                            };
                            res.render('game/main.jade', gameRelativeDoc);
                        })
                    });
                });
            });
        });
    });
});

GameRouter.post('/game/rating/:id', function(req, res) {
    var gameId = req.param('id');
    var userId = req.session.user.id;
    var overall = req.param('overall');
    var presentation = req.param('presentation');
    var graphics = req.param('graphics');
    var sound = req.param('sound');
    var gameplay = req.param('gameplay');
    var lastingAppeal = req.param('lastingAppeal');
    var comment = req.param('comment');

    GameRating.findOne({ gameId: gameId, raterId: userId }, function(err, gameRating) {
        if (err) {
            logger.error(err);
            res.send('find gameRating error');
            return;
        }

        var ratingDoc = {
            gameId: gameId,
            raterId: userId,
            rating: {
                overall: overall,
                presentation: presentation,
                graphics: graphics,
                sound: sound,
                gameplay: gameplay,
                lastingAppeal: lastingAppeal
            }
        };
        if (gameRating) {
            gameRating.rating = ratingDoc.rating;
        } else {
            gameRating = new GameRating(ratingDoc);
        }

        gameRating.save(function(err, gameRating) {
            if (err) {
                logger.error(err);
                res.send('save gameRating error');
                return;
            }

            GameComment.findOne({ gameId: gameId, commentedBy: userId }, function(err, gameComment) {
                if (err) {
                    logger.error(err);
                    res.send('find gameComment error');
                    return;
                }

                if (gameComment) {
                    gameComment.comment = comment;
                } else {
                    var commentDoc = {
                        gameId: gameId,
                        commentedBy: userId,
                        comment: comment,
                    };
                    gameComment = new GameComment(commentDoc);
                }

                gameComment.save(function(err, gameComment) {
                    if (err) {
                        logger.error(err);
                        res.send('save gameComment error');
                        return;
                    }
                    res.redirect('/game/main/' + req.param('id'));
                });
            });
        });
    });
});

GameRouter.get('/game/:id/edit', function(req, res) {
    var gameId = req.param('id');
    Game.findOne({ _id: gameId }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        game.coverUrl = '/' + game.coverUrl;
        // game 表示这个 game 其 model 里的相关属性

        var params = {
            platforms: Constants.GAME.PLATFORM,
            isNew: false,
            game: game
        };
        res.render('game/edit.jade', params);
    });
});

GameRouter.post('/game/update', function(req, res) {
    var gameParams = {};
    var gameFields = Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }
    gameParams._id = req.param('gameId');

    // 封面裁剪信息
    var coverKeys = [ 'imgUrl', 'x1', 'y1', 'x2', 'y2' ];
    var coverParams = {};
    coverKeys.forEach(function(key) {
        coverParams[key] = req.param(key);
    });

    /*
    if (!coverParams.imgUrl || coverParams.imgUrl === '') {
        res.send('no cover img');
        return;
    }
    */

    Game.findOne({ _id: gameParams._id }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }

        if (!game) {
            res.send('This game does not exist');
            return;
        }

        if (coverParams.x1 !== undefined && coverParams.imgUrl && coverParams.imgUrl !== '') {
            handleCover(game, updateGame);
        } else {
            updateGame(game);
        }
    });

    function handleCover(game, cb) {
        im.identify(publicPath + coverParams.imgUrl, function(err, features) {
            if (err) {
                logger.error(err);
                res.send('im identify error');
                return;
            }
            // console.log(features); { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
            var scale = features.width / 128;

            var cropWidth = Math.round(coverParams.x2 - coverParams.x1);
            var cropHeight = Math.round(coverParams.y2 - coverParams.y1);
            var desImgPath = 'img/game/cover/' + gameParams.platform + '-' + gameParams.name + '.png';

            var imParam = [
                publicPath + coverParams.imgUrl,
                '-gravity', 'northwest',
                '-crop', cropWidth * scale + 'x' + cropHeight * scale + '+' + coverParams.x1 * scale + '+' + coverParams.y1 * scale,
                '-resize', 128,
                publicPath + '/' + desImgPath
            ];

            im.convert(imParam, function(err, stdout) {
                if (err) {
                    logger.error(err);
                    res.send('im convert error');
                    return;
                }
                gameParams.coverUrl = desImgPath;
                fs.rename(
                    publicPath + coverParams.imgUrl,
                    publicPath + '/img/game/album/' + gameParams.platform + '-' + gameParams.name + '-cover-origin.png',
                    function(err) {
                        if (err) {
                            logger.error(err);
                            res.send('fs.rename error');
                            return;
                        }
                        cb(game);
                    }
                );
            });
        });
    }

    function updateGame(game) {
        for (var i in gameParams) {
            if (gameParams[i] !== undefined) {
                game[i] = gameParams[i];
            }
        }
        game.save(function(err, game) {
            if (err) {
                logger.error(err);
                res.send('game save error');
                return;
            }
            res.redirect('/');
            return;
        });
    }
});
