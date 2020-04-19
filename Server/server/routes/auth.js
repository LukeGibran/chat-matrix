var express = require('express');
var router = express.Router();
var passport = require('passport');
'use strict';
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');

var createToken = function(auth) {
    return jwt.sign({
      id: auth.id
    }, 'my-secret',
    {
      expiresIn: 60 * 120
    });
  };
  
  var generateToken = function (req, res, next) {
    req.token = createToken(req.auth);
    return next();
  };
  
  var sendToken = function (req, res) {
    res.setHeader('x-auth-token', req.token);
    return res.status(200).send(JSON.stringify(req.user));
  };
  

  
  
  //token handling middleware
  var authenticate = expressJwt({
    secret: 'my-secret',
    requestProperty: 'auth',
    getToken: function(req) {
      if (req.headers['x-auth-token']) {
        return req.headers['x-auth-token'];
      }
      return null;
    }
  });

module.exports = router;
// to redirect after login 
/* 
        successRedirect: '/v/vip/vip_confirm',
        failure: '/a/auth/instagram/auth_failed'
        */