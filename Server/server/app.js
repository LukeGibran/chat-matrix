var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
// var logger = require('morgan');
util = require("util");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var nocache = require("nocache");
var cors = require("cors");
var session = require("express-session");
var passport = require("passport");
var MySQLStore = require("express-mysql-session")(session);
var requestIp = require("request-ip");

require("dotenv").config({ path: "variables.env" });

var db = require("./db");

var index = require("./routes/index");
var chat = require("./routes/chat");
var auth = require("./routes/auth");
var vip = require("./routes/vip");
var stripe = require("./routes/stripe");
var links = require("./routes/links");
var client = require("./routes/client");

var app = express();

// Prevent client side cache
app.use(nocache());

// session store
var sessionStore = new MySQLStore({}, db.getConnection());

// connect to MySQL database server
db.connect();

// session
app.use(
  session({
    secret: "XTu6).p5X3j}XmW$H=o{NB&F>@sSZk",
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, "../uploads")));

var clientRootPath =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../../" + process.env.FRONTEND_PATH)
    : path.join(__dirname, "../Client/dist");

app.use(express.static(clientRootPath));

app.use(requestIp.mw());

app.use((req, res, next) => {
  // const { socket } = req;

  // socket && (socket.logout = req.logOut);
  //req.socket.logout = req.logout;
  next();
});

// redirect HTTP to HTTPS
app.use(function (req, res, next) {
  if (req.secure) {
    next();
  } else {
    res.redirect("https://" + req.headers.host + req.url);
  }
});

app.use("/c/chat", chat);
app.use("/a/auth", auth);

if (process.env.HAS_VIP_FUNCTIONALITY) {
  app.use("/v/vip", vip);
  app.use("/s/stripe", stripe);
}

app.use("/l/links", links);
app.use("/c/client", client);
app.use("/", index);

app.get("/", function (req, res, next) {
  // Handle the get for this route
});

app.use(cors());

app.listen(process.env.PORT_HTTPS, "0.0.0.0");
console.log("Running app at: " + process.env.SERVER);

module.exports = app;
