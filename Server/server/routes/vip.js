var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var db = require('../db');

// var titleHead = process.env.TITLE_HEAD;

/**
 * Router-level middleware - called before get/post
 */
router.use(function (req, res, next) {
    if (!req.user) {
        return res.redirect('/');
    }

    next();
});

/* GET VIP home page */
router.get('/', function (req, res, next) {
    var user = req.user;
    console.log(user);
    var url = 'https://api.instagram.com/v1/users/self/?access_token=' + user.accessToken;

    db.userHasRegisteredStripeAccount(user.id, function (error, result) {
        if (error) {
            return next(error);
        }

        if (result === true) {
            request.get({ url: url }, function (error, response, body) {
                if (error) {
                    return next(error);
                }

                try {
                    var data = JSON.parse(body).data;
                    data.accessToken = user.accessToken;
                }
                catch (error) {
                    return res.send(body);
                }

                data.lastLogin = moment.utc().format('YYYY-MM-DD HH:mm:ss');

                db.updateUser(data, function (error) {
                    if (error) {
                        return next(error);
                    }

                    res.redirect('/vip');
                });
            });
        }
        else {
            res.redirect('/v/vip/logout');
        }
    });
});

/* GET Login as VIP confirmation */
router.get('/vip_confirm', function (req, res, next) {
    var user = req.user;
    var minFollowers = parseInt(process.env.VIP_MIN_FOLLOWERS);
    var maxFollowers = parseInt(process.env.VIP_MAX_FOLLOWERS);
    var isQualified_beta = user.counts.followed_by <= maxFollowers;
    var isQualified = (user.counts.followed_by >= minFollowers && user.counts.followed_by > user.counts.follows);

    if ((user.id === '7322721927' || user.id === '7675804324')) {
        isQualified = true;
    }

    // qualify all accounts for testing/debugging
    isQualified = true;

    if (!isQualified) {
        req.logout();
        res.redirect('/vip/unqualified');
    }
    else if (!isQualified_beta) {
        req.logout();
        res.redirect('/vip/unqualified_beta');
    }
    else {
        db.userHasRegisteredStripeAccount(user.id, function (error, result) {
            if (error) {
                return next(error);
            }

            if (result === true) {
                res.redirect('/vip');
            }
            else {
                res.redirect('/vip/confirm');
            }
        });
    }
});

/* GET VIP terms confirmation */
/* router.get('/vip_terms_confirm', function (req, res) {
    res.render('pages/vip-terms-confirm', { titleHead: titleHead });
}); */

/* GET Create Stripe account confirmation */
/* router.get('/stripe_create_confirm', function (req, res) {
    res.render('pages/stripe-create-confirm', { titleHead: titleHead });
}); */

/* GET Instagram user data */
router.get('/user', function (req, res) {
    res.end(JSON.stringify(req.user));
});

/* GET logout user */
router.get('/logout', function (req, res) {
    req.logout();
    
    res.redirect('/b823a745/e4a6c13b');
});

module.exports = router;