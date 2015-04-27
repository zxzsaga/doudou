'use strict';

var Game        = appModules.models.Game;
var User        = appModules.models.User;
var GameRating  = appModules.models.GameRating;
var GameComment = appModules.models.GameComment;

var UserRouter  = module.exports = express.Router();

// 登陆相关
UserRouter.get('/', function(req, res) {
    if (!req.session.user) {
        res.render('login.jade');
        return;
    }
    var page = parseInt(req.param('page')) || 1;
    var pageSize = 10;
    Game.find().sort({ addedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).exec(function(err, games) {
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

UserRouter.get('/login', function(req, res) {
    res.render('login.jade');
});

/**
 * @api {post} /login User login
 * @apiName UserLogin
 * @apiGroup User
 *
 * @apiParam {String} name User name
 * @apiParam {String} pwd Password
 */
UserRouter.post('/login', function(req, res) {
    var userParams = {
        name: req.param('name'),
        pwd: req.param('pwd')
    };
    User.findOne(userParams, function(err, user) {
        if (err) {
            logger.error(err);
            res.send('find user error');
            return;
        }
        if (!user) {
            res.render('login.jade', { error: 'Wrong username or password.' });
        } else {
            req.session.user = {
                id: user.id,
                name: user.name
            }
            res.redirect('/');
        }
    });
});

UserRouter.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            logger.error(err);
            res.send('logout error');
            return;
        }
        res.redirect('/');
    })
});

UserRouter.get('/register', function(req, res) {
    res.render('register.jade');
});

/**
 * @api {post} /register User register
 * @apiName UserRegister
 * @apiGroup User
 *
 * @apiParam {String} name User name
 * @apiParam {String} pwd Password
 */
UserRouter.post('/register', function(req, res) {
    var userParams = {
        name: req.param('name'),
        pwd: req.param('pwd')
    };
    User.findOne({ name: userParams.name }, function(err, user) {
        if (err) {
            logger.error(err);
            res.send('find user error');
            return;
        }

        if (user) {
            res.render('register.jade', { error: 'Username already exist.' });
            return;
        }

        User.getMaxId(function(err, maxId) {
            if (err) {
                logger.error(err);
                res.send('get user max id error');
                return;
            }

            var userId = maxId ? maxId + 1 : 100000;
            userParams._id = userId;
            var user = new User(userParams);
            user.save(function(err, user) {
                if (err) {
                    logger.error(err);
                    res.send('game save error');
                    return;
                }
                req.session.user = {
                    id: user._id,
                    name: user.name
                };
                res.redirect('/');
            });
        });
    });
});

UserRouter.get('/user/main/:id', function(req, res) {
    var userId = req.param('id');
    User.findOne({ _id: userId }, function(err, user) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        res.render('user/main.jade', { user: user });
    });
});
