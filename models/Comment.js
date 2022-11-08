// adding problem statment schema 

const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const Comments = new mongoose.Schema({
    commenttext: String, // problem statment 
    user: String, // domain it can be selection or typing
    psId: String, //  technology it to can be selection or typing
     // user name who uploaded that Problem statment
     ProblemS: {
        type: Schema.Types.ObjectId,
        ref: 'ProblemS'

    }
});
  
//Image is a model which has a schema imageSchema
  
const Comment = new mongoose.model('Comment', Comments);
module.exports = Comment;