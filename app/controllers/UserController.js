'use strict';
/*
var userController = function() {
    var router = express.Router();

    router.get('/login', function(req, res) {
        res.render('login.jade');
    });

    router.post('/login', function(req, res) {
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

    return router;
};

module.exports = userController();
*/
