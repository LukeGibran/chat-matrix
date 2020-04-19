const express = require('express');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const router = express.Router();
const db = require('../db');

const contactService = process.env.CONTACT_SERVICE;
const contactUser = process.env.CONTACT_USER;
const contactPass = process.env.CONTACT_PASS;

/* const titleHead = process.env.TITLE_HEAD;

router.get('/terms-of-use', function (req, res) {
    res.render('pages/links/terms-of-use', {
        titleHead: titleHead,
        privacyLink: process.env.SERVER + '/l/links/privacy-policy'
    });
});

router.get('/privacy-policy', function (req, res) {
    res.render('pages/links/privacy-policy', { titleHead: titleHead });
});

router.get('/contact', function (req, res) {
    res.render('pages/links/contact', { titleHead: titleHead });
}); */

router.get('/data', function (req, res, next) {
    let user = req.user;

    db.getStipeAccountIdByInstagramId(user.id, function (error, results) {
        if (error) {
            return next(error);
        }

        var row = results[0];

        if (row) {
            /* res.render('pages/links/data', {
                titleHead: titleHead,
                username: user.username,
                fullname: user.full_name,
                id: user.id,
                stripeId: row.stripe_id,
                profilePicture: user.profile_picture
            }); */
            res.send({
                username: user.username,
                fullname: user.full_name,
                id: user.id,
                stripeId: row.stripe_id,
                profilePicture: user.profile_picture
            });
        }
        else {
            // next(new Error('Stripe ID not found for Instagram user: ' + user.username));
            res.send({ error: 'Stripe ID not found for Instagram user: ' + user.username });
        }
    });
});

/* router.get('/vip-terms-and-conditions', function (req, res) {
    res.send('blank');
});

router.get('/vip-video-call-terms-and-conditions', function (req, res) {
    res.send('blank');
}); */

router.post('/contact',
    [
        check('name').isLength({ min: 1 }).withMessage('Name is required'),
        check('email').isEmail().withMessage('Invalid email address'),
        check('message').isLength({ min: 1 }).withMessage('Message is required'),
        sanitizeBody('name').trim().escape(),
        sanitizeBody('email').trim().escape(),
        sanitizeBody('message').trim().escape(),
    ],
    (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // return res.render('pages/links/contact', { titleHead: titleHead, errors: errors.array() });
            return res.send(errors.array());
        }

        let transporter = nodemailer.createTransport({
            service: contactService,
            auth: {
                user: contactUser,
                pass: contactPass
            }
        });

        let mailOptions = {
            from: `"${req.body.name}" <${contactUser}>`,
            to: process.env.CONTACT_USER,
            subject: req.body.subject,
            html: `<b>Email: ${req.body.email}</b><br/> 
            <b>Message:</b><br/>${req.body.message}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                // return res.render('pages/links/contact', { titleHead: titleHead, error: error });
                return res.send(error);
            }

            // res.render('pages/links/contact', { titleHead: titleHead, message: 'Message sent' });
            res.send('Message sent');
            console.log(mailOptions);
        });
    }
);

module.exports = router;