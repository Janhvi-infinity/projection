//js
const User = require("../models/User");
const Project = require("../models/Project")
const bcrypt = require("bcryptjs");
const passport = require("passport");
const fs = require('fs');
const path = require('path');
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
// need to allow only when login
const submitProjectView= (req, res) => {
    if (req.isAuthenticated()){
      res.render("submitProject", {title: "Submit Your Idea"});
    } else {
      res.redirect("/login");
    }
  }
    

// need to allow only when login

const projectDetailsView = (req, res) => {
    res.render("projectDetails", {title: "project Detail"});
}


const registerPost = (req, res) => {
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/login");
          });
        }
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
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/submitProject");
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

const uploads = (req, res, next) => {
  const adsolute = path.join(__dirname, req.file.path);
  const obj = {
      name: req.body.name,
      desc: req.body.desc,
      img: {
          
          data: fs.readFileSync(path.join("D:/projection/uploads/" + req.file.filename)),
          contentType: 'image/png'
      }
  }
  Project.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          // item.save();
          res.redirect('/');
      }
  });
}


module.exports =  {
    registerView,
    loginView,
    submitProjectView,
    projectDetailsView,
    registerPost,
    loginPost,
    logoutview,
    uploads,
};