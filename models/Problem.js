// adding problem statment schema 

const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const ProblemS = new mongoose.Schema({
    ps: String, // problem statment 
    domain: String, // domain it can be selection or typing
    Technology: Array,
//  technology it to can be selection or typing
    TeamName: String, // TeamName if requred also for sercing perpos
    Username: String, // user name who uploaded that Problem statment
    Comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
});
  
//Image is a model which has a schema imageSchema
ProblemS.index({ps:'text', Technology: 'text', TeamName: 'text', domain: 'text'});
const Problem = new mongoose.model('ProblemS', ProblemS);
module.exports = Problem;