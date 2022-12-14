//js
const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const expressLayouts = require('express-ejs-layouts');
const findOrCreate = require('mongoose-findorcreate');
const cors = require("cors")
const { loginCheck} = require('./auth/passport');
loginCheck(passport);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
// app.use('/js', express.static(__dirname + 'public/js'))
// app.use('/img', express.static(__dirname + 'public/img'))





//Set Templating Engine
app.set('view engine', 'ejs')
// set defoult layout to comman.gjs
app.set('layout', './layout/comman')
app.use(expressLayouts)

// see the additional part

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())


app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
})
// Mongo DB conncetion
const database = process.env.MONGOLAB_URI;
mongoose.connect(database, {useUnifiedTopology: true, useNewUrlParser: true })
.then(() => console.log('e don connect'))
.catch(err => console.log(err));




//Navigation
app.use('/', require('./routes/routes.js'));
// to get current user name
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});

app.listen(PORT, console.log("Server don start for port: " + PORT))