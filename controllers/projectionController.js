//js
const User = require("../models/User");
const bcrypt = require("bcryptjs");


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
    res.render("submitProject", {title: "Submit Your Idea"});
}
// need to allow only when login

const projectDetailsView = (req, res) => {
    res.render("projectDetails", {title: "Submit Your Idea"});
}

module.exports =  {
    registerView,
    loginView,
    submitProjectView,
    projectDetailsView,
};