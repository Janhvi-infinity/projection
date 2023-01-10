const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
 
  username: {
    type: String,
  },
  Name: {
    type: String,
  },
  PRN: {
    type: Number,
  },

  div: {
    type: String,
    enum: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"],
  },

  GroupID: {
    type : String,
  },

  RollNum: {
    type: Number,
  },

  Role: {
    type : String,
    enum: ["Faculty", "Leader","Students", "Admin"],
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