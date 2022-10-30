const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
 
  password: {
    type: String,
  },
  
  }
);
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);
module.exports = User;