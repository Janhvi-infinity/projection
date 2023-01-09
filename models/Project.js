
  
const mongoose = require('mongoose');
var conn2 = mongoose.createConnection('mongodb+srv://janhvi:lHOS8l7Bm6dFol7M@cluster0.vbdsq.mongodb.net/test');
  
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
  

projectSchema.index({Title:'text', Technology: 'text', Tool: 'text', domain: 'text' ,Keyword:'text', Description:'text' });
//Image is a model which has a schema imageSchema
const project = conn2.model('Images', projectSchema);
module.exports = project;