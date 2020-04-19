var express = require('express');
var router = express.Router();
var request = require('request');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var moment = require('moment');
var db = require('../db');
var io = require('../io');

// Stripe Connect OAuth
router.get('/oauth', function (req, res) {
    if (!req.user) {
        return res.redirect('/');
    }
    console.log(req.user);
    var redirectUri = process.env.SERVER + '/s/stripe/oauth_callback';
    var userUrl = 'https://www.instagram.com/' + req.user.username;
    var userBusinessName = 'The Chat Matrix';
    var userBusinessDescription = 'Video calls.';

    var uri = 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=' +
        process.env.STRIPE_CLIENT_ID + '&scope=read_write&redirect_uri=' + redirectUri +
        '&stripe_user[url]=' + userUrl +
        '&stripe_user[business_name]=' + userBusinessName +
        '&stripe_user[product_description]=' + userBusinessDescription;

    res.redirect(uri);
});

router.get('/oauth_callback', function (req, res) {
    if (!req.user) {
        return res.redirect('/');
    }
    var id = req.user.id;

    request.post({
        url: 'https://connect.stripe.com/oauth/token',
        body: 'client_secret=' + process.env.STRIPE_SECRET_KEY +
            '&code=' + req.query.code + '&grant_type=authorization_code'
    }, function (error, response, body) {
        if (error) {
            console.log(error);
            res.redirect('/v/vip/logout');
        }
        else {
            var bodyObj = JSON.parse(body);
            if (bodyObj.error) {
                res.redirect('/v/vip/logout');
            }
            else {
                db.stripeConnectAccountExists(bodyObj.stripe_user_id, id,
                    function (error, result) {
                        if (error) {
                            console.log(error);
                            res.redirect('/v/vip/logout');
                        }
                        else {
                            if (result === false) {
                                db.saveStripeConnectAccount(id, bodyObj,
                                    function (error, results) {
                                        if (error) {
                                            console.log(error);
                                            res.redirect('/v/vip/logout');
                                        }
                                        else if (results) {
                                            res.redirect('/v/vip');
                                        }
                                        else {
                                            res.redirect('/v/vip/logout');
                                        }
                                    }
                                );
                            }
                            else {
                                db.updateStripeConnectAccount(id, bodyObj,
                                    function (error) {
                                        if (error) {
                                            res.redirect('/v/vip/logout');
                                        }
                                        else {
                                            res.redirect('/v/vip');
                                        }
                                    }
                                );
                            }
                        }
                    }
                );
            }
        }
    });
});

/* GET Stripe checkout details */
router.get('/checkout_details', function (req, res) {
    var vipId = req.query.vip_id;
    var minTime = parseInt(process.env.VIP_RATE_INCREMENT_MIN_TIME);

    db.getUserByInstagramId(vipId, function (error, results) {
        if (error) {
            res.send({ error: error.message });
            return;
        }

        var savedUser = results[0];
        if (!savedUser) {
            res.send({ error: 'Cannot find user with Instagram id: ' + vipId });
            return;
        }

        if (!io.isUserOnline(vipId)) {
            var name = savedUser.instagram_full_name + ' (@' + savedUser.instagram_username + ')';

            res.send({ error: 'Sorry, but ' + name + ' has discontinued doing video calls at this moment. No payment has been taken from your card on this occasion' });
            return;
        }

        var rate = savedUser.rate;
        var authCount = savedUser.pay_auth_count;
        var lastPayDate = savedUser.last_pay_date;
        var prevPayDate = savedUser.previous_pay_date;

        if (authCount >= 2 && lastPayDate && prevPayDate) {
            var timeDiff = (moment(lastPayDate).unix() - moment(prevPayDate).unix());

            if (timeDiff < minTime) {
                rate += parseInt(process.env.VIP_RATE_INCREMENT);
            }
        }

        var data = {
            key: process.env.STRIPE_PUBLISHABLE_KEY,
            currency: process.env.STRIPE_CURRENCY,
            amount: rate
        };

        res.end(JSON.stringify(data));
    });
});

router.post('/auth_payment', function (req, res) {
    var vipId = req.body.vip_id;// instagram id of VIP user
    var customerId = req.body.customer_id;
    var paymentMethod = req.body.payment_method_id;
    var amount = parseInt(req.body.amount);
    var fee = amount - parseInt(process.env.VIP_FEE);

    if (!io.isUserOnline(vipId)) {
        db.getUserByInstagramId(vipId, function (error, results) {
            if (error) {
                res.send({ error: error.message });
                return;
            }

            var savedUser = results[0];
            if (!savedUser) {
                res.send({ error: 'Cannot find user with Instagram id: ' + vipId });
                return;
            }

            var name = savedUser.instagram_full_name + ' (@' + savedUser.instagram_username + ')';

            res.send({ error: 'Sorry, but ' + name + ' has discontinued doing video calls at this moment. No payment has been taken from your card on this occasion' });
        });
        return;
    }

    db.getStipeAccountIdByInstagramId(vipId, function (error, results) {
        if (error) {
            res.send({ error: error.message });
            return;
        }

        var rowData = results[0];
        if (rowData) {
            if(req.body.payment_method_id) {
                stripe.paymentIntents.create(
                    {
                        amount: amount,
                        currency: process.env.STRIPE_CURRENCY,
                        application_fee_amount: fee,
                        payment_method: paymentMethod,
                        confirmation_method: 'manual',
                        confirm: true,
                        transfer_data: {
                            destination: rowData.stripe_id
                          }
                    }
                ).then(intent=>{
                    generate_payment_response(intent);
                });
            }
            else if(req.body.payment_intent_id) {
                stripe.paymentIntents.confirm(
                    req.body.payment_intent_id
                ).then(intent=>{
                    generate_payment_response(intent);
                });
            }

            const generate_payment_response = (intent) => {
                if (
                  intent.status === 'requires_action' &&
                  intent.next_action.type === 'use_stripe_sdk'
                ) {
                  // Tell the client to handle the action
                  res.send(
                    {
                        requires_action: true,
                        payment_intent_client_secret: intent.client_secret
                      }
                  );
                } else if (intent.status === 'succeeded') {
                  // The payment didn’t need any additional actions and completed!
                  // Handle post-payment fulfillment
                    db.getUserByInstagramId(vipId, function (error, results) {
                        if (error) {
                            console.log(error);
                            return;
                        }

                        var savedUser = results[0];
                        if (!savedUser) {
                            console.log('Cannot find user with Instagram id: ', vipId);
                            return;
                        }

                        var lastPayDate = savedUser.last_pay_date;
                        var prevPayDate = null;
                        var currentUTCDate = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                        var rate = amount > savedUser.rate ? amount : savedUser.rate;
                        var authCount = savedUser.pay_auth_count + 1;

                        if (lastPayDate) {
                            prevPayDate = lastPayDate;
                        }

                        db.updateUserPay(vipId, rate, currentUTCDate, prevPayDate, authCount,
                            function (error) {
                                if (error) {
                                    console.log(error);
                                }
                            }
                        );
                    });

                    db.paymentExists(intent.payment_method, rowData.stripe_id, function (error, result) {
                        if (error) {
                            res.send({ error: error.message });
                            return;
                        }

                        if (result === false) {
                            db.savePayment(intent.payment_method, rowData.stripe_id, function (error) {
                                if (error) {
                                    res.send({ error: error.message });
                                    return;
                                }

                                res.send({ success: true });
                                io.addToQueue(vipId, customerId, intent.payment_method, rowData.stripe_id);
                            });
                        }
                        else {
                            res.send({ success: true });
                            io.addToQueue(vipId, customerId, intent.payment_method, rowData.stripe_id);
                        }
                    });
                        return {
                            success: true
                        };
                } else {
                  // Invalid status
                    return {
                        error: 'Invalid PaymentIntent status'
                    }
                }
            };
        }
        else {
            res.send({ error: 'VIP Stripe account ID was not found:' + rowData.stripe_id });
        }
    });
});

module.exports = router;