var passport = require('passport');
var express = require('express');

//////////////////////////////////////////////////////////////////////////////////////////////
// User controller
//////////////////////////////////////////////////////////////////////////////////////////////

var router = express.Router();
var scope;

function checkReturnTo(req, res, next) {
    scope = req.query.admin === 'true' ? config.server.github.admin_scope : config.server.github.public_scope;
    var returnTo = req.query.admin === 'true' ? '/' : req.session.next;
    if (returnTo) {
        if (!req.session) {
            req.session = {};
        }
        req.session.returnTo = returnTo;
    }
    console.log("req.body =      "+JSON.stringify(req.body));
    console.log("req.query =     "+JSON.stringify(req.query));
    console.log("req.params =    "+JSON.stringify(req.params));
    console.log("req.path =      "+req.path);
    console.log("next =          "+next);
    console.log("returnto =      "+returnTo);
    console.log("scope =         "+scope);
    console.log("res =           "+res);
    passport.authenticate('github', {scope: scope})(req, res, next);
}

router.get('/auth/github', checkReturnTo);

router.get('/auth/github/callback', passport.authenticate('github', { successReturnToOrRedirect: '/' }));

router.get('/logout',
    function(req, res, next) {
        req.logout();
        if (!req.query.noredirect) {
            res.redirect('/');
        } else {
            next();
        }
    }
);

module.exports = router;
