
  
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
        enum: [ "Artificial Intelligence" , "Robotics", "Cloud Computing","Energy Technology", "Nanotechnology", "Internet of Things", "Embeded Systems", "Cyber Security", "3D Printing",
            "Big data", "Automation & Control", "Wireless Power","Health Science", "Clean Technology",
            "Photo Voltaic", "Energy Storage",  "Waste Management", "Biomedical Technology", "Food Technology", "Signal Processing", "Image Processing",  "Energy Harvesting", "Human Machine Interface", "Machine Learning",
            "Block Chain", "Augmented & Virtual Reality", "Web Technology"],

    },
    img:
    {
        data: Buffer,
        contentType: String
    },
    Subject: {
        type : String,
        enum: ["PSAP","RMAE","MAD"],
        default: "PSAP",
    },

    GroupID: {
        type: String,
        default: "A01"
        
    }
});
  

projectSchema.index({Title:'text', Technology: 'text', Tool: 'text', domain: 'text' ,Keyword:'text', Description:'text' });
//Image is a model which has a schema imageSchema
const project = conn2.model('Images', projectSchema);
module.exports = project;