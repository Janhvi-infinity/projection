 
const mongoose = require('mongoose');
  
const ProjectsSchema = new mongoose.Schema({
    ProblemS: String,
    FF180:
    {
        data: Buffer,
        contentType: String
    },
    
    
});
  
//Image is a model which has a schema imageSchema
  
const ProjectItem = new mongoose.model('Projects', ProjectsSchema);
module.exports = ProjectItem;