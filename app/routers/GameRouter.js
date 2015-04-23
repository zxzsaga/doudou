'use strict';

var fs          = require('fs');
var im          = require('imagemagick');
var moment      = require('moment');

var Game        = appModules.models.Game;
var User        = appModules.models.User;
var GameRating  = appModules.models.GameRating;
var GameComment = appModules.models.GameComment;

var GameRouter  = module.exports = express.Router();

// before filters
GameRouter.use(appModules.filters.SessionFilter);

/**
 * Render add game page
 */
GameRouter.get('/new', function(req, res) {
    var params = {
        platforms: Constants.GAME.PLATFORM,
        isNew: true
    };
    res.render('game/edit.jade', params);
});

/**
 * @api {post} /game/create Create game
 * @apiSampleRequest http://localhost:3000/game/create
 * @apiName CreateGame
 * @apiGroup Game
 *
 * @apiParam {String} name Game name.
 * @apiParam {String} developer Game developer.
 * @apiParam {String} description Game description.
 */
GameRouter.post('/create', function(req, res) {
    // 游戏基本信息
    var gameParams = {};
    var gameFields = {
        name: true,
        platform: true,
        developer: true,
        description: true
    }; // Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }
    gameParams.addedBy = req.session.user.id;
    gameParams.addedAt = Date.now();

    var tag = req.param('tag');
    if (tag) {
        gameParams.tag = tag.split(' ');
    }

    gameParams.platform = [];
    var platforms = Constants.GAME.PLATFORM;
    platforms.forEach(function(platform) {
        var platformIsChecked = req.param('platform-' + platform);
        if (platformIsChecked) {
            gameParams.platform.push(platform);
        }
    });

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
                            comment: gameComment.comment,
                            commentedAt: moment(gameComment.createdAt).format('YYYY-MM-DD')
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

/**
 * @api {post} /game/rating/:id Rating game
 * @apiName RatingGame
 * @apiGroup Game
 *
 * @apiParam {String} id Game id
 * @apiParam {Number} overall Overall rating
 * @apiParam {Number} presentation Presentation rating
 * @apiParam {Number} graphics Graphics rating
 * @apiParam {Number} sound Sound rating
 * @apiParam {Number} gameplay GamePlay rating
 * @apiParam {Number} lastingAppeal LastingAppeal rating
 * @apiParam {String} comment Game comment
 */
GameRouter.post('/rating/:id', function(req, res) {
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

GameRouter.get('/edit/:id', function(req, res) {
    var gameId = req.param('id');
    Game.findOne({ _id: gameId }, function(err, game) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }

        game.coverUrl = '/' + game.coverUrl;
        // game 表示这个 game 其 model 里的相关属性

        if (game.tag instanceof Array) {
            var tagsStr = '';
            game.tag.forEach(function(singleTag) {
                tagsStr += singleTag + ' ';
            });
            game.tag = tagsStr;
        }

        var params = {
            platforms: Constants.GAME.PLATFORM,
            isNew: false,
            game: game
        };
        res.render('game/edit.jade', params);
    });
});

GameRouter.post('/update', function(req, res) {
    // 游戏基本信息
    var gameParams = {};
    var gameFields = {
        name: true,
        platform: true,
        developer: true,
        description: true
    }; // Game.getFieldsDefine();
    for (var i in gameFields) {
        gameParams[i] = req.param(i);
    }

    var tag = req.param('tag');
    if (tag) {
        gameParams.tag = tag.split(' ');
    }

    gameParams.platform = [];
    var platforms = Constants.GAME.PLATFORM;
    platforms.forEach(function(platform) {
        var platformIsChecked = req.param('platform-' + platform);
        if (platformIsChecked) {
            gameParams.platform.push(platform);
        }
    });

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

GameRouter.get('/search', function(req, res) {
    var tag = req.param('tag');

    var page = parseInt(req.param('page')) || 1;
    var pageSize = 10;
    Game.find({ tag: tag }).sort({ addedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).exec(function(err, games) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        games.forEach(function(game) {
            game.coverUrl = '/' + game.coverUrl;
        });
        Game.count({}, function(err, gameCount) {
            if (err) {
                logger.error(err);
                res.send('count game error');
                return;
            }
            res.render('index.jade', { games: games, pageIndex: page, pageCount: Math.ceil(gameCount / pageSize) });
        })
    });
});
