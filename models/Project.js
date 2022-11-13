
  
const mongoose = require('mongoose');
  
const imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    },
    
});
  
//Image is a model which has a schema imageSchema
  
const project = new mongoose.model('Image', imageSchema);
module.exports = project;