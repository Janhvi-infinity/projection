//js
const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4111;

// Static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
// app.use('/js', express.static(__dirname + 'public/js'))
// app.use('/img', express.static(__dirname + 'public/img'))

// Mongo DB conncetion
const database = process.env.MONGOLAB_URI;
mongoose.connect(database, {useUnifiedTopology: true, useNewUrlParser: true })
.then(() => console.log('e don connect'))
.catch(err => console.log(err));

//BodyParsing
app.use(express.urlencoded({extended: false}));


//Set Templating Engine
app.set('view engine', 'ejs')
// set defoult layout to comman.gjs
app.set('layout', './layout/comman')
app.use(expressLayouts)
//Navigation
app.use('/', require('./routes/routes.js'));
app.get('/', (req, res) => {
    res.render('Home', {title: 'Home Page'})
})

app.listen(PORT, console.log("Server don start for port: " + PORT))