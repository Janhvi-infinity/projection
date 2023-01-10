const mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
    GroupID: {
        type: String,
        required: 'This fild is required. '
    },
    leader: {
        //PRN
        type: Number,
        //default: first member
    },
    Members: {
        //PRN Array
        type: [Number],
        required: 'This fild is required. '
    },
    Subject: {
            type : [String],
            enum: ["PSAP","RMAE","MAD"],
            default: ["PSAP","RMAE","MAD"],
        
    },
       
});

module.exports = mongoose.model('Group', GroupSchema);