var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var io = require('../io');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const directory = __dirname + '../../../uploads/profile';
        
        // Use the path on the base root of the application for the
        // image stored for chatting application
        callback(null, directory);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({ storage: storage }).single('profile');

// var titleHead = process.env.TITLE_HEAD;
// var title = process.env.TITLE;

/* GET chat page. */
/* router.get('/', function (req, res) {
    if (req.user) {
        res.redirect('/v/vip');
        return;
    }
    res.render('pages/chat', { titleHead: titleHead, title: title });
}); */

/* GET profile picture */
router.get('/profile', function (req, res) {
    var img = null;
    var filename = req.query.filename ? req.query.filename :
        req.user.username + '_' + req.user.id;

    try {
        img = fs.readFileSync('./uploads/profile/' + filename);
        res.setHeader('Content-Type', 'image/jpeg');
        res.end(img, 'binary');
    }
    catch (error) {
        res.end('error');
    }
});

/* GET chat with VIP user */
/* router.get('/vip', function (req, res) {
    res.render('pages/chat', { titleHead: titleHead, title: title });
}); */

router.get('/users', function (req, res) {
    // res.send({ users: io.getConnectedUsers() });
    res.send(io.getConnectedUsers());
});

/* POST upload profile picture */
router.post('/profile', function (req, res) {
    upload(req, res, function (error) {
        if (error) {
            return res.end('error');
        }
        /*var img = fs.readFileSync('./uploads/profile/'+req.file.filename);
        nude.scan(img, function(error){
            res.end(error);
        }); */
        res.end('success');
    });
});

module.exports = router;