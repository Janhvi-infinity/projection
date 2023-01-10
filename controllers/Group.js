
const User = require("../models/User");

const Mygroup = async (req , res) => {
    let userId = req.user._id;
    const user = await User.findById(userId);
    const GroupID = user.GroupID ;
    User.find({ GroupID: GroupID}, function(err, foundGroup){
      if (err) {
        console.log(err)  
      } else {
        return res.render('Mygroup', {title: 'Your Group', foundGroup: foundGroup })
      }
    })
  };

  module.exports = {
    Mygroup,
  }