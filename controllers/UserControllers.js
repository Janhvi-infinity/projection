const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');


//For Register Page
const registerView = (req, res) => {
    res.render("register", {title: 'Registration Page'} );
}

// For View 
const loginView = (req, res) => {

    res.render("login", {title: "Login"} );
}

const registerPost = (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if(err) {
     return res.status(500).json({err:err});
    }
    if(req.body.Name){
     user.Name = req.body.Name;
    }
    if (req.body.lastname) {
     user.lastname = req.body.lastname;
    }
    user.save(function(err, user){
     passport.authenticate('local')(req, res, function(){
      return res.redirect("/login");
     });
    });
    });
     
  }



const loginPost = (req, res) => {

const user = new User({
    username: req.body.username,
    password: req.body.password
});

req.login(user, function(err){
    if (err) {
    console.log(err);
    res.redirect("/register")
    } else {
    passport.authenticate("local")(req, res, function(){
        res.redirect("/")
    });
    }
});



}

const logoutview = (req, res, next) => {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
        }
      res.redirect('/');
    });
  }

  
module.exports =  {
    registerView,
    loginView,
    registerPost,
    loginPost,
    logoutview,

}