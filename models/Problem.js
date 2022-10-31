// adding problem statment schema 

const mongoose = require('mongoose');
  
const ProblemS = new mongoose.Schema({
    ps: String, // problem statment 
    domain: String, // domain it can be selection or typing
    Technology: String, //  technology it to can be selection or typing
    TeamName: String, // TeamName if requred also for sercing perpos
    Username: String, // user name who uploaded that Problem statment
});
  
//Image is a model which has a schema imageSchema
  
const Problem = new mongoose.model('ProblemStatment', ProblemS);
module.exports = Problem;