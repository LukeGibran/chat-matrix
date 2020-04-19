const express = require('express');
const router = express.Router();

router.get('/ip', function (req, res) {
    res.end(req.clientIp);
});

module.exports = router;