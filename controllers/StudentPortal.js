const findOrCreate = require('mongoose-findorcreate');

const Project = require("../models/Project");

// need to allow only when login
const submitProjectView= (req, res) => {
    if (req.isAuthenticated()){
      res.render("submitProject", {title: "Submit Your Idea"});
    } else {
      res.redirect("/login");
    }
  }

const uploads = (req, res, next) => {

    const obj = {
        Title: req.body.Title,
        Description: req.body.Description,
        Domain: req.body.Domain,
        Keyword: req.body.Keyword,
        Tool: req.body.Tool,
        Technology: req.body.Technology,
        img: {
            data: fs.readFileSync(path.join("D:/projection/uploads/" + req.file.filename)),
            contentType: 'image/jpg'
        },
        
    }
    Project.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
}



module.exports = {
    submitProjectView,
    uploads,

  }