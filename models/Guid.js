const mongoose = require('mongoose');
const GuidSchema = new mongoose.Schema({
    GroupID: {
        type: [String],
        enum: ["AO1","A02", "A03" ],
        
    },
    Subject: {
        type : [String],
        enum: ["PSAP","Mathamatics"],
    
},
       
});

module.exports = mongoose.model('Guid', GuidSchema);