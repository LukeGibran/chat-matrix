var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../db');
// var indexPath = path.join(
//     __dirname, 
//     '../../dist/index.html'
// );

// if (process.env.NODE_ENV === 'development') {
//     indexPath = path.join(
//         __dirname, 
//         '../../../' + process.env.FRONTEND_PATH + '/index.html'
//     );
// }

// router.get('/', function (req, res) {
//     console.log('/ route');
//     res.send('okay');
// });
var indexPath = path.join(
    __dirname, 
    '../../../' + process.env.FRONTEND_PATH + '/index.html'
);

router.get('/u/info/:username', function (req, res) {
    var username = req.params.username;

    db.getUserByInstagramUsername(username, function (error, results) {
        if (error) {
            return res.send({ error: error.message });
        }

        var row = results[0];
        if (row) {
            res.send(row);
        }
        else {
            res.send({ error: 'VIP user \'' + username + '\' not found' });
        }
    });
});

router.get('/*', function (req, res) {
    res.sendFile(indexPath);
});

module.exports = router;
