
  
const mongoose = require('mongoose');
  
const projectSchema = new mongoose.Schema({
   
    Title: {
        type: String,
    },
    Description: {
        type: String,
    },
    Domain: {
        type: String,
        enum: ["Agriculture" , "Defense" , "Health Care", "Smart City",  "Smart Energy", "Security Systems", "Automobile", "Space", "Green Earth", "Assistive Aid", "Water Management", "Swachh Bharat", "Education","Environment",],
    },
    Keyword: {
        type: Array,
    },
    Tool: {
        type : [String],
        enum: ["Agriculture" , "Defense" , "Health Care", "Smart City",  "Smart Energy", "Security Systems", "Automobile", "Space", "Green Earth", "Assistive Aid", "Water Management", "Swachh Bharat", "Education","Environment",],

        
    },
    Technology: {
        type : [String],
        enum: ["Agriculture" , "Defense" , "Health Care", "Smart City",  "Smart Energy", "Security Systems", "Automobile", "Space", "Green Earth", "Assistive Aid", "Water Management", "Swachh Bharat", "Education","Environment",],

    },
    img:
    {
        data: Buffer,
        contentType: String
    },
    
});
  
//Image is a model which has a schema imageSchema
  
const project = new mongoose.model('Images', projectSchema);
module.exports = project;