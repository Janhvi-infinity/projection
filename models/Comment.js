// adding problem statment schema 

const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const Comments = new mongoose.Schema({
    commenttext: String, // problem statment 
    user: String, // user from present login information no need to type
    psId: String, //  it is from get req method
     // user name who uploaded that Problem statment
    firstname: String,
     ProblemS: {
        type: Schema.Types.ObjectId,
        ref: 'ProblemS'

    }
});
  
//Image is a model which has a schema imageSchema
  
const Comment = new mongoose.model('Comment', Comments);
module.exports = Comment;