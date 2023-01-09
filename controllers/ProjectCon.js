const project = require('../models/Project')

exports.getProjects = async (req, res) => {
    try {
        // const results = await project.find({})
        // .then((data)=>{
        //     res.send(results);
        // }).catch((err) => {
        //     console.log(err.message)
        //     res.send(err)
        // })

        project.find({}, function (err, Project_Iteams) {
            if (err){
                console.log(err);
            }
            else{
              res.send( Project_Iteams)
            }
        });
          
    } catch (error) {
        console.log(error)
        res.send(error.message)
    }
}


exports.SearchProject = async(req, res) => {
    try {
     let searchTerm = req.body.searchTerm;
     let projects= await project.find( { $text: { $search: searchTerm, $diacriticSensitive: true}} );
     res.json({projects})
 } catch (error) {
   res.json({"error":error});
 }    
 }