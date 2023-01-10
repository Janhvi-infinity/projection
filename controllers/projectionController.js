//js
const User = require("../models/User");
const Project = require("../models/Project");
const Problem = require("../models/Problem");
const Comment = require("../models/Comment");
const ProjectItem = require("../models/Projects");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const Group = require("../models/Group");
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { title } = require("process");


//home page
const Home = (req, res) => {
  Project.find({}, function(err, tumnail){
    if (err) {
      console.log(err)  
    } else {
      res.render('Home', {title: 'Home Page', tumnail:tumnail })
    }
  })
}
// For adding problem statment 
const addPS = (req, res) => {
  res.render("addPS", {title: 'Add your Problem Statment', user: req.user});
}

const addPSpost = (req, res) => {
  const obj = {
      ps: req.body.ps,
      domain: req.body.domain,
      Technology: req.body.Technology,
      TeamName: req.body.TeamName,
      Username: req.user.username,
      
  }
  Problem.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          // item.save();
          // res.redirect('/');
          res.json({done:true})
      }
  });
}

const PSView = (req, res) => {
  if (req.isAuthenticated()){
    
    
      Problem.find({}, function(err, ps){
        if (err) {
          console.log(err)  
        } else {
          res.render("SeePS", {title: "Problem Statment Display", ps: ps});
        }
      }) 
  } else {
    res.redirect("/login");
  }
}

// problem statment full pape view more mage
const PSDetailView = (req, res) => {
  
  res.render("PSDetails", {title: "Problem Statment Display", user: req.user });

}

const problemstatmentinfo = async(req, res) => {
  try {
    let problemId = req.params.id;
    const problem = await Problem.findById(problemId);
    const problemid = problem._id + " "
    Comment.find({ psId: problemid}, function (err, docs) {
      if (err){
          console.log(err);
      }
      else{
  
        res.render('PSDetails', {title: "problem statment details",problem: problem,user: req.user , docs : docs}) 
      }
  });
    
  } catch (error) {
    res.send({message: error.message || "Error Occured" });
  }  
}
const postcomment= async(req, res) => {
  
  const obj = {
    commenttext: req.body.comment,
    firstname: req.body.firstname,
    user: req.body.user_id,
    psId: req.body.post_id,
    
}
Comment.create(obj, (err, item) => {
    if (err) {
        console.log(err);
    }
    else {
        // item.save();
        res.redirect(".");
    }
});
}


//For Register Page
const registerView = (req, res) => {
    res.render("register", {title: 'Registration Page'} );
}
// For View 
const loginView = (req, res) => {

    res.render("login", {title: "Login"} );
}
// need to allow only when login
const submitProjectView= (req, res) => {
    if (req.isAuthenticated()){
      res.render("submitProject", {title: "Submit Your Idea"});
    } else {
      res.redirect("/login");
    }
  }
    

// need to allow only when login

const projectDetailsView = (req, res) => {
  if (req.isAuthenticated()){
    res.render("projectDetails", {title: "project Detail"});
    
  } else {
    res.redirect("/login");
  }
    
}


const registerPost = (req, res) => {
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
  if(err) {
   return res.status(500).json({err:err});
  }
  if(req.body.Name){
   user.Name = req.body.Name;
  }
  if (req.body.lastname) {
   user.lastname = req.body.lastname;
  }
  user.save(function(err, user){
   passport.authenticate('local')(req, res, function(){
    return res.redirect("/login");
   });
  });
  });
   
}


const loginPost = (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/")
      });
    }
  });

}

const logoutview = (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      return next(err); 
      }
    res.redirect('/');
  });
}


// search problem statment
const SearchPS = async(req, res) => {
   //  searchTerm
   try {
    let searchTerm = req.body.searchTerm;
    let psStatment = await Problem.find( { $text: { $search: searchTerm, $diacriticSensitive: true}} );
    res.render('search' , {title: 'Projecto-Search' , psStatment: psStatment  });
    // res.json(psStatment);
} catch (error) {
    res.send({message: error.message || "Error Occured" });
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

const googleauthS = (req, res) => {
  // Successful authentication, 
  res.redirect("/");
};

verifyUser = (req, res, next) => {
  User.findOne({
    confirmationCode: req.params.confirmationCode,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      user.status = "Active";
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
    })
  }


  
  /***************Start Individual Project Page******************************* */

  const Projects = (req, res) => {
    ProjectItem.find({}, function (err, Project_Iteams) {
      if (err){
          console.log(err);
      }
      else{
  
        res.render("Projects", {title: "Projects", Project_Iteams: Project_Iteams }) 
      }
  });
    
  };

  const postProblemStatment= async(req, res) => {
  
    const obj = {
      ProblemS: req.body.Problem_Statment,
       
  }
  ProjectItem.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect(".");
        }
    });
  };

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
  

   

  const Myproject = (req, res) => {
    Project.findOne({GroupID: req.params.groupID, Subject: "PSAP"}, function(err , foundProject){
      if (foundProject) {
        res.send(foundProject);
      } else{
        res.send("no project mathing to your group or this subject");
      }
    })
  };

  

  const FF180 = (req, res, next) => {
    
    const obj = {
      FF180: {
            data: fs.readFileSync(path.join("D:/projection/uploads/" + req.file.filename)),
            contentType: 'application/pdf'
        },
        
    }
    ProjectItem.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
  };


  const userData = async (req,res) => {
    try {
        let udata = [  
          
            
              {
                "RollNum": 1,
                "div": "A",
                "PRN": 12211208,
                "Name": "AADITYA AGRAWAL",
                "username": "agrawal.aaditya22@vit.edu",
                "GroupID": "A01",
                "Role": "Students",
                "password": "12211208"
              },
              {
                "RollNum": 2,
                "div": "A",
                "PRN": 12210018,
                "Name": "AAGAM AMOL KOTHARI",
                "username": "aagam.kothari22@vit.edu",
                "GroupID": "A01",
                "Role": "Students",
                "password": "12210018"
              },
              {
                "RollNum": 3,
                "div": "A",
                "PRN": 12210022,
                "Name": "AARYA JITENDRA GAVASKAR",
                "username": "aarya.gavaskar22@vit.edu",
                "GroupID": "A01",
                "Role": "Students",
                "password": "12210022"
              },
              {
                "RollNum": 4,
                "div": "A",
                "PRN": 12210186,
                "Name": "AAYUSH PRAMOD CHAVAN",
                "username": "aayush.chavan22@vit.edu",
                "GroupID": "A01",
                "Role": "Students",
                "password": "12210186"
              },
              {
                "RollNum": 5,
                "div": "A",
                "PRN": 12210674,
                "Name": "Aayush sandeep gadiya",
                "username": "aayush.gadiya22@vit.edu",
                "GroupID": "A01",
                "Role": "Students",
                "password": "12210674"
              },
              {
                "RollNum": 6,
                "div": "A",
                "PRN": 12210528,
                "Name": "ABHISHEK SANTOSH GUHAGARKAR",
                "username": "abhishek.guhagarkar22@vit.edu",
                "GroupID": "A01",
                "Role": "Students",
                "password": "12210528"
              },
              {
                "RollNum": 7,
                "div": "A",
                "PRN": 12210063,
                "Name": "ABNAVE SAIRAJ GANESH",
                "username": "sairaj.abnave22@vit.edu",
                "GroupID": "A02",
                "Role": "Students",
                "password": "12210063"
              },
              {
                "RollNum": 8,
                "div": "A",
                "PRN": 12210428,
                "Name": "ADAKI ADITYA MADHUKAR",
                "username": "aditya.adaki22@vit.edu",
                "GroupID": "A02",
                "Role": "Students",
                "password": "12210428"
              },
              {
                "RollNum": 9,
                "div": "A",
                "PRN": 12210225,
                "Name": "ADAKE SWAPNIL ANANDRAO",
                "username": "swapnil.adake22@vit.edu",
                "GroupID": "A02",
                "Role": "Students",
                "password": "12210225"
              },
              {
                "RollNum": 10,
                "div": "A",
                "PRN": 12210890,
                "Name": "ADHAV AMIT KESHAV",
                "username": "amit.adhav22@vit.edu",
                "GroupID": "A02",
                "Role": "Students",
                "password": "12210890"
              },
              {
                "RollNum": 11,
                "div": "A",
                "PRN": 12210197,
                "Name": "ADITI BHAT",
                "username": "bhat.aditi22@vit.edu",
                "GroupID": "A02",
                "Role": "Students",
                "password": "12210197"
              },
              {
                "RollNum": 12,
                "div": "A",
                "PRN": 12210384,
                "Name": "Aditya Bansul",
                "username": "aditya.bansul22@vit.edu",
                "GroupID": "A02",
                "Role": "Students",
                "password": "12210384"
              },
              {
                "RollNum": 13,
                "div": "A",
                "PRN": 12211115,
                "Name": "ADITYA BIHANI",
                "username": "bihani.aditya22@vit.edu",
                "GroupID": "A03",
                "Role": "Students",
                "password": "12211115"
              },
              {
                "RollNum": 14,
                "div": "A",
                "PRN": 12210297,
                "Name": "ADITYA SHIRISH DEORE",
                "username": "aditya.deore22@vit.edu",
                "GroupID": "A03",
                "Role": "Students",
                "password": "12210297"
              },
              {
                "RollNum": 15,
                "div": "A",
                "PRN": 12210635,
                "Name": "ADSUL ATHARVA PRAVIN",
                "username": "atharva.adsul22@vit.edu",
                "GroupID": "A03",
                "Role": "Students",
                "password": "12210635"
              },
              {
                "RollNum": 16,
                "div": "A",
                "PRN": 12210817,
                "Name": "AGAWANE SHREYASH NITIN",
                "username": "shreyash.agawane22@vit.edu",
                "GroupID": "A03",
                "Role": "Students",
                "password": "12210817"
              },
              {
                "RollNum": 17,
                "div": "A",
                "PRN": 12210244,
                "Name": "AGONE BHAVESH CHANDRABHAN",
                "username": "bhavesh.agone22@vit.edu",
                "GroupID": "A03",
                "Role": "Students",
                "password": "12210244"
              },
              {
                "RollNum": 18,
                "div": "A",
                "PRN": 12211589,
                "Name": "AGRAWAL SHIVEN MUKESH",
                "username": "shiven.agrawal22@vit.edu",
                "GroupID": "A03",
                "Role": "Students",
                "password": "12211589"
              },
              {
                "RollNum": 19,
                "div": "A",
                "PRN": 12210037,
                "Name": "AHMAD ALI SAYYED",
                "username": "ahmadali.sayyed22@vit.edu",
                "GroupID": "A04",
                "Role": "Students",
                "password": "12210037"
              },
              {
                "RollNum": 20,
                "div": "A",
                "PRN": 12210030,
                "Name": "AHUJA MAYANK JITENDRA",
                "username": "mayank.ahuja22@vit.edu",
                "GroupID": "A04",
                "Role": "Students",
                "password": "12210030"
              },
              {
                "RollNum": 21,
                "div": "A",
                "PRN": 12210125,
                "Name": "AJGAONKAR DURVA RAJESH",
                "username": "durva.ajgaonkar22@vit.edu",
                "GroupID": "A04",
                "Role": "Students",
                "password": "12210125"
              },
              {
                "RollNum": 22,
                "div": "A",
                "PRN": 12210418,
                "Name": "AKASH GOPAL CHIMKAR",
                "username": "gopal.akash22@vit.edu",
                "GroupID": "A04",
                "Role": "Students",
                "password": "12210418"
              },
              {
                "RollNum": 23,
                "div": "A",
                "PRN": 12211252,
                "Name": "AKSHAJ NIRMAL KANT",
                "username": "akshaj.kant22@vit.edu",
                "GroupID": "A04",
                "Role": "Students",
                "password": "12211252"
              },
              {
                "RollNum": 24,
                "div": "A",
                "PRN": 12211189,
                "Name": "ALANDKAR MANTHAN AVINASH",
                "username": "manthan.alandkar22@vit.edu",
                "GroupID": "A05",
                "Role": "Students",
                "password": "12211189"
              },
              {
                "RollNum": 25,
                "div": "A",
                "PRN": 12210753,
                "Name": "ALANKAR SATISH JAGTAP",
                "username": "alankar.jagtap22@vit.edu",
                "GroupID": "A05",
                "Role": "Students",
                "password": "12210753"
              },
              {
                "RollNum": 26,
                "div": "A",
                "PRN": 12211464,
                "Name": "AMAY PATEL",
                "username": "amay.patel22@vit.edu",
                "GroupID": "A05",
                "Role": "Students",
                "password": "12211464"
              },
              {
                "RollNum": 27,
                "div": "A",
                "PRN": 12210734,
                "Name": "AMBADKAR VRUSHAB RAJESH",
                "username": "vrushab.ambadkar22@vit.edu",
                "GroupID": "A05",
                "Role": "Students",
                "password": "12210734"
              },
              {
                "RollNum": 28,
                "div": "A",
                "PRN": 12211627,
                "Name": "AMBARISH ANIMESH SINGH",
                "username": "animesh.ambarish22@vit.edu",
                "GroupID": "A05",
                "Role": "Students",
                "password": "12211627"
              },
              {
                "RollNum": 29,
                "div": "A",
                "PRN": 12210503,
                "Name": "AMBILWADE ANIKET KASHINATH",
                "username": "aniket.ambilwade22@vit.edu",
                "GroupID": "A05",
                "Role": "Students",
                "password": "12210503"
              },
              {
                "RollNum": 30,
                "div": "A",
                "PRN": 12210473,
                "Name": "Amit Naphade",
                "username": "amit.naphade22@vit.edu",
                "GroupID": "A06",
                "Role": "Students",
                "password": "12210473"
              },
              {
                "RollNum": 31,
                "div": "A",
                "PRN": 12210815,
                "Name": "ANAND ASIT SANKET",
                "username": "asit.anand22@vit.edu",
                "GroupID": "A06",
                "Role": "Students",
                "password": "12210815"
              },
              {
                "RollNum": 32,
                "div": "A",
                "PRN": 12211393,
                "Name": "ANANYA SHARMA",
                "username": "ananya.sharma22@vit.edu",
                "GroupID": "A06",
                "Role": "Students",
                "password": "12211393"
              },
              {
                "RollNum": 33,
                "div": "A",
                "PRN": 12210310,
                "Name": "ANDHALE ADITYA BAPURAO",
                "username": "aditya.andhare22@vit.edu",
                "GroupID": "A06",
                "Role": "Students",
                "password": "12210310"
              },
              {
                "RollNum": 34,
                "div": "A",
                "PRN": 12210102,
                "Name": "ANDRASKAR SHRUTI TULSHIDAS",
                "username": "shruti.andraskar22@vit.edu",
                "GroupID": "A06",
                "Role": "Students",
                "password": "12210102"
              },
              {
                "RollNum": 35,
                "div": "A",
                "PRN": 12210861,
                "Name": "ANDURE SIDHANT DATTATRAYA",
                "username": "sidhant.andure22@vit.edu",
                "GroupID": "A06",
                "Role": "Students",
                "password": "12210861"
              },
              {
                "RollNum": 36,
                "div": "A",
                "PRN": 12210725,
                "Name": "ANIKETH PALA",
                "username": "aniketh.pala22@vit.edu",
                "GroupID": "A07",
                "Role": "Students",
                "password": "12210725"
              },
              {
                "RollNum": 37,
                "div": "A",
                "PRN": 12211542,
                "Name": "ANISH AJAY NAPHADE",
                "username": "ajay.anish22@vit.edu",
                "GroupID": "A07",
                "Role": "Students",
                "password": "12211542"
              },
              {
                "RollNum": 38,
                "div": "A",
                "PRN": 12210526,
                "Name": "ANISH AKSHAY DESAI",
                "username": "akshay.anish22@vit.edu",
                "GroupID": "A07",
                "Role": "Students",
                "password": "12210526"
              },
              {
                "RollNum": 39,
                "div": "A",
                "PRN": 12210168,
                "Name": "Anjali Wakhure",
                "username": "anjali.wakhure22@vit.edu",
                "GroupID": "A07",
                "Role": "Students",
                "password": "12210168"
              },
              {
                "RollNum": 40,
                "div": "A",
                "PRN": 12211363,
                "Name": "ANSH MORESHWAR CHAHARE",
                "username": "moreshwar.ansh22@vit.edu",
                "GroupID": "A07",
                "Role": "Students",
                "password": "12211363"
              },
              {
                "RollNum": 41,
                "div": "A",
                "PRN": 12211394,
                "Name": "ANSINGKAR ATHARVA AJAY",
                "username": "atharva.ansingkar22@vit.edu",
                "GroupID": "A07",
                "Role": "Students",
                "password": "12211394"
              },
              {
                "RollNum": 42,
                "div": "A",
                "PRN": 12211800,
                "Name": "ANUBHAV PANDEY",
                "username": "anubhav.pandey221@vit.edu",
                "GroupID": "A08",
                "Role": "Students",
                "password": "12211800"
              },
              {
                "RollNum": 43,
                "div": "A",
                "PRN": 12211784,
                "Name": "ANUBRAT CHATTERJEE",
                "username": "chatterjee.anubrat22@vit.edu",
                "GroupID": "A08",
                "Role": "Students",
                "password": "12211784"
              },
              {
                "RollNum": 44,
                "div": "A",
                "PRN": 12211645,
                "Name": "ANUJ MAHAJAN",
                "username": "anuj.mahajan22@vit.edu",
                "GroupID": "A08",
                "Role": "Students",
                "password": "12211645"
              },
              {
                "RollNum": 45,
                "div": "A",
                "PRN": 12211484,
                "Name": "ANURAG CHATTERJEE",
                "username": "chatterjee.anurag22@vit.edu",
                "GroupID": "A08",
                "Role": "Students",
                "password": "12211484"
              },
              {
                "RollNum": 46,
                "div": "A",
                "PRN": 12210542,
                "Name": "ANUSHKA BHAGCHAND WAGHMARE",
                "username": "anushka.waghmare22@vit.edu",
                "GroupID": "A08",
                "Role": "Students",
                "password": "12210542"
              },
              {
                "RollNum": 47,
                "div": "A",
                "PRN": 12210709,
                "Name": "ANUSHKA SURESH VARPE",
                "username": "suresh.anushka22@vit.edu",
                "GroupID": "A09",
                "Role": "Students",
                "password": "12210709"
              },
              {
                "RollNum": 48,
                "div": "A",
                "PRN": 12210249,
                "Name": "APURV ARUN WAGHMARE",
                "username": "apurv.waghmare22@vit.edu",
                "GroupID": "A09",
                "Role": "Students",
                "password": "12210249"
              },
              {
                "RollNum": 49,
                "div": "A",
                "PRN": 12210523,
                "Name": "ARGADE ADVAY SACHIN",
                "username": "advay.argade22@vit.edu",
                "GroupID": "A09",
                "Role": "Students",
                "password": "12210523"
              },
              {
                "RollNum": 50,
                "div": "A",
                "PRN": 12210069,
                "Name": "ARGADE AMOD ANANT",
                "username": "amod.argade22@vit.edu",
                "GroupID": "A09",
                "Role": "Students",
                "password": "12210069"
              },
              {
                "RollNum": 51,
                "div": "A",
                "PRN": 12211650,
                "Name": "ARMAN RIYAJ TAMBOLI",
                "username": "arman.tamboli22@vit.edu",
                "GroupID": "A09",
                "Role": "Students",
                "password": "12211650"
              },
              {
                "RollNum": 52,
                "div": "A",
                "PRN": 12211705,
                "Name": "AROLE SAMARTH PRASHANT",
                "username": "samarth.arole22@vit.edu",
                "GroupID": "A09",
                "Role": "Students",
                "password": "12211705"
              },
              {
                "RollNum": 53,
                "div": "A",
                "PRN": 12211225,
                "Name": "ARYA ALURKAR",
                "username": "alurkar.arya22@vit.edu",
                "GroupID": "A10",
                "Role": "Students",
                "password": "12211225"
              },
              {
                "RollNum": 54,
                "div": "A",
                "PRN": 12211739,
                "Name": "ARYA LOKHANDE",
                "username": "lokhande.arya22@vit.edu",
                "GroupID": "A10",
                "Role": "Students",
                "password": "12211739"
              },
              {
                "RollNum": 55,
                "div": "A",
                "PRN": 12211337,
                "Name": "ARYA MANOJKUMAR MANE",
                "username": "manojkumar.arya221@vit.edu",
                "GroupID": "A10",
                "Role": "Students",
                "password": "12211337"
              },
              {
                "RollNum": 56,
                "div": "A",
                "PRN": 12211199,
                "Name": "ARYAN KAMALAKANT MORE",
                "username": "kamalakant.aryan22@vit.edu",
                "GroupID": "A10",
                "Role": "Students",
                "password": "12211199"
              },
              {
                "RollNum": 57,
                "div": "A",
                "PRN": 12211487,
                "Name": "ARYAN MUNDRA",
                "username": "mundra.aryan22@vit.edu",
                "GroupID": "A10",
                "Role": "Students",
                "password": "12211487"
              },
              {
                "RollNum": 58,
                "div": "A",
                "PRN": 12210690,
                "Name": "ARYAN PRAVIN MENGAWADE",
                "username": "aryan.mengawade22@vit.edu",
                "GroupID": "A10",
                "Role": "Students",
                "password": "12210690"
              },
              {
                "RollNum": 59,
                "div": "A",
                "PRN": 12211253,
                "Name": "ASALKAR ATHARV MAHADEV",
                "username": "atharv.asalkar22@vit.edu",
                "GroupID": "A11",
                "Role": "Students",
                "password": "12211253"
              },
              {
                "RollNum": 60,
                "div": "A",
                "PRN": 12211488,
                "Name": "ASHISH SANJIV RODI",
                "username": "sanjiv.ashish22@vit.edu",
                "GroupID": "A11",
                "Role": "Students",
                "password": "12211488"
              },
              {
                "RollNum": 61,
                "div": "A",
                "PRN": 12210255,
                "Name": "ASHLESHA SANTOSH WAGH",
                "username": "ashlesha.wagh22@vit.edu",
                "GroupID": "A11",
                "Role": "Students",
                "password": "12210255"
              },
              {
                "RollNum": 62,
                "div": "A",
                "PRN": 12211244,
                "Name": "ATHARVA ANANT MURMURE",
                "username": "anant.atharva22@vit.edu",
                "GroupID": "A11",
                "Role": "Students",
                "password": "12211244"
              },
              {
                "RollNum": 63,
                "div": "A",
                "PRN": 12210625,
                "Name": "ATHARVA ASHISH GORE",
                "username": "atharva.gore22@vit.edu",
                "GroupID": "A11",
                "Role": "Students",
                "password": "12210625"
              },
              {
                "RollNum": 64,
                "div": "A",
                "PRN": 12211377,
                "Name": "ATHARVA DEEPAK SHINDE",
                "username": "atharva.shinde22@vit.edu",
                "GroupID": "A11",
                "Role": "Students",
                "password": "12211377"
              },
              {
                "RollNum": 65,
                "div": "A",
                "PRN": 12211416,
                "Name": "ATHARVA DHUMAL",
                "username": "dhumal.atharva22@vit.edu",
                "GroupID": "A12",
                "Role": "Students",
                "password": "12211416"
              },
              {
                "RollNum": 66,
                "div": "A",
                "PRN": 12211499,
                "Name": "ATHARVA RAJESH NEHETE",
                "username": "rajesh.atharva221@vit.edu",
                "GroupID": "A12",
                "Role": "Students",
                "password": "12211499"
              },
              {
                "RollNum": 67,
                "div": "A",
                "PRN": 12210260,
                "Name": "ATHARVA SHEKHAR DESHMUKH",
                "username": "atharva.deshmukh221@vit.edu",
                "GroupID": "A12",
                "Role": "Students",
                "password": "12210260"
              },
              {
                "RollNum": 68,
                "div": "A",
                "PRN": 12210276,
                "Name": "ATRAM PRASANNA WALMIKRAO",
                "username": "prasanna.atram22@vit.edu",
                "GroupID": "A12",
                "Role": "Students",
                "password": "12210276"
              },
              {
                "RollNum": 69,
                "div": "A",
                "PRN": 12211489,
                "Name": "ATREYA SWAROOP KRISHNARAO G J",
                "username": "swaroop.atreya22@vit.edu",
                "GroupID": "A12",
                "Role": "Students",
                "password": "12211489"
              },
              {
                "RollNum": 1,
                "div": "B",
                "PRN": 12210083,
                "Name": "ATTAL SHASHANK PRADEEP",
                "username": "shashank.attal22@vit.edu",
                "GroupID": "B01",
                "Role": "Students",
                "password": "12210083"
              },
              {
                "RollNum": 2,
                "div": "B",
                "PRN": 12210719,
                "Name": "AUTI SANSKRUTI SUDHAKAR",
                "username": "sanskruti.auti22@vit.edu",
                "GroupID": "B01",
                "Role": "Students",
                "password": "12210719"
              },
              {
                "RollNum": 3,
                "div": "B",
                "PRN": 12211321,
                "Name": "AVANI NACHIKET AGASHE",
                "username": "nachiket.avani22@vit.edu",
                "GroupID": "B01",
                "Role": "Students",
                "password": "12211321"
              },
              {
                "RollNum": 4,
                "div": "B",
                "PRN": 12210321,
                "Name": "AVHAD JAYWANT BHASKAR",
                "username": "jaywant.avhad22@vit.edu",
                "GroupID": "B01",
                "Role": "Students",
                "password": "12210321"
              },
              {
                "RollNum": 5,
                "div": "B",
                "PRN": 12210295,
                "Name": "AVHAD OMKAR YUVRAJ",
                "username": "omkar.avhad22@vit.edu",
                "GroupID": "B01",
                "Role": "Students",
                "password": "12210295"
              },
              {
                "RollNum": 6,
                "div": "B",
                "PRN": 12210081,
                "Name": "AWACHAR VEDANT EKNATH",
                "username": "vedant.awachar22@vit.edu",
                "GroupID": "B01",
                "Role": "Students",
                "password": "12210081"
              },
              {
                "RollNum": 7,
                "div": "B",
                "PRN": 12210229,
                "Name": "AWATADE ONKAR NANASAHEB",
                "username": "onkar.awatade22@vit.edu",
                "GroupID": "B02",
                "Role": "Students",
                "password": "12210229"
              },
              {
                "RollNum": 8,
                "div": "B",
                "PRN": 12210985,
                "Name": "AWATE ATHARVA DHANANJAY",
                "username": "atharva.awate22@vit.edu",
                "GroupID": "B02",
                "Role": "Students",
                "password": "12210985"
              },
              {
                "RollNum": 9,
                "div": "B",
                "PRN": 12210026,
                "Name": "AWERE JANHAVI SHOUNAK",
                "username": "janhavi.awere22@vit.edu",
                "GroupID": "B02",
                "Role": "Students",
                "password": "12210026"
              },
              {
                "RollNum": 10,
                "div": "B",
                "PRN": 12211197,
                "Name": "AYUSH AJIT DEOKAR",
                "username": "ayush.deokar22@vit.edu",
                "GroupID": "B02",
                "Role": "Students",
                "password": "12211197"
              },
              {
                "RollNum": 11,
                "div": "B",
                "PRN": 12210372,
                "Name": "AYUSH LADDHA",
                "username": "laddha.ayush22@vit.edu",
                "GroupID": "B02",
                "Role": "Students",
                "password": "12210372"
              },
              {
                "RollNum": 12,
                "div": "B",
                "PRN": 12211642,
                "Name": "AYUSHA YASHWANT PATIL",
                "username": "ayusha.patil22@vit.edu",
                "GroupID": "B02",
                "Role": "Students",
                "password": "12211642"
              },
              {
                "RollNum": 13,
                "div": "B",
                "PRN": 12211222,
                "Name": "BACHEWAR BHUSHAN MAHESH",
                "username": "bhushan.bachewar221@vit.edu",
                "GroupID": "B03",
                "Role": "Students",
                "password": "12211222"
              },
              {
                "RollNum": 14,
                "div": "B",
                "PRN": 12210382,
                "Name": "BACHHAV HARSH PRAMOD",
                "username": "harsh.bachhav22@vit.edu",
                "GroupID": "B03",
                "Role": "Students",
                "password": "12210382"
              },
              {
                "RollNum": 15,
                "div": "B",
                "PRN": 12210571,
                "Name": "BACHHAV PRANAV ANIL",
                "username": "pranav.bachhav22@vit.edu",
                "GroupID": "B03",
                "Role": "Students",
                "password": "12210571"
              },
              {
                "RollNum": 16,
                "div": "B",
                "PRN": 12210565,
                "Name": "BADAGANDI HARSH VENKATESH",
                "username": "harsh.badagandi22@vit.edu",
                "GroupID": "B03",
                "Role": "Students",
                "password": "12210565"
              },
              {
                "RollNum": 17,
                "div": "B",
                "PRN": 12210187,
                "Name": "BADANI HRIDAY RAJESH",
                "username": "hriday.badani22@vit.edu",
                "GroupID": "B03",
                "Role": "Students",
                "password": "12210187"
              },
              {
                "RollNum": 18,
                "div": "B",
                "PRN": 12210858,
                "Name": "BADGUJAR ATHARVA SHAM",
                "username": "atharva.badgujar22@vit.edu",
                "GroupID": "B03",
                "Role": "Students",
                "password": "12210858"
              },
              {
                "RollNum": 19,
                "div": "B",
                "PRN": 12211801,
                "Name": "BADKAS KSHITIJ VINAYAK",
                "username": "kshitij.badkas22@vit.edu",
                "GroupID": "B04",
                "Role": "Students",
                "password": "12211801"
              },
              {
                "RollNum": 20,
                "div": "B",
                "PRN": 12211025,
                "Name": "BAGDE KUNAL KISHOR",
                "username": "kunal.bagde22@vit.edu",
                "GroupID": "B04",
                "Role": "Students",
                "password": "12211025"
              },
              {
                "RollNum": 21,
                "div": "B",
                "PRN": 12210348,
                "Name": "BAGDE SAMARTH CHANDRAKANT",
                "username": "samarth.bagde22@vit.edu",
                "GroupID": "B04",
                "Role": "Students",
                "password": "12210348"
              },
              {
                "RollNum": 22,
                "div": "B",
                "PRN": 12211804,
                "Name": "BAGUL GIRISH SANJAY",
                "username": "girish.bagul221@vit.edu",
                "GroupID": "B04",
                "Role": "Students",
                "password": "12211804"
              },
              {
                "RollNum": 23,
                "div": "B",
                "PRN": 12210024,
                "Name": "BAGUL SIDDHI RAVIKIRAN",
                "username": "siddhi.bagul22@vit.edu",
                "GroupID": "B04",
                "Role": "Students",
                "password": "12210024"
              },
              {
                "RollNum": 24,
                "div": "B",
                "PRN": 12211523,
                "Name": "BAHADKAR SUSMIT AMOL",
                "username": "susmit.bahadkar22@vit.edu",
                "GroupID": "B05",
                "Role": "Students",
                "password": "12211523"
              },
              {
                "RollNum": 25,
                "div": "B",
                "PRN": 12210156,
                "Name": "BAHIR MANGESH SHIVAJI",
                "username": "mangesh.bahir22@vit.edu",
                "GroupID": "B05",
                "Role": "Students",
                "password": "12210156"
              },
              {
                "RollNum": 26,
                "div": "B",
                "PRN": 12210309,
                "Name": "BAHIRAM MANISHA MURLIDHAR",
                "username": "manisha.bahiram22@vit.edu",
                "GroupID": "B05",
                "Role": "Students",
                "password": "12210309"
              },
              {
                "RollNum": 27,
                "div": "B",
                "PRN": 12210585,
                "Name": "BAILMARE VEDANT VITTHALRAO",
                "username": "vedant.bailmare22@vit.edu",
                "GroupID": "B05",
                "Role": "Students",
                "password": "12210585"
              },
              {
                "RollNum": 28,
                "div": "B",
                "PRN": 12211371,
                "Name": "BAJAJ RAMANUJ PARESH",
                "username": "ramanuj.bajaj22@vit.edu",
                "GroupID": "B05",
                "Role": "Students",
                "password": "12211371"
              },
              {
                "RollNum": 29,
                "div": "B",
                "PRN": 12210389,
                "Name": "BAJARE SARVESH VAIBHAV",
                "username": "sarvesh.bajare22@vit.edu",
                "GroupID": "B05",
                "Role": "Students",
                "password": "12210389"
              },
              {
                "RollNum": 30,
                "div": "B",
                "PRN": 12210113,
                "Name": "BAJPAI OMKAR SACHIN",
                "username": "omkar.bajpai22@vit.edu",
                "GroupID": "B06",
                "Role": "Students",
                "password": "12210113"
              },
              {
                "RollNum": 31,
                "div": "B",
                "PRN": 12210141,
                "Name": "BAMBAL SHREYA PRAKASH",
                "username": "shreya.bambal22@vit.edu",
                "GroupID": "B06",
                "Role": "Students",
                "password": "12210141"
              },
              {
                "RollNum": 32,
                "div": "B",
                "PRN": 12211677,
                "Name": "BANSODE PRATHAMESH RAMESH",
                "username": "prathamesh.bansode22@vit.edu",
                "GroupID": "B06",
                "Role": "Students",
                "password": "12211677"
              },
              {
                "RollNum": 33,
                "div": "B",
                "PRN": 12211293,
                "Name": "BAPAT ATHARV JAYANT",
                "username": "atharv.bapat221@vit.edu",
                "GroupID": "B06",
                "Role": "Students",
                "password": "12211293"
              },
              {
                "RollNum": 34,
                "div": "B",
                "PRN": 12210439,
                "Name": "BARAPATE PRANAV SANJAY",
                "username": "pranav.barapate22@vit.edu",
                "GroupID": "B06",
                "Role": "Students",
                "password": "12210439"
              },
              {
                "RollNum": 35,
                "div": "B",
                "PRN": 12210381,
                "Name": "BARASKAR TANVI MARUTI",
                "username": "tanvi.baraskar22@vit.edu",
                "GroupID": "B06",
                "Role": "Students",
                "password": "12210381"
              },
              {
                "RollNum": 36,
                "div": "B",
                "PRN": 12211747,
                "Name": "BARDE KEYUR VIJAY",
                "username": "keyur.barde222@vit.edu",
                "GroupID": "B07",
                "Role": "Students",
                "password": "12211747"
              },
              {
                "RollNum": 37,
                "div": "B",
                "PRN": 12211420,
                "Name": "BARI RUTIKA VINAY",
                "username": "rutika.bari221@vit.edu",
                "GroupID": "B07",
                "Role": "Students",
                "password": "12211420"
              },
              {
                "RollNum": 38,
                "div": "B",
                "PRN": 12210788,
                "Name": "BARSE MANSI SUSHIL",
                "username": "mansi.barse22@vit.edu",
                "GroupID": "B07",
                "Role": "Students",
                "password": "12210788"
              },
              {
                "RollNum": 39,
                "div": "B",
                "PRN": 12211300,
                "Name": "BARSUDE SHREYA JITENDRA",
                "username": "shreya.barsude221@vit.edu",
                "GroupID": "B07",
                "Role": "Students",
                "password": "12211300"
              },
              {
                "RollNum": 40,
                "div": "B",
                "PRN": 12211273,
                "Name": "BARTAKKE OWI SHAMSUNDAR",
                "username": "owi.bartakke22@vit.edu",
                "GroupID": "B07",
                "Role": "Students",
                "password": "12211273"
              },
              {
                "RollNum": 41,
                "div": "B",
                "PRN": 12211548,
                "Name": "BARVE SHREY VIJAY",
                "username": "shrey.barve22@vit.edu",
                "GroupID": "B07",
                "Role": "Students",
                "password": "12211548"
              },
              {
                "RollNum": 42,
                "div": "B",
                "PRN": 12210973,
                "Name": "BATKADLI AARYA SANJAY",
                "username": "aarya.batkadli22@vit.edu",
                "GroupID": "B08",
                "Role": "Students",
                "password": "12210973"
              },
              {
                "RollNum": 43,
                "div": "B",
                "PRN": 12210954,
                "Name": "BAVISKAR ABHILASH VINOD",
                "username": "abhilash.baviskar22@vit.edu",
                "GroupID": "B08",
                "Role": "Students",
                "password": "12210954"
              },
              {
                "RollNum": 44,
                "div": "B",
                "PRN": 12211274,
                "Name": "BAVISKAR GAJANAN MANGESH",
                "username": "gajanan.baviskar22@vit.edu",
                "GroupID": "B08",
                "Role": "Students",
                "password": "12211274"
              },
              {
                "RollNum": 45,
                "div": "B",
                "PRN": 12210179,
                "Name": "BAVISKAR NIRAJ PRAMOD",
                "username": "niraj.baviskar22@vit.edu",
                "GroupID": "B08",
                "Role": "Students",
                "password": "12210179"
              },
              {
                "RollNum": 46,
                "div": "B",
                "PRN": 12211190,
                "Name": "BAVISKAR SARTHAK KAUTIK",
                "username": "sarthak.baviskar22@vit.edu",
                "GroupID": "B08",
                "Role": "Students",
                "password": "12211190"
              },
              {
                "RollNum": 47,
                "div": "B",
                "PRN": 12210425,
                "Name": "BAWAKE VASUNDHARA PRASHANT",
                "username": "vasundhara.bawake22@vit.edu",
                "GroupID": "B09",
                "Role": "Students",
                "password": "12210425"
              },
              {
                "RollNum": 48,
                "div": "B",
                "PRN": 12210782,
                "Name": "BEDEKAR PRANAV MANGESH",
                "username": "pranav.bedekar22@vit.edu",
                "GroupID": "B09",
                "Role": "Students",
                "password": "12210782"
              },
              {
                "RollNum": 49,
                "div": "B",
                "PRN": 12210589,
                "Name": "BEHARE HARSHAL PRAKASH",
                "username": "harshal.behare22@vit.edu",
                "GroupID": "B09",
                "Role": "Students",
                "password": "12210589"
              },
              {
                "RollNum": 50,
                "div": "B",
                "PRN": 12211713,
                "Name": "BELLALE SANDESH SIDHESHWAR",
                "username": "sandesh.bellale221@vit.edu",
                "GroupID": "B09",
                "Role": "Students",
                "password": "12211713"
              },
              {
                "RollNum": 51,
                "div": "B",
                "PRN": 12211675,
                "Name": "BELOTE ATHARVA SABAJI",
                "username": "atharva.belote22@vit.edu",
                "GroupID": "B09",
                "Role": "Students",
                "password": "12211675"
              },
              {
                "RollNum": 52,
                "div": "B",
                "PRN": 12210376,
                "Name": "BELSARE TANUSHREE PRAVINRAO",
                "username": "tanushree.belsare22@vit.edu",
                "GroupID": "B09",
                "Role": "Students",
                "password": "12210376"
              },
              {
                "RollNum": 53,
                "div": "B",
                "PRN": 12210622,
                "Name": "BELURE PRASAD MAHESH",
                "username": "prasad.belure22@vit.edu",
                "GroupID": "B10",
                "Role": "Students",
                "password": "12210622"
              },
              {
                "RollNum": 54,
                "div": "B",
                "PRN": 12211568,
                "Name": "BENDALE GIRIJA MAHENDRA",
                "username": "girija.bendale22@vit.edu",
                "GroupID": "B10",
                "Role": "Students",
                "password": "12211568"
              },
              {
                "RollNum": 55,
                "div": "B",
                "PRN": 12211100,
                "Name": "BHADANE OM MANOHAR",
                "username": "om.bhadane22@vit.edu",
                "GroupID": "B10",
                "Role": "Students",
                "password": "12211100"
              },
              {
                "RollNum": 56,
                "div": "B",
                "PRN": 12210385,
                "Name": "BHADE SHOURYA PRAVIN",
                "username": "shourya.bhade22@vit.edu",
                "GroupID": "B10",
                "Role": "Students",
                "password": "12210385"
              },
              {
                "RollNum": 57,
                "div": "B",
                "PRN": 12210915,
                "Name": "BHAGAT CHETAN SUNIL",
                "username": "chetan.bhagat22@vit.edu",
                "GroupID": "B10",
                "Role": "Students",
                "password": "12210915"
              },
              {
                "RollNum": 58,
                "div": "B",
                "PRN": 12210160,
                "Name": "BHAGAT CHIRAG SHANTARAM",
                "username": "chirag.bhagat22@vit.edu",
                "GroupID": "B10",
                "Role": "Students",
                "password": "12210160"
              },
              {
                "RollNum": 59,
                "div": "B",
                "PRN": 12210395,
                "Name": "BHAGWATKAR AMEY RAMESHRAO",
                "username": "amey.bhagwatkar22@vit.edu",
                "GroupID": "B11",
                "Role": "Students",
                "password": "12210395"
              },
              {
                "RollNum": 60,
                "div": "B",
                "PRN": 12211315,
                "Name": "BHAKKAD KUSH SANJAY",
                "username": "kush.bhakkad221@vit.edu",
                "GroupID": "B11",
                "Role": "Students",
                "password": "12211315"
              },
              {
                "RollNum": 61,
                "div": "B",
                "PRN": 12210927,
                "Name": "BHALE YASH VIVEK",
                "username": "yash.bhale22@vit.edu",
                "GroupID": "B11",
                "Role": "Students",
                "password": "12210927"
              },
              {
                "RollNum": 62,
                "div": "B",
                "PRN": 12211520,
                "Name": "BHALERAO PARTH MANGESH",
                "username": "parth.bhalerao222@vit.edu",
                "GroupID": "B11",
                "Role": "Students",
                "password": "12211520"
              },
              {
                "RollNum": 63,
                "div": "B",
                "PRN": 12210133,
                "Name": "BHALERAO PRASANNA JITENDRA",
                "username": "prasanna.bhalerao22@vit.edu",
                "GroupID": "B11",
                "Role": "Students",
                "password": "12210133"
              },
              {
                "RollNum": 64,
                "div": "B",
                "PRN": 12211285,
                "Name": "BHALERAO YASH SHRIPAD",
                "username": "yash.bhalerao221@vit.edu",
                "GroupID": "B11",
                "Role": "Students",
                "password": "12211285"
              },
              {
                "RollNum": 65,
                "div": "B",
                "PRN": 12211512,
                "Name": "BHALKE SHANTANU BHAGWAN",
                "username": "shantanu.bhalke221@vit.edu",
                "GroupID": "B12",
                "Role": "Students",
                "password": "12211512"
              },
              {
                "RollNum": 66,
                "div": "B",
                "PRN": 12210167,
                "Name": "BHANDARE RIDDHI SHANKAR",
                "username": "riddhi.bhandare22@vit.edu",
                "GroupID": "B12",
                "Role": "Students",
                "password": "12210167"
              },
              {
                "RollNum": 67,
                "div": "B",
                "PRN": 12211262,
                "Name": "Rudra Bhandari",
                "username": "rudra.bhandari22@vit.edu",
                "GroupID": "B12",
                "Role": "Students",
                "password": "12211262"
              },
              {
                "RollNum": 68,
                "div": "B",
                "PRN": 12211022,
                "Name": "BHANDARI TUSHAR NEMICHAND",
                "username": "tushar.bhandari22@vit.edu",
                "GroupID": "B12",
                "Role": "Students",
                "password": "12211022"
              },
              {
                "RollNum": 69,
                "div": "B",
                "PRN": 12211421,
                "Name": "BHANJI OMKAR AJIT",
                "username": "omkar.bhanji22@vit.edu",
                "GroupID": "B12",
                "Role": "Students",
                "password": "12211421"
              },
              {
                "RollNum": 1,
                "div": "C",
                "PRN": 12211730,
                "Name": "BHARSAKLE ADITYA DILIP",
                "username": "aditya.bharsakle22@vit.edu",
                "GroupID": "C01",
                "Role": "Students",
                "password": "12211730"
              },
              {
                "RollNum": 2,
                "div": "C",
                "PRN": 12210064,
                "Name": "BHATTACHARYA AYUS ARINDAM",
                "username": "ayus.bhattacharya22@vit.edu",
                "GroupID": "C01",
                "Role": "Students",
                "password": "12210064"
              },
              {
                "RollNum": 3,
                "div": "C",
                "PRN": 12211578,
                "Name": "BHAVIK NAIK",
                "username": "naik.bhavik221@vit.edu",
                "GroupID": "C01",
                "Role": "Students",
                "password": "12211578"
              },
              {
                "RollNum": 4,
                "div": "C",
                "PRN": 12211686,
                "Name": "BHAVSAR OM SUJIT",
                "username": "om.bhavsar221@vit.edu",
                "GroupID": "C01",
                "Role": "Students",
                "password": "12211686"
              },
              {
                "RollNum": 5,
                "div": "C",
                "PRN": 12210464,
                "Name": "BHAWARI ANIKET ANIL",
                "username": "aniket.bhawari22@vit.edu",
                "GroupID": "C01",
                "Role": "Students",
                "password": "12210464"
              },
              {
                "RollNum": 6,
                "div": "C",
                "PRN": 12211179,
                "Name": "BHAWARI PRANAV PRAKASH",
                "username": "pranav.bhawari22@vit.edu",
                "GroupID": "C01",
                "Role": "Students",
                "password": "12211179"
              },
              {
                "RollNum": 7,
                "div": "C",
                "PRN": 12211018,
                "Name": "SUYASH BHEMDE",
                "username": "suyash.bhemde22@vit.edu",
                "GroupID": "C02",
                "Role": "Students",
                "password": "12211018"
              },
              {
                "RollNum": 8,
                "div": "C",
                "PRN": 12211788,
                "Name": "BHINGARKAR ADITYA KISHOR",
                "username": "aditya.bhingarkar22@vit.edu",
                "GroupID": "C02",
                "Role": "Students",
                "password": "12211788"
              },
              {
                "RollNum": 9,
                "div": "C",
                "PRN": 12210320,
                "Name": "BHOIR DISHALI VIVEK",
                "username": "dishali.bhoir22@vit.edu",
                "GroupID": "C02",
                "Role": "Students",
                "password": "12210320"
              },
              {
                "RollNum": 10,
                "div": "C",
                "PRN": 12211106,
                "Name": "BHOJANE ONKAR DATTATRAY",
                "username": "onkar.bhojane22@vit.edu",
                "GroupID": "C02",
                "Role": "Students",
                "password": "12211106"
              },
              {
                "RollNum": 11,
                "div": "C",
                "PRN": 12210733,
                "Name": "BHOJE SAHIL SANTOSH",
                "username": "sahil.bhoje22@vit.edu",
                "GroupID": "C02",
                "Role": "Students",
                "password": "12210733"
              },
              {
                "RollNum": 12,
                "div": "C",
                "PRN": 12210089,
                "Name": "BHOKARE DARSHAN DEEPAK",
                "username": "darshan.bhokare22@vit.edu",
                "GroupID": "C02",
                "Role": "Students",
                "password": "12210089"
              },
              {
                "RollNum": 13,
                "div": "C",
                "PRN": 12211528,
                "Name": "BHOR VAISHNAV BHARAT",
                "username": "vaishnav.bhor22@vit.edu",
                "GroupID": "C03",
                "Role": "Students",
                "password": "12211528"
              },
              {
                "RollNum": 14,
                "div": "C",
                "PRN": 12210401,
                "Name": "BHOSALE AJINKYA BABAN",
                "username": "ajinkya.bhosale22@vit.edu",
                "GroupID": "C03",
                "Role": "Students",
                "password": "12210401"
              },
              {
                "RollNum": 15,
                "div": "C",
                "PRN": 12210925,
                "Name": "BHOSALE DIPRAJ RAMCHANDRA",
                "username": "dipraj.bhosale22@vit.edu",
                "GroupID": "C03",
                "Role": "Students",
                "password": "12210925"
              },
              {
                "RollNum": 16,
                "div": "C",
                "PRN": 12210466,
                "Name": "BHOSALE PRATHAMESH NIVRUTTI",
                "username": "prathamesh.bhosale22@vit.edu",
                "GroupID": "C03",
                "Role": "Students",
                "password": "12210466"
              },
              {
                "RollNum": 17,
                "div": "C",
                "PRN": 12210828,
                "Name": "BHOSALE RAJAS VISHVAJEET",
                "username": "rajas.bhosale22@vit.edu",
                "GroupID": "C03",
                "Role": "Students",
                "password": "12210828"
              },
              {
                "RollNum": 18,
                "div": "C",
                "PRN": 12211735,
                "Name": "BHOSALE SHREYA SANDIP",
                "username": "shreya.bhosale221@vit.edu",
                "GroupID": "C03",
                "Role": "Students",
                "password": "12211735"
              },
              {
                "RollNum": 19,
                "div": "C",
                "PRN": 12211580,
                "Name": "BHOYAR ADITYA UDAY",
                "username": "aditya.bhoyar221@vit.edu",
                "GroupID": "C04",
                "Role": "Students",
                "password": "12211580"
              },
              {
                "RollNum": 20,
                "div": "C",
                "PRN": 12210794,
                "Name": "BHOYAR AYUSH SUNIL",
                "username": "ayush.bhoyar22@vit.edu",
                "GroupID": "C04",
                "Role": "Students",
                "password": "12210794"
              },
              {
                "RollNum": 21,
                "div": "C",
                "PRN": 12210221,
                "Name": "BHUPESH TUKARAM CHAVAN",
                "username": "tukaram.bhupesh22@vit.edu",
                "GroupID": "C04",
                "Role": "Students",
                "password": "12210221"
              },
              {
                "RollNum": 22,
                "div": "C",
                "PRN": 12211537,
                "Name": "BHURKE PARTH CHARUDATT",
                "username": "parth.bhurke22@vit.edu",
                "GroupID": "C04",
                "Role": "Students",
                "password": "12211537"
              },
              {
                "RollNum": 23,
                "div": "C",
                "PRN": 12210608,
                "Name": "BHUSEWAR AAKANKSHA SANJAY",
                "username": "aakanksha.bhusewar22@vit.edu",
                "GroupID": "C04",
                "Role": "Students",
                "password": "12210608"
              },
              {
                "RollNum": 24,
                "div": "C",
                "PRN": 12210245,
                "Name": "BHUSHAN SAMBHAJI BERLIKAR",
                "username": "sambhaji.bhushan22@vit.edu",
                "GroupID": "C05",
                "Role": "Students",
                "password": "12210245"
              },
              {
                "RollNum": 25,
                "div": "C",
                "PRN": 12211776,
                "Name": "BHUTADA MADHUR PRAKASH",
                "username": "madhur.bhutada22@vit.edu",
                "GroupID": "C05",
                "Role": "Students",
                "password": "12211776"
              },
              {
                "RollNum": 26,
                "div": "C",
                "PRN": 12210889,
                "Name": "Piyush Bipin Bhutada",
                "username": "piyush.bhutada22@vit.edu",
                "GroupID": "C05",
                "Role": "Students",
                "password": "12210889"
              },
              {
                "RollNum": 27,
                "div": "C",
                "PRN": 12210515,
                "Name": "BHUTADA RADHA DINESH",
                "username": "radha.bhutada22@vit.edu",
                "GroupID": "C05",
                "Role": "Students",
                "password": "12210515"
              },
              {
                "RollNum": 28,
                "div": "C",
                "PRN": 12211101,
                "Name": "BHUWANIYA VAIBHAV SUSHIL",
                "username": "vaibhav.bhuwaniya22@vit.edu",
                "GroupID": "C05",
                "Role": "Students",
                "password": "12211101"
              },
              {
                "RollNum": 29,
                "div": "C",
                "PRN": 12211684,
                "Name": "BHUYAR SRUSHTI GAJANAN",
                "username": "srushti.bhuyar22@vit.edu",
                "GroupID": "C05",
                "Role": "Students",
                "password": "12211684"
              },
              {
                "RollNum": 30,
                "div": "C",
                "PRN": 12210193,
                "Name": "BICHU SAIF SHAMSUDDIN",
                "username": "saif.bichu22@vit.edu",
                "GroupID": "C06",
                "Role": "Students",
                "password": "12210193"
              },
              {
                "RollNum": 31,
                "div": "C",
                "PRN": 12211651,
                "Name": "BILAL BIN FAISAL KHAN",
                "username": "bilalbin.khan22@vit.edu",
                "GroupID": "C06",
                "Role": "Students",
                "password": "12211651"
              },
              {
                "RollNum": 32,
                "div": "C",
                "PRN": 12210078,
                "Name": "BIRADAR DARSHAN MADOLAPPA",
                "username": "darshan.biradar22@vit.edu",
                "GroupID": "C06",
                "Role": "Students",
                "password": "12210078"
              },
              {
                "RollNum": 33,
                "div": "C",
                "PRN": 12210462,
                "Name": "BISEN PRATHAM ANIL",
                "username": "pratham.bisen22@vit.edu",
                "GroupID": "C06",
                "Role": "Students",
                "password": "12210462"
              },
              {
                "RollNum": 34,
                "div": "C",
                "PRN": 12210517,
                "Name": "BISSA DEVANG LALIT",
                "username": "devang.bissa22@vit.edu",
                "GroupID": "C06",
                "Role": "Students",
                "password": "12210517"
              },
              {
                "RollNum": 35,
                "div": "C",
                "PRN": 12210872,
                "Name": "BIYANI SARTHAK ISHWARPRASAD",
                "username": "sarthak.biyani22@vit.edu",
                "GroupID": "C06",
                "Role": "Students",
                "password": "12210872"
              },
              {
                "RollNum": 36,
                "div": "C",
                "PRN": 12210902,
                "Name": "BOBADE OM VIJAY",
                "username": "om.bobade22@vit.edu",
                "GroupID": "C07",
                "Role": "Students",
                "password": "12210902"
              },
              {
                "RollNum": 37,
                "div": "C",
                "PRN": 12210937,
                "Name": "BOKARE VISHAL VITTHAL",
                "username": "vishal.bokare22@vit.edu",
                "GroupID": "C07",
                "Role": "Students",
                "password": "12210937"
              },
              {
                "RollNum": 38,
                "div": "C",
                "PRN": 12210573,
                "Name": "BONDE ATHARVA AJAY",
                "username": "atharva.bonde22@vit.edu",
                "GroupID": "C07",
                "Role": "Students",
                "password": "12210573"
              },
              {
                "RollNum": 39,
                "div": "C",
                "PRN": 12211260,
                "Name": "BORA TANMAY PRASHANT",
                "username": "tanmay.bora221@vit.edu",
                "GroupID": "C07",
                "Role": "Students",
                "password": "12211260"
              },
              {
                "RollNum": 40,
                "div": "C",
                "PRN": 12210433,
                "Name": "BORADE ATHARVA MANISH",
                "username": "atharva.borade22@vit.edu",
                "GroupID": "C07",
                "Role": "Students",
                "password": "12210433"
              },
              {
                "RollNum": 41,
                "div": "C",
                "PRN": 12211082,
                "Name": "BORADE ISHAWAR SAHEBRAO",
                "username": "ishawar.borade22@vit.edu",
                "GroupID": "C07",
                "Role": "Students",
                "password": "12211082"
              },
              {
                "RollNum": 42,
                "div": "C",
                "PRN": 12210509,
                "Name": "BORHADE BHARATI VIJAY",
                "username": "bharati.borhade22@vit.edu",
                "GroupID": "C08",
                "Role": "Students",
                "password": "12210509"
              },
              {
                "RollNum": 43,
                "div": "C",
                "PRN": 12210568,
                "Name": "BORSE CHIRAYU RAJESH",
                "username": "chirayu.borse22@vit.edu",
                "GroupID": "C08",
                "Role": "Students",
                "password": "12210568"
              },
              {
                "RollNum": 44,
                "div": "C",
                "PRN": 12211506,
                "Name": "BORSE OM YOGESH",
                "username": "om.borse222@vit.edu",
                "GroupID": "C08",
                "Role": "Students",
                "password": "12211506"
              },
              {
                "RollNum": 45,
                "div": "C",
                "PRN": 12210300,
                "Name": "BORSE SAYALI KISHOR",
                "username": "sayali.borse22@vit.edu",
                "GroupID": "C08",
                "Role": "Students",
                "password": "12210300"
              },
              {
                "RollNum": 46,
                "div": "C",
                "PRN": 12211667,
                "Name": "Prateek Buthale",
                "username": "prateek.buthale223@vit.edu",
                "GroupID": "C08",
                "Role": "Students",
                "password": "12211667"
              },
              {
                "RollNum": 47,
                "div": "C",
                "PRN": 12210447,
                "Name": "CHALPE ARYAN PRASHANT",
                "username": "aryan.chalpe22@vit.edu",
                "GroupID": "C09",
                "Role": "Students",
                "password": "12210447"
              },
              {
                "RollNum": 48,
                "div": "C",
                "PRN": 12211526,
                "Name": "CHANDAK SWAYAM SHIVKUMAR",
                "username": "swayam.chandak221@vit.edu",
                "GroupID": "C09",
                "Role": "Students",
                "password": "12211526"
              },
              {
                "RollNum": 49,
                "div": "C",
                "PRN": 12211761,
                "Name": "CHANDAWAR RACHIT PRASAD",
                "username": "rachit.chandawar221@vit.edu",
                "GroupID": "C09",
                "Role": "Students",
                "password": "12211761"
              },
              {
                "RollNum": 50,
                "div": "C",
                "PRN": 12210848,
                "Name": "CHANDEKAR CHANDRASHEKHAR SHIVAJI",
                "username": "chandrashekhar.chandekar22@vit.edu",
                "GroupID": "C09",
                "Role": "Students",
                "password": "12210848"
              },
              {
                "RollNum": 51,
                "div": "C",
                "PRN": 12211741,
                "Name": "CHANDOLIKAR SUYASH SUDHIR",
                "username": "suyash.chandolikar22@vit.edu",
                "GroupID": "C09",
                "Role": "Students",
                "password": "12211741"
              },
              {
                "RollNum": 52,
                "div": "C",
                "PRN": 12210749,
                "Name": "CHAROLIYA ZULFIKAR SULTANAHMED",
                "username": "zulfikar.charoliya22@vit.edu",
                "GroupID": "C09",
                "Role": "Students",
                "password": "12210749"
              },
              {
                "RollNum": 53,
                "div": "C",
                "PRN": 12211032,
                "Name": "CHATE VAISHNAVI SHIVAJI",
                "username": "vaishnavi.chate22@vit.edu",
                "GroupID": "C10",
                "Role": "Students",
                "password": "12211032"
              },
              {
                "RollNum": 54,
                "div": "C",
                "PRN": 12210098,
                "Name": "CHAUDHARI ASTHA SACHIN",
                "username": "astha.chaudhari22@vit.edu",
                "GroupID": "C10",
                "Role": "Students",
                "password": "12210098"
              },
              {
                "RollNum": 55,
                "div": "C",
                "PRN": 12211605,
                "Name": "CHAUDHARI ATHARVA MAHENDRA",
                "username": "atharva.chaudhari22@vit.edu",
                "GroupID": "C10",
                "Role": "Students",
                "password": "12211605"
              },
              {
                "RollNum": 56,
                "div": "C",
                "PRN": 12211703,
                "Name": "CHAUDHARI BHAVESH SURESH",
                "username": "bhavesh.chaudhari221@vit.edu",
                "GroupID": "C10",
                "Role": "Students",
                "password": "12211703"
              },
              {
                "RollNum": 57,
                "div": "C",
                "PRN": 12210240,
                "Name": "CHAUDHARI HARSH PRAKASH",
                "username": "harsh.chaudhari22@vit.edu",
                "GroupID": "C10",
                "Role": "Students",
                "password": "12210240"
              },
              {
                "RollNum": 58,
                "div": "C",
                "PRN": 12210003,
                "Name": "CHAUDHARI HARSHAL VIJAY",
                "username": "harshal.chaudhari22@vit.edu",
                "GroupID": "C10",
                "Role": "Students",
                "password": "12210003"
              },
              {
                "RollNum": 59,
                "div": "C",
                "PRN": 12210370,
                "Name": "CHAUDHARI SANSKAR MUKTA",
                "username": "sanskar.chaudhari22@vit.edu",
                "GroupID": "C11",
                "Role": "Students",
                "password": "12210370"
              },
              {
                "RollNum": 60,
                "div": "C",
                "PRN": 12211662,
                "Name": "CHAUDHARY KISHAN KANARAM",
                "username": "kishan.chaudhary22@vit.edu",
                "GroupID": "C11",
                "Role": "Students",
                "password": "12211662"
              },
              {
                "RollNum": 61,
                "div": "C",
                "PRN": 12211388,
                "Name": "CHAURE ARYAN ANAND",
                "username": "aryan.chaure22@vit.edu",
                "GroupID": "C11",
                "Role": "Students",
                "password": "12211388"
              },
              {
                "RollNum": 62,
                "div": "C",
                "PRN": 12210493,
                "Name": "CHAVAN AARYAN AVADHUT",
                "username": "aaryan.chavan22@vit.edu",
                "GroupID": "C11",
                "Role": "Students",
                "password": "12210493"
              },
              {
                "RollNum": 63,
                "div": "C",
                "PRN": 12210897,
                "Name": "CHAVAN NIKITA BALU",
                "username": "nikita.chavan221@vit.edu",
                "GroupID": "C11",
                "Role": "Students",
                "password": "12210897"
              },
              {
                "RollNum": 64,
                "div": "C",
                "PRN": 12210701,
                "Name": "CHAVAN NIKITA JANARDAN",
                "username": "nikita.chavan22@vit.edu",
                "GroupID": "C11",
                "Role": "Students",
                "password": "12210701"
              },
              {
                "RollNum": 65,
                "div": "C",
                "PRN": 12211709,
                "Name": "CHAVAN SOHAM SANJAY",
                "username": "soham.chavan22@vit.edu",
                "GroupID": "C12",
                "Role": "Students",
                "password": "12211709"
              },
              {
                "RollNum": 66,
                "div": "C",
                "PRN": 12211072,
                "Name": "CHAVAN VAIBHAVI AVINASH",
                "username": "vaibhavi.chavan22@vit.edu",
                "GroupID": "C12",
                "Role": "Students",
                "password": "12211072"
              },
              {
                "RollNum": 67,
                "div": "C",
                "PRN": 12211077,
                "Name": "CHAVAN VEDANT RAJENDRA",
                "username": "vedant.chavan22@vit.edu",
                "GroupID": "C12",
                "Role": "Students",
                "password": "12211077"
              },
              {
                "RollNum": 68,
                "div": "C",
                "PRN": 12210277,
                "Name": "CHAVARE SAYALI HANUMANT",
                "username": "sayali.chavare22@vit.edu",
                "GroupID": "C12",
                "Role": "Students",
                "password": "12210277"
              },
              {
                "RollNum": 69,
                "div": "C",
                "PRN": 12210641,
                "Name": "CHAWLA PRERNA DEEPAK",
                "username": "prerna.chawla22@vit.edu",
                "GroupID": "C12",
                "Role": "Students",
                "password": "12210641"
              },
              {
                "RollNum": 1,
                "div": "D",
                "PRN": 12211811,
                "Name": "CHAWLE ATHARVA SUNIL",
                "username": "atharva.chawle221@vit.edu",
                "GroupID": "D01",
                "Role": "Students",
                "password": "12211811"
              },
              {
                "RollNum": 2,
                "div": "D",
                "PRN": 12210504,
                "Name": "CHETAN RAJGONDA JAIN",
                "username": "chetan.jain22@vit.edu",
                "GroupID": "D01",
                "Role": "Students",
                "password": "12210504"
              },
              {
                "RollNum": 3,
                "div": "D",
                "PRN": 12210071,
                "Name": "CHHAJED JEEVAAN KRISHNAKUMAR",
                "username": "jeevaan.chhajed22@vit.edu",
                "GroupID": "D01",
                "Role": "Students",
                "password": "12210071"
              },
              {
                "RollNum": 4,
                "div": "D",
                "PRN": 12210114,
                "Name": "CHIKHALE SHRAMANRAJ RAMDAS",
                "username": "shramanraj.chikhale22@vit.edu",
                "GroupID": "D01",
                "Role": "Students",
                "password": "12210114"
              },
              {
                "RollNum": 5,
                "Role": "Students",
                "password": ""
              },
              {
                "RollNum": 6,
                "div": "D",
                "PRN": 12211318,
                "Name": "CHILBULE PRANIT RAVINDRA",
                "username": "pranit.chilbule221@vit.edu",
                "GroupID": "D01",
                "Role": "Students",
                "password": "12211318"
              },
              {
                "RollNum": 7,
                "div": "D",
                "PRN": 12210256,
                "Name": "CHINCHKAR JAY RAMDAS",
                "username": "jay.chinchkar22@vit.edu",
                "GroupID": "D02",
                "Role": "Students",
                "password": "12210256"
              },
              {
                "RollNum": 8,
                "div": "D",
                "PRN": 12210764,
                "Name": "CHINTAL SHAILESH JANARDHAN",
                "username": "shailesh.chintal22@vit.edu",
                "GroupID": "D02",
                "Role": "Students",
                "password": "12210764"
              },
              {
                "RollNum": 9,
                "div": "D",
                "PRN": 12211398,
                "Name": "CHIRAG DEEPAK BELANI",
                "username": "chirag.belani22@vit.edu",
                "GroupID": "D02",
                "Role": "Students",
                "password": "12211398"
              },
              {
                "RollNum": 10,
                "div": "D",
                "PRN": 12211193,
                "Name": "CHIRAWANDE VAISHNAVI SANJAY",
                "username": "vaishnavi.chirawande22@vit.edu",
                "GroupID": "D02",
                "Role": "Students",
                "password": "12211193"
              },
              {
                "RollNum": 11,
                "div": "D",
                "PRN": 12210311,
                "Name": "CHOPADE KALYANI JANARDAN",
                "username": "kalyani.chopade22@vit.edu",
                "GroupID": "D02",
                "Role": "Students",
                "password": "12210311"
              },
              {
                "RollNum": 12,
                "div": "D",
                "PRN": 12210410,
                "Name": "CHOPADE SANSKRUTI RAJESH",
                "username": "sanskruti.chopade22@vit.edu",
                "GroupID": "D02",
                "Role": "Students",
                "password": "12210410"
              },
              {
                "RollNum": 13,
                "div": "D",
                "PRN": 12210853,
                "Name": "CHORDIYA DARSHAN PRAMOD",
                "username": "darshan.chordiya22@vit.edu",
                "GroupID": "D03",
                "Role": "Students",
                "password": "12210853"
              },
              {
                "RollNum": 14,
                "div": "D",
                "PRN": 12211443,
                "Name": "CHOUDHARY PARI SHASHI",
                "username": "pari.choudhary22@vit.edu",
                "GroupID": "D03",
                "Role": "Students",
                "password": "12211443"
              },
              {
                "RollNum": 15,
                "div": "D",
                "PRN": 12210375,
                "Name": "CHOUGULE AARYAN PARESH",
                "username": "aaryan.chougule22@vit.edu",
                "GroupID": "D03",
                "Role": "Students",
                "password": "12210375"
              },
              {
                "RollNum": 16,
                "div": "D",
                "PRN": 12210402,
                "Name": "CHULPAR ROHIT DEWANATH",
                "username": "rohit.chulpar22@vit.edu",
                "GroupID": "D03",
                "Role": "Students",
                "password": "12210402"
              },
              {
                "RollNum": 17,
                "div": "D",
                "PRN": 12210972,
                "Name": "DABERAO AKSHIT KISHOR",
                "username": "akshit.daberao22@vit.edu",
                "GroupID": "D03",
                "Role": "Students",
                "password": "12210972"
              },
              {
                "RollNum": 18,
                "div": "D",
                "PRN": 12210556,
                "Name": "DABERAO PRAVIN VITTHAL",
                "username": "pravin.daberao22@vit.edu",
                "GroupID": "D03",
                "Role": "Students",
                "password": "12210556"
              },
              {
                "RollNum": 19,
                "div": "D",
                "PRN": 12210172,
                "Name": "DABHADE SHRUTI MANOHAR",
                "username": "shruti.dabhade22@vit.edu",
                "GroupID": "D04",
                "Role": "Students",
                "password": "12210172"
              },
              {
                "RollNum": 20,
                "div": "D",
                "PRN": 12211567,
                "Name": "DADHICH ALOK ANIL",
                "username": "alok.dadhich22@vit.edu",
                "GroupID": "D04",
                "Role": "Students",
                "password": "12211567"
              },
              {
                "RollNum": 21,
                "div": "D",
                "PRN": 12210322,
                "Name": "DAGA ABHINANDAN SANJAY",
                "username": "abhinandan.daga22@vit.edu",
                "GroupID": "D04",
                "Role": "Students",
                "password": "12210322"
              },
              {
                "RollNum": 22,
                "div": "D",
                "PRN": 12210117,
                "Name": "DAGADE KUNAL KALURAM",
                "username": "kunal.dagade22@vit.edu",
                "GroupID": "D04",
                "Role": "Students",
                "password": "12210117"
              },
              {
                "RollNum": 23,
                "div": "D",
                "PRN": 12211123,
                "Name": "DAHAKE ADITYA RAJESH",
                "username": "aditya.dahake22@vit.edu",
                "GroupID": "D04",
                "Role": "Students",
                "password": "12211123"
              },
              {
                "RollNum": 24,
                "div": "D",
                "PRN": 12211601,
                "Name": "DAKORE MAHESH ARUN",
                "username": "mahesh.dakore22@vit.edu",
                "GroupID": "D05",
                "Role": "Students",
                "password": "12211601"
              },
              {
                "RollNum": 25,
                "div": "D",
                "PRN": 12211480,
                "Name": "DAKSH SAKLANI",
                "username": "daksh.saklani22@vit.edu",
                "GroupID": "D05",
                "Role": "Students",
                "password": "12211480"
              },
              {
                "RollNum": 26,
                "div": "D",
                "PRN": 12211481,
                "Name": "DANDARE GARGI PRAVIN",
                "username": "gargi.dandare221@vit.edu",
                "GroupID": "D05",
                "Role": "Students",
                "password": "12211481"
              },
              {
                "RollNum": 27,
                "div": "D",
                "PRN": 12211606,
                "Name": "DANDEKAR UDAY MANOHARRAO",
                "username": "uday.dandekar221@vit.edu",
                "GroupID": "D05",
                "Role": "Students",
                "password": "12211606"
              },
              {
                "RollNum": 28,
                "div": "D",
                "PRN": 12210153,
                "Name": "DARADE SNEHAL SANTOSH",
                "username": "snehal.darade22@vit.edu",
                "GroupID": "D05",
                "Role": "Students",
                "password": "12210153"
              },
              {
                "RollNum": 29,
                "div": "D",
                "PRN": 12211498,
                "Name": "DAREKAR SMEET DADA",
                "username": "smeet.darekar221@vit.edu",
                "GroupID": "D05",
                "Role": "Students",
                "password": "12211498"
              },
              {
                "RollNum": 30,
                "div": "D",
                "PRN": 12211251,
                "Name": "DASARWAR ESHAN SANTOSH",
                "username": "eshan.dasarwar22@vit.edu",
                "GroupID": "D06",
                "Role": "Students",
                "password": "12211251"
              },
              {
                "RollNum": 31,
                "div": "D",
                "PRN": 12210964,
                "Name": "DATE AMEYA VISHWAS",
                "username": "ameya.date22@vit.edu",
                "GroupID": "D06",
                "Role": "Students",
                "password": "12210964"
              },
              {
                "RollNum": 32,
                "div": "D",
                "PRN": 12210421,
                "Name": "DATIR DEV PRAVIN",
                "username": "dev.datir22@vit.edu",
                "GroupID": "D06",
                "Role": "Students",
                "password": "12210421"
              },
              {
                "RollNum": 33,
                "div": "D",
                "PRN": 12210491,
                "Name": "DATTAWADE PRATHAM PRAKASH",
                "username": "pratham.dattawade22@vit.edu",
                "GroupID": "D06",
                "Role": "Students",
                "password": "12210491"
              },
              {
                "RollNum": 34,
                "div": "D",
                "PRN": 12211737,
                "Name": "DAVARE PRATIK VIKRAM",
                "username": "pratik.davare22@vit.edu",
                "GroupID": "D06",
                "Role": "Students",
                "password": "12211737"
              },
              {
                "RollNum": 35,
                "div": "D",
                "PRN": 12211282,
                "Name": "DCOSTA SHANE STANY",
                "username": "shane.dcosta22@vit.edu",
                "GroupID": "D06",
                "Role": "Students",
                "password": "12211282"
              },
              {
                "RollNum": 36,
                "div": "D",
                "PRN": 12210399,
                "Name": "DEBRE ATHARVA PRASHANT",
                "username": "atharva.debre22@vit.edu",
                "GroupID": "D07",
                "Role": "Students",
                "password": "12210399"
              },
              {
                "RollNum": 37,
                "div": "D",
                "PRN": 12210487,
                "Name": "DEEPAK PUNDLIK CHIMKAR",
                "username": "deepak.chimkar22@vit.edu",
                "GroupID": "D07",
                "Role": "Students",
                "password": "12210487"
              },
              {
                "RollNum": 38,
                "div": "D",
                "PRN": 12211603,
                "Name": "DEO GAURI PRASHANT",
                "username": "gauri.deo22@vit.edu",
                "GroupID": "D07",
                "Role": "Students",
                "password": "12211603"
              },
              {
                "RollNum": 39,
                "div": "D",
                "PRN": 12211428,
                "Name": "DEO MAITREYEE MANGESH",
                "username": "maitreyee.deo22@vit.edu",
                "GroupID": "D07",
                "Role": "Students",
                "password": "12211428"
              },
              {
                "RollNum": 40,
                "div": "D",
                "PRN": 12210623,
                "Name": "DEO MOHIT SHAILESH",
                "username": "mohit.deo22@vit.edu",
                "GroupID": "D07",
                "Role": "Students",
                "password": "12210623"
              },
              {
                "RollNum": 41,
                "div": "D",
                "PRN": 12211704,
                "Name": "DEO PRANAV SUNIL",
                "username": "pranav.deo22@vit.edu",
                "GroupID": "D07",
                "Role": "Students",
                "password": "12211704"
              },
              {
                "RollNum": 42,
                "div": "D",
                "PRN": 12210539,
                "Name": "DEOGADE SAHIL SANJAY",
                "username": "sahil.deogade22@vit.edu",
                "GroupID": "D08",
                "Role": "Students",
                "password": "12210539"
              },
              {
                "RollNum": 43,
                "div": "D",
                "PRN": 12210538,
                "Name": "DEOGADE SUBODH SANJAY",
                "username": "subodh.deogade22@vit.edu",
                "GroupID": "D08",
                "Role": "Students",
                "password": "12210538"
              },
              {
                "RollNum": 44,
                "div": "D",
                "PRN": 12210624,
                "Name": "DEOKAR SWAROOP PRASHANT",
                "username": "swaroop.deokar22@vit.edu",
                "GroupID": "D08",
                "Role": "Students",
                "password": "12210624"
              },
              {
                "RollNum": 45,
                "div": "D",
                "PRN": 12210771,
                "Name": "DEOKATE SAMIKSHA BAPURAO",
                "username": "samiksha.deokate22@vit.edu",
                "GroupID": "D08",
                "Role": "Students",
                "password": "12210771"
              },
              {
                "RollNum": 46,
                "div": "D",
                "PRN": 12210748,
                "Name": "DEORE BHAVESH RAMLAL",
                "username": "bhavesh.deore22@vit.edu",
                "GroupID": "D08",
                "Role": "Students",
                "password": "12210748"
              },
              {
                "RollNum": 47,
                "div": "D",
                "PRN": 12210282,
                "Name": "DEORE KALPESH MILIND",
                "username": "kalpesh.deore22@vit.edu",
                "GroupID": "D09",
                "Role": "Students",
                "password": "12210282"
              },
              {
                "RollNum": 48,
                "div": "D",
                "PRN": 12210092,
                "Name": "DEORE VAIBHAV EKNATH",
                "username": "vaibhav.deore22@vit.edu",
                "GroupID": "D09",
                "Role": "Students",
                "password": "12210092"
              },
              {
                "RollNum": 49,
                "div": "D",
                "PRN": 12210881,
                "Name": "DEORE VEDANT HARSHAD",
                "username": "vedant.deore22@vit.edu",
                "GroupID": "D09",
                "Role": "Students",
                "password": "12210881"
              },
              {
                "RollNum": 50,
                "div": "D",
                "PRN": 12210432,
                "Name": "DEPALE NIKHIL NAVNATH",
                "username": "nikhil.depale22@vit.edu",
                "GroupID": "D09",
                "Role": "Students",
                "password": "12210432"
              },
              {
                "RollNum": 51,
                "div": "D",
                "PRN": 12211466,
                "Name": "DERE GAYATRI MAHENDRA",
                "username": "gayatri.dere222@vit.edu",
                "GroupID": "D09",
                "Role": "Students",
                "password": "12211466"
              },
              {
                "RollNum": 52,
                "div": "D",
                "PRN": 12211174,
                "Name": "DERKAR MEGHA ANIL",
                "username": "megha.derkar22@vit.edu",
                "GroupID": "D09",
                "Role": "Students",
                "password": "12211174"
              },
              {
                "RollNum": 53,
                "div": "D",
                "PRN": 12210047,
                "Name": "DESAI PREETI JAICHAND",
                "username": "preeti.desai22@vit.edu",
                "GroupID": "D10",
                "Role": "Students",
                "password": "12210047"
              },
              {
                "RollNum": 54,
                "div": "D",
                "PRN": 12211565,
                "Name": "DESAI SANKHYA SHASHIKANT",
                "username": "sankhya.desai22@vit.edu",
                "GroupID": "D10",
                "Role": "Students",
                "password": "12211565"
              },
              {
                "RollNum": 55,
                "div": "D",
                "PRN": 12211029,
                "Name": "DESAI TANUJA MANOHAR",
                "username": "tanuja.desai22@vit.edu",
                "GroupID": "D10",
                "Role": "Students",
                "password": "12211029"
              },
              {
                "RollNum": 56,
                "div": "D",
                "PRN": 12211268,
                "Name": "DESHINGKAR HARSHADA",
                "username": "harshada.deshingkar22@vit.edu",
                "GroupID": "D10",
                "Role": "Students",
                "password": "12211268"
              },
              {
                "RollNum": 57,
                "div": "D",
                "PRN": 12210716,
                "Name": "DESHMANE SHRINIDHI ANAND",
                "username": "shrinidhi.deshmane22@vit.edu",
                "GroupID": "D10",
                "Role": "Students",
                "password": "12210716"
              },
              {
                "RollNum": 58,
                "div": "D",
                "PRN": 12211769,
                "Name": "DESHMUKH AARYA SUDHIR",
                "username": "aarya.deshmukh22@vit.edu",
                "GroupID": "D10",
                "Role": "Students",
                "password": "12211769"
              },
              {
                "RollNum": 59,
                "div": "D",
                "PRN": 12210451,
                "Name": "DESHMUKH AKANKSHA RAVINDRA",
                "username": "akanksha.deshmukh22@vit.edu",
                "GroupID": "D11",
                "Role": "Students",
                "password": "12210451"
              },
              {
                "RollNum": 60,
                "div": "D",
                "PRN": 12211426,
                "Name": "DESHMUKH AMOGH SHASHIKANT",
                "username": "amogh.deshmukh22@vit.edu",
                "GroupID": "D11",
                "Role": "Students",
                "password": "12211426"
              },
              {
                "RollNum": 61,
                "div": "D",
                "PRN": 12211692,
                "Name": "DESHMUKH ANAND GAJANAN",
                "username": "anand.deshmukh22@vit.edu",
                "GroupID": "D11",
                "Role": "Students",
                "password": "12211692"
              },
              {
                "RollNum": 62,
                "div": "D",
                "PRN": 12211188,
                "Name": "DESHMUKH ANEESH TUSHAR",
                "username": "aneesh.deshmukh22@vit.edu",
                "GroupID": "D11",
                "Role": "Students",
                "password": "12211188"
              },
              {
                "RollNum": 63,
                "div": "D",
                "PRN": 12211573,
                "Name": "DESHMUKH ANURAG RAJENDRA",
                "username": "anurag.deshmukh22@vit.edu",
                "GroupID": "D11",
                "Role": "Students",
                "password": "12211573"
              },
              {
                "RollNum": 64,
                "div": "D",
                "PRN": 12210661,
                "Name": "DESHMUKH ASAWARI PRASHANT",
                "username": "asawari.deshmukh22@vit.edu",
                "GroupID": "D11",
                "Role": "Students",
                "password": "12210661"
              },
              {
                "RollNum": 65,
                "div": "D",
                "PRN": 12210132,
                "Name": "DESHMUKH ATHARVA BHASKAR",
                "username": "atharva.deshmukh22@vit.edu",
                "GroupID": "D12",
                "Role": "Students",
                "password": "12210132"
              },
              {
                "RollNum": 66,
                "div": "D",
                "PRN": 12211544,
                "Name": "DESHMUKH OM SHIVRAJ",
                "username": "om.deshmukh22@vit.edu",
                "GroupID": "D12",
                "Role": "Students",
                "password": "12211544"
              },
              {
                "RollNum": 67,
                "div": "D",
                "PRN": 12210994,
                "Name": "DESHMUKH SAMRUDDHI ANANTKUMAR",
                "username": "samruddhi.deshmukh22@vit.edu",
                "GroupID": "D12",
                "Role": "Students",
                "password": "12210994"
              },
              {
                "RollNum": 68,
                "div": "D",
                "PRN": 12210359,
                "Name": "DESHMUKH SATYJIT SANTOSH",
                "username": "satyjit.deshmukh22@vit.edu",
                "GroupID": "D12",
                "Role": "Students",
                "password": "12210359"
              },
              {
                "RollNum": 69,
                "div": "D",
                "PRN": 12211712,
                "Name": "DESHMUKH SOHAM RAJESH",
                "username": "soham.deshmukh22@vit.edu",
                "GroupID": "D12",
                "Role": "Students",
                "password": "12211712"
              },
              {
                "RollNum": 1,
                "div": "E",
                "PRN": 12211670,
                "Name": "DESHMUKH SOMESH MAHENDRA",
                "username": "somesh.deshmukh221@vit.edu",
                "GroupID": "E01",
                "Role": "Students",
                "password": "12211670"
              },
              {
                "RollNum": 2,
                "div": "E",
                "PRN": 12211770,
                "Name": "DESHMUKH VAISHNAVI MILIND",
                "username": "vaishnavi.deshmukh22@vit.edu",
                "GroupID": "E01",
                "Role": "Students",
                "password": "12211770"
              },
              {
                "RollNum": 3,
                "div": "E",
                "PRN": 12211687,
                "Name": "DESHMUKH YASH SHIVAJI",
                "username": "yash.deshmukh22@vit.edu",
                "GroupID": "E01",
                "Role": "Students",
                "password": "12211687"
              },
              {
                "RollNum": 4,
                "div": "E",
                "PRN": 12210424,
                "Name": "DESHPANDE GAURAV GIRISH",
                "username": "gaurav.deshpande22@vit.edu",
                "GroupID": "E01",
                "Role": "Students",
                "password": "12210424"
              },
              {
                "RollNum": 5,
                "div": "E",
                "PRN": 12211515,
                "Name": "DESHPANDE MAYUR SANJAY",
                "username": "mayur.deshpande22@vit.edu",
                "GroupID": "E01",
                "Role": "Students",
                "password": "12211515"
              },
              {
                "RollNum": 6,
                "div": "E",
                "PRN": 12211616,
                "Name": "DESHPANDE NIKHIL NEERAJ",
                "username": "nikhil.deshpande22@vit.edu",
                "GroupID": "E01",
                "Role": "Students",
                "password": "12211616"
              },
              {
                "RollNum": 7,
                "div": "E",
                "PRN": 12211623,
                "Name": "DESHPANDE PRUTHA PRASAD",
                "username": "prutha.deshpande22@vit.edu",
                "GroupID": "E02",
                "Role": "Students",
                "password": "12211623"
              },
              {
                "RollNum": 8,
                "div": "E",
                "PRN": 12211753,
                "Name": "DESHPANDE RENUKA SANDEEP",
                "username": "renuka.deshpande22@vit.edu",
                "GroupID": "E02",
                "Role": "Students",
                "password": "12211753"
              },
              {
                "RollNum": 9,
                "div": "E",
                "PRN": 12211434,
                "Name": "DESHPANDE SHASHWAT SHEETAL",
                "username": "shashwat.deshpande221@vit.edu",
                "GroupID": "E02",
                "Role": "Students",
                "password": "12211434"
              },
              {
                "RollNum": 10,
                "div": "E",
                "PRN": 12211536,
                "Name": "DESHPANDE SHRIYA RAGHUNANDAN",
                "username": "shriyaraghunandan.deshpande22@vit.edu",
                "GroupID": "E02",
                "Role": "Students",
                "password": "12211536"
              },
              {
                "RollNum": 11,
                "div": "E",
                "PRN": 12210894,
                "Name": "DEVANSH GOYAL",
                "username": "devansh.goyal22@vit.edu",
                "GroupID": "E02",
                "Role": "Students",
                "password": "12210894"
              },
              {
                "RollNum": 12,
                "div": "E",
                "PRN": 12211625,
                "Name": "DEVANSH KABRA",
                "username": "devansh.kabra22@vit.edu",
                "GroupID": "E02",
                "Role": "Students",
                "password": "12211625"
              },
              {
                "RollNum": 13,
                "div": "E",
                "PRN": 12210933,
                "Name": "DEVASHISH KANHERE",
                "username": "devashish.kanhere22@vit.edu",
                "GroupID": "E03",
                "Role": "Students",
                "password": "12210933"
              },
              {
                "RollNum": 14,
                "div": "E",
                "PRN": 12210019,
                "Name": "DEVESH GARG",
                "username": "devesh.garg22@vit.edu",
                "GroupID": "E03",
                "Role": "Students",
                "password": "12210019"
              },
              {
                "RollNum": 15,
                "div": "E",
                "PRN": 12210101,
                "Name": "DEVKAR ROHAN RAJU",
                "username": "rohan.devkar22@vit.edu",
                "GroupID": "E03",
                "Role": "Students",
                "password": "12210101"
              },
              {
                "RollNum": 16,
                "div": "E",
                "PRN": 12211572,
                "Name": "DEWANGAN ANKUSH ROHIT",
                "username": "ankush.dewangan22@vit.edu",
                "GroupID": "E03",
                "Role": "Students",
                "password": "12211572"
              },
              {
                "RollNum": 17,
                "div": "E",
                "PRN": 12211781,
                "Name": "DHAGE ANKITA PRADEEP",
                "username": "ankita.dhage22@vit.edu",
                "GroupID": "E03",
                "Role": "Students",
                "password": "12211781"
              },
              {
                "RollNum": 18,
                "div": "E",
                "PRN": 12211696,
                "Name": "DHAGE SHARVARI MAHADEV",
                "username": "sharvari.dhage221@vit.edu",
                "GroupID": "E03",
                "Role": "Students",
                "password": "12211696"
              },
              {
                "RollNum": 19,
                "div": "E",
                "PRN": 12210735,
                "Name": "DHAKANE ADITYA AVINASH",
                "username": "aditya.dhakane22@vit.edu",
                "GroupID": "E04",
                "Role": "Students",
                "password": "12210735"
              },
              {
                "RollNum": 20,
                "div": "E",
                "PRN": 12210119,
                "Name": "DHAKANE SUVIDHA SUBHASH",
                "username": "suvidha.dhakane22@vit.edu",
                "GroupID": "E04",
                "Role": "Students",
                "password": "12210119"
              },
              {
                "RollNum": 21,
                "div": "E",
                "PRN": 12210732,
                "Name": "DHAKATE ATHARVA RUPESH",
                "username": "atharva.dhakate22@vit.edu",
                "GroupID": "E04",
                "Role": "Students",
                "password": "12210732"
              },
              {
                "RollNum": 22,
                "div": "E",
                "PRN": 12211397,
                "Name": "DHALE MAYURESH RAJESH",
                "username": "mayuresh.dhale22@vit.edu",
                "GroupID": "E04",
                "Role": "Students",
                "password": "12211397"
              },
              {
                "RollNum": 23,
                "div": "E",
                "PRN": 12211519,
                "Name": "DHAMANE VEDANT SHRIKANT",
                "username": "vedant.dhamane222@vit.edu",
                "GroupID": "E04",
                "Role": "Students",
                "password": "12211519"
              },
              {
                "RollNum": 24,
                "div": "E",
                "PRN": 12210070,
                "Name": "DHANASHRI P RAJPUT",
                "username": "dhanashri.rajput22@vit.edu",
                "GroupID": "E05",
                "Role": "Students",
                "password": "12210070"
              },
              {
                "RollNum": 25,
                "div": "E",
                "PRN": 12210250,
                "Name": "DHANE MANISH SHASHIKANT",
                "username": "manish.dhane22@vit.edu",
                "GroupID": "E05",
                "Role": "Students",
                "password": "12210250"
              },
              {
                "RollNum": 26,
                "div": "E",
                "PRN": 12210406,
                "Name": "DHANGAR AYUSH SANJAY",
                "username": "ayush.dhangar22@vit.edu",
                "GroupID": "E05",
                "Role": "Students",
                "password": "12210406"
              },
              {
                "RollNum": 27,
                "div": "E",
                "PRN": 12210377,
                "Name": "DHANGAR TANISH NARESH",
                "username": "tanish.dhangar22@vit.edu",
                "GroupID": "E05",
                "Role": "Students",
                "password": "12210377"
              },
              {
                "RollNum": 28,
                "div": "E",
                "PRN": 12211760,
                "Name": "DHARMADHIKARI ARYAN VIKAS",
                "username": "aryan.dharmadhikari221@vit.edu",
                "GroupID": "E05",
                "Role": "Students",
                "password": "12211760"
              },
              {
                "RollNum": 29,
                "div": "E",
                "PRN": 12210155,
                "Name": "DHEMBARE ROSHANI DNYANDEO",
                "username": "roshani.dhembare22@vit.edu",
                "GroupID": "E05",
                "Role": "Students",
                "password": "12210155"
              },
              {
                "RollNum": 30,
                "div": "E",
                "PRN": 12210323,
                "Name": "DHEND KRISHNA MAHESHKUMAR",
                "username": "krishna.dhend22@vit.edu",
                "GroupID": "E06",
                "Role": "Students",
                "password": "12210323"
              },
              {
                "RollNum": 31,
                "div": "E",
                "PRN": 12211027,
                "Name": "DHEPE NIHAR PARESH",
                "username": "nihar.dhepe22@vit.edu",
                "GroupID": "E06",
                "Role": "Students",
                "password": "12211027"
              },
              {
                "RollNum": 32,
                "div": "E",
                "PRN": 12210241,
                "Name": "DHEPE SHRUTI SURESH",
                "username": "shruti.dhepe22@vit.edu",
                "GroupID": "E06",
                "Role": "Students",
                "password": "12210241"
              },
              {
                "RollNum": 33,
                "div": "E",
                "PRN": 12211607,
                "Name": "DHOBLE ISHIKA GAJENDRA",
                "username": "ishika.dhoble221@vit.edu",
                "GroupID": "E06",
                "Role": "Students",
                "password": "12211607"
              },
              {
                "RollNum": 34,
                "div": "E",
                "PRN": 12210398,
                "Name": "DHOKANE SHIVAM SANTOSH",
                "username": "shivam.dhokane22@vit.edu",
                "GroupID": "E06",
                "Role": "Students",
                "password": "12210398"
              },
              {
                "RollNum": 35,
                "div": "E",
                "PRN": 12210183,
                "Name": "DHOKE MRUNALI RAJESH",
                "username": "mrunali.dhoke22@vit.edu",
                "GroupID": "E06",
                "Role": "Students",
                "password": "12210183"
              },
              {
                "RollNum": 36,
                "div": "E",
                "PRN": 12211214,
                "Name": "DHOLE KRUTIKA PRAFFULA",
                "username": "krutika.dhole22@vit.edu",
                "GroupID": "E07",
                "Role": "Students",
                "password": "12211214"
              },
              {
                "RollNum": 37,
                "div": "E",
                "PRN": 12210512,
                "Name": "DHOLE PRAJAKTA PRAMOD",
                "username": "prajakta.dhole22@vit.edu",
                "GroupID": "E07",
                "Role": "Students",
                "password": "12210512"
              },
              {
                "RollNum": 38,
                "div": "E",
                "PRN": 12210640,
                "Name": "DHOMANE SHREYAS SUNIL",
                "username": "shreyas.dhomane22@vit.edu",
                "GroupID": "E07",
                "Role": "Students",
                "password": "12210640"
              },
              {
                "RollNum": 39,
                "div": "E",
                "PRN": 12211232,
                "Name": "DHOMSE SIDDHESH MANGESH",
                "username": "siddhesh.dhomse221@vit.edu",
                "GroupID": "E07",
                "Role": "Students",
                "password": "12211232"
              },
              {
                "RollNum": 40,
                "div": "E",
                "PRN": 12210099,
                "Name": "DHONGADE PRATHMESH DEVDATTA",
                "username": "prathmesh.dhongade22@vit.edu",
                "GroupID": "E07",
                "Role": "Students",
                "password": "12210099"
              },
              {
                "RollNum": 41,
                "div": "E",
                "PRN": 12211517,
                "Name": "DHOOT HARSH CHANDRAKANT",
                "username": "harsh.dhoot22@vit.edu",
                "GroupID": "E07",
                "Role": "Students",
                "password": "12211517"
              },
              {
                "RollNum": 42,
                "div": "E",
                "PRN": 12211740,
                "Name": "DHOOT VINIT NILESH",
                "username": "vinit.dhoot222@vit.edu",
                "GroupID": "E08",
                "Role": "Students",
                "password": "12211740"
              },
              {
                "RollNum": 43,
                "div": "E",
                "PRN": 12211637,
                "Name": "DHRITI RAJEEV NAIR",
                "username": "dhriti.nair22@vit.edu",
                "GroupID": "E08",
                "Role": "Students",
                "password": "12211637"
              },
              {
                "RollNum": 44,
                "div": "E",
                "PRN": 12210198,
                "Name": "DHRUV AJESH SHARMA",
                "username": "ajesh.dhruv22@vit.edu",
                "GroupID": "E08",
                "Role": "Students",
                "password": "12210198"
              },
              {
                "RollNum": 45,
                "div": "E",
                "PRN": 12211756,
                "Name": "Dhruv Chaudhari",
                "username": "chaudhari.dhruv221@vit.edu",
                "GroupID": "E08",
                "Role": "Students",
                "password": "12211756"
              },
              {
                "RollNum": 46,
                "div": "E",
                "PRN": 12210009,
                "Name": "DHRUV RANJIT MULAY",
                "username": "dhruv.mulay22@vit.edu",
                "GroupID": "E08",
                "Role": "Students",
                "password": "12210009"
              },
              {
                "RollNum": 47,
                "div": "E",
                "PRN": 12210312,
                "Name": "DHULAP MRUNAL SANTOSH",
                "username": "mrunal.dhulap22@vit.edu",
                "GroupID": "E09",
                "Role": "Students",
                "password": "12210312"
              },
              {
                "RollNum": 48,
                "div": "E",
                "PRN": 12211288,
                "Name": "DHULE ADVAY RAMESH",
                "username": "advay.dhule221@vit.edu",
                "GroupID": "E09",
                "Role": "Students",
                "password": "12211288"
              },
              {
                "RollNum": 49,
                "div": "E",
                "PRN": 12211685,
                "Name": "DHUMAL ADITYARAJE AVINASH",
                "username": "adityaraje.dhumal221@vit.edu",
                "GroupID": "E09",
                "Role": "Students",
                "password": "12211685"
              },
              {
                "RollNum": 50,
                "div": "E",
                "PRN": 12210763,
                "Name": "DHUMAL AJINKYA AJIT",
                "username": "ajinkya.dhumal22@vit.edu",
                "GroupID": "E09",
                "Role": "Students",
                "password": "12210763"
              },
              {
                "RollNum": 51,
                "div": "E",
                "PRN": 12211312,
                "Name": "DHUMAL GAYATRI DEEPAK",
                "username": "gayatri.dhumal221@vit.edu",
                "GroupID": "E09",
                "Role": "Students",
                "password": "12211312"
              },
              {
                "RollNum": 52,
                "div": "E",
                "PRN": 12210134,
                "Name": "DHURVE GIRISH VIJAY",
                "username": "girish.dhurve22@vit.edu",
                "GroupID": "E09",
                "Role": "Students",
                "password": "12210134"
              },
              {
                "RollNum": 53,
                "div": "E",
                "PRN": 12210808,
                "Name": "DHURVE OM SANJAY",
                "username": "om.dhurve22@vit.edu",
                "GroupID": "E10",
                "Role": "Students",
                "password": "12210808"
              },
              {
                "RollNum": 54,
                "div": "E",
                "PRN": 12210708,
                "Name": "DHURVE SIDDHARTHA SANTOSH",
                "username": "siddhartha.dhurve22@vit.edu",
                "GroupID": "E10",
                "Role": "Students",
                "password": "12210708"
              },
              {
                "RollNum": 55,
                "div": "E",
                "PRN": 12211631,
                "Name": "DHYEY THAKKAR",
                "username": "dhyey.thakkar22@vit.edu",
                "GroupID": "E10",
                "Role": "Students",
                "password": "12211631"
              },
              {
                "RollNum": 56,
                "div": "E",
                "PRN": 12211588,
                "Name": "DIGHE ADITYA JITENDRA",
                "username": "aditya.dighe22@vit.edu",
                "GroupID": "E10",
                "Role": "Students",
                "password": "12211588"
              },
              {
                "RollNum": 57,
                "div": "E",
                "PRN": 12211579,
                "Name": "DINDORE SHRIRAM DHANANJAY",
                "username": "shriram.dindore22@vit.edu",
                "GroupID": "E10",
                "Role": "Students",
                "password": "12211579"
              },
              {
                "RollNum": 58,
                "div": "E",
                "PRN": 12211782,
                "Name": "DINKAR AAROH NUKUL",
                "username": "aaroh.dinkar221@vit.edu",
                "GroupID": "E10",
                "Role": "Students",
                "password": "12211782"
              },
              {
                "RollNum": 59,
                "div": "E",
                "PRN": 12210140,
                "Name": "DISHA HEMANT BORALE",
                "username": "disha.borale22@vit.edu",
                "GroupID": "E11",
                "Role": "Students",
                "password": "12210140"
              },
              {
                "RollNum": 60,
                "div": "E",
                "PRN": 12210813,
                "Name": "DIVATE YASH KUMAR",
                "username": "yash.divate22@vit.edu",
                "GroupID": "E11",
                "Role": "Students",
                "password": "12210813"
              },
              {
                "RollNum": 61,
                "div": "E",
                "PRN": 12210472,
                "Name": "DIWNALE TANVI SURESH",
                "username": "tanvi.diwnale22@vit.edu",
                "GroupID": "E11",
                "Role": "Students",
                "password": "12210472"
              },
              {
                "RollNum": 62,
                "div": "E",
                "PRN": 12210347,
                "Name": "DIXIT SHARDUL VINAY",
                "username": "shardul.dixit22@vit.edu",
                "GroupID": "E11",
                "Role": "Students",
                "password": "12210347"
              },
              {
                "RollNum": 63,
                "div": "E",
                "PRN": 12211047,
                "Name": "DOKHALE PORNIMA PRAVIN",
                "username": "pornima.dokhale22@vit.edu",
                "GroupID": "E11",
                "Role": "Students",
                "password": "12211047"
              },
              {
                "RollNum": 64,
                "div": "E",
                "PRN": 12210296,
                "Name": "DONE SHREYAS SANJAY",
                "username": "shreyas.done22@vit.edu",
                "GroupID": "E11",
                "Role": "Students",
                "password": "12210296"
              },
              {
                "RollNum": 65,
                "div": "E",
                "PRN": 12210146,
                "Name": "DONEWAR AMAN DILIP",
                "username": "aman.donewar22@vit.edu",
                "GroupID": "E12",
                "Role": "Students",
                "password": "12210146"
              },
              {
                "RollNum": 66,
                "div": "E",
                "PRN": 12211758,
                "Name": "DONGAONKAR PRAPTI PIYUSH",
                "username": "prapti.dongaonkar22@vit.edu",
                "GroupID": "E12",
                "Role": "Students",
                "password": "12211758"
              },
              {
                "RollNum": 67,
                "div": "E",
                "PRN": 12210783,
                "Name": "DONGARDIVE AYUSH PRAMOD",
                "username": "ayush.dongardive22@vit.edu",
                "GroupID": "E12",
                "Role": "Students",
                "password": "12210783"
              },
              {
                "RollNum": 68,
                "div": "E",
                "PRN": 12210692,
                "Name": "DONGARE MANAV SACHIN",
                "username": "manav.dongare22@vit.edu",
                "GroupID": "E12",
                "Role": "Students",
                "password": "12210692"
              },
              {
                "RollNum": 69,
                "div": "E",
                "PRN": 12211128,
                "Name": "DONGARE VANSHIKA DATTAKUMAR",
                "username": "vanshika.dongare22@vit.edu",
                "GroupID": "E12",
                "Role": "Students",
                "password": "12211128"
              },
              {
                "RollNum": 1,
                "div": "F",
                "PRN": 12210618,
                "Name": "DONGRE ANJALI YOGESHWAR",
                "username": "anjali.dongre22@vit.edu",
                "GroupID": "F01",
                "Role": "Students",
                "password": "12210618"
              },
              {
                "RollNum": 2,
                "div": "F",
                "PRN": 12211054,
                "Name": "DORAGE PRATHAMESH ABASO",
                "username": "prathamesh.dorage22@vit.edu",
                "GroupID": "F01",
                "Role": "Students",
                "password": "12211054"
              },
              {
                "RollNum": 3,
                "div": "F",
                "PRN": 12210012,
                "Name": "DORAK RAM SANTOSH",
                "username": "ram.dorak22@vit.edu",
                "GroupID": "F01",
                "Role": "Students",
                "password": "12210012"
              },
              {
                "RollNum": 4,
                "div": "F",
                "PRN": 12211600,
                "Name": "DORLE MARDAV PRASHANTKUMAR",
                "username": "mardav.dorle22@vit.edu",
                "GroupID": "F01",
                "Role": "Students",
                "password": "12211600"
              },
              {
                "RollNum": 5,
                "div": "F",
                "PRN": 12210629,
                "Name": "DORLE SAILEE SUSHANT",
                "username": "sailee.dorle22@vit.edu",
                "GroupID": "F01",
                "Role": "Students",
                "password": "12210629"
              },
              {
                "RollNum": 6,
                "div": "F",
                "PRN": 12211806,
                "Name": "DOSHI ARYA PREETAM",
                "username": "arya.doshi22@vit.edu",
                "GroupID": "F01",
                "Role": "Students",
                "password": "12211806"
              },
              {
                "RollNum": 7,
                "div": "F",
                "PRN": 12211541,
                "Name": "DOSHI PRANAV ANILKUMAR",
                "username": "pranav.doshi221@vit.edu",
                "GroupID": "F02",
                "Role": "Students",
                "password": "12211541"
              },
              {
                "RollNum": 8,
                "div": "F",
                "PRN": 12210341,
                "Name": "DOSHI YUGAM KRUNAL",
                "username": "yugam.doshi22@vit.edu",
                "GroupID": "F02",
                "Role": "Students",
                "password": "12210341"
              },
              {
                "RollNum": 9,
                "div": "F",
                "PRN": 12210437,
                "Name": "DUBLA MANALI SUNIL",
                "username": "manali.dubla22@vit.edu",
                "GroupID": "F02",
                "Role": "Students",
                "password": "12210437"
              },
              {
                "RollNum": 10,
                "div": "F",
                "PRN": 12210676,
                "Name": "DUDHE VAISHNAVI AJENDRA",
                "username": "vaishnavi.dudhe22@vit.edu",
                "GroupID": "F02",
                "Role": "Students",
                "password": "12210676"
              },
              {
                "RollNum": 11,
                "div": "F",
                "PRN": 12210285,
                "Name": "DURANI SHAUNAK SHIRISH",
                "username": "shaunak.durani22@vit.edu",
                "GroupID": "F02",
                "Role": "Students",
                "password": "12210285"
              },
              {
                "RollNum": 12,
                "div": "F",
                "PRN": 12210339,
                "Name": "ELKIWAR SNEHAL RAMLU",
                "username": "snehal.elkiwar22@vit.edu",
                "GroupID": "F02",
                "Role": "Students",
                "password": "12210339"
              },
              {
                "RollNum": 13,
                "div": "F",
                "PRN": 12210032,
                "Name": "ELTON JOSEPH LOBO",
                "username": "eltonjoseph.lobo22@vit.edu",
                "GroupID": "F03",
                "Role": "Students",
                "password": "12210032"
              },
              {
                "RollNum": 14,
                "div": "F",
                "PRN": 12210199,
                "Name": "ESHA MANHAS",
                "username": "manhas.esha22@vit.edu",
                "GroupID": "F03",
                "Role": "Students",
                "password": "12210199"
              },
              {
                "RollNum": 15,
                "div": "F",
                "PRN": 12211725,
                "Name": "FAND PIYUSH KASHINATH",
                "username": "piyush.fand22@vit.edu",
                "GroupID": "F03",
                "Role": "Students",
                "password": "12211725"
              },
              {
                "RollNum": 16,
                "div": "F",
                "PRN": 12210746,
                "Name": "FUKATE ADITYA SANJAY",
                "username": "aditya.fukate22@vit.edu",
                "GroupID": "F03",
                "Role": "Students",
                "password": "12210746"
              },
              {
                "RollNum": 17,
                "div": "F",
                "PRN": 12211699,
                "Name": "FULSAUNDAR SHREYAS KISHOR",
                "username": "shreyas.fulsaundar22@vit.edu",
                "GroupID": "F03",
                "Role": "Students",
                "password": "12211699"
              },
              {
                "RollNum": 18,
                "div": "F",
                "PRN": 12211666,
                "Name": "Prasanna Fuse",
                "username": "prasanna.fuse22@vit.edu",
                "GroupID": "F03",
                "Role": "Students",
                "password": "12211666"
              },
              {
                "RollNum": 19,
                "div": "F",
                "PRN": 12211576,
                "Name": "GABALE PRADYUMNA PRASHANT",
                "username": "pradyumna.gabale22@vit.edu",
                "GroupID": "F04",
                "Role": "Students",
                "password": "12211576"
              },
              {
                "RollNum": 20,
                "div": "F",
                "PRN": 12210293,
                "Name": "GABHANE DNYAJUSH DASHARATH",
                "username": "dnyajush.gabhane22@vit.edu",
                "GroupID": "F04",
                "Role": "Students",
                "password": "12210293"
              },
              {
                "RollNum": 21,
                "div": "F",
                "PRN": 12211691,
                "Name": "GADE ADITI VINIT",
                "username": "aditi.gade221@vit.edu",
                "GroupID": "F04",
                "Role": "Students",
                "password": "12211691"
              },
              {
                "RollNum": 22,
                "div": "F",
                "PRN": 12210550,
                "Name": "GADE SRUSHTI SACHIN",
                "username": "srushti.gade22@vit.edu",
                "GroupID": "F04",
                "Role": "Students",
                "password": "12210550"
              },
              {
                "RollNum": 23,
                "div": "F",
                "PRN": 12210279,
                "Name": "GADEKAR AKASH RAJESH",
                "username": "akash.gadekar22@vit.edu",
                "GroupID": "F04",
                "Role": "Students",
                "password": "12210279"
              },
              {
                "RollNum": 24,
                "div": "F",
                "PRN": 12211502,
                "Name": "GADEKAR SARTHAK JAGANNATH",
                "username": "sarthak.gadekar221@vit.edu",
                "GroupID": "F05",
                "Role": "Students",
                "password": "12211502"
              },
              {
                "RollNum": 25,
                "div": "F",
                "PRN": 12210066,
                "Name": "GADHE PUSHPAK NARESH",
                "username": "pushpak.gadhe22@vit.edu",
                "GroupID": "F05",
                "Role": "Students",
                "password": "12210066"
              },
              {
                "RollNum": 26,
                "div": "F",
                "PRN": 12211389,
                "Name": "GADPALE ASHNA ADHIR",
                "username": "ashna.gadpale22@vit.edu",
                "GroupID": "F05",
                "Role": "Students",
                "password": "12211389"
              },
              {
                "RollNum": 27,
                "div": "F",
                "PRN": 12211235,
                "Name": "GAIKWAD AADITYA AJIT",
                "username": "aaditya.gaikwad22@vit.edu",
                "GroupID": "F05",
                "Role": "Students",
                "password": "12211235"
              },
              {
                "RollNum": 28,
                "div": "F",
                "PRN": 12210992,
                "Name": "GAIKWAD PAVANRAJE NAMDEV",
                "username": "pavanraje.gaikwad22@vit.edu",
                "GroupID": "F05",
                "Role": "Students",
                "password": "12210992"
              },
              {
                "RollNum": 29,
                "div": "F",
                "PRN": 12210807,
                "Name": "GAIKWAD PRATIKSHA SURESH",
                "username": "pratiksha.gaikwad22@vit.edu",
                "GroupID": "F05",
                "Role": "Students",
                "password": "12210807"
              },
              {
                "RollNum": 30,
                "div": "F",
                "PRN": 12210124,
                "Name": "GAIKWAD PRIYANKA NANDKUMAR",
                "username": "priyanka.gaikwad22@vit.edu",
                "GroupID": "F06",
                "Role": "Students",
                "password": "12210124"
              },
              {
                "RollNum": 31,
                "div": "F",
                "PRN": 12210330,
                "Name": "GAIKWAD PRUTHVIRAJ SANTOSH",
                "username": "pruthviraj.gaikwad22@vit.edu",
                "GroupID": "F06",
                "Role": "Students",
                "password": "12210330"
              },
              {
                "RollNum": 32,
                "div": "F",
                "PRN": 12210085,
                "Name": "GAIKWAD RUTVIK KAKASAHEB",
                "username": "rutvik.gaikwad22@vit.edu",
                "GroupID": "F06",
                "Role": "Students",
                "password": "12210085"
              },
              {
                "RollNum": 33,
                "div": "F",
                "PRN": 12211706,
                "Name": "GAIKWAD SHRAVANI SUDHIR",
                "username": "shravani.gaikwad22@vit.edu",
                "GroupID": "F06",
                "Role": "Students",
                "password": "12211706"
              },
              {
                "RollNum": 34,
                "div": "F",
                "PRN": 12211378,
                "Name": "GAIKWAD SIDDHANT GIRISH",
                "username": "siddhant.gaikwad22@vit.edu",
                "GroupID": "F06",
                "Role": "Students",
                "password": "12211378"
              },
              {
                "RollNum": 35,
                "div": "F",
                "PRN": 12210475,
                "Name": "GAIKWAD SRUSTI BALU",
                "username": "srusti.gaikwad22@vit.edu",
                "GroupID": "F06",
                "Role": "Students",
                "password": "12210475"
              },
              {
                "RollNum": 36,
                "div": "F",
                "PRN": 12210658,
                "Name": "GAIKWAD SUYASH TANAJI",
                "username": "suyash.gaikwad22@vit.edu",
                "GroupID": "F07",
                "Role": "Students",
                "password": "12210658"
              },
              {
                "RollNum": 37,
                "div": "F",
                "PRN": 12211733,
                "Name": "GAIKWAD VAISHNAVI SHRIRAM",
                "username": "vaishnavi.gaikwad22@vit.edu",
                "GroupID": "F07",
                "Role": "Students",
                "password": "12211733"
              },
              {
                "RollNum": 38,
                "div": "F",
                "PRN": 12210129,
                "Name": "GAIKWAD VEDANT YOGESH",
                "username": "vedant.gaikwad22@vit.edu",
                "GroupID": "F07",
                "Role": "Students",
                "password": "12210129"
              },
              {
                "RollNum": 39,
                "div": "F",
                "PRN": 12210453,
                "Name": "GAJARLAWAR NISHANT PRASHANT",
                "username": "nishant.gajarlawar22@vit.edu",
                "GroupID": "F07",
                "Role": "Students",
                "password": "12210453"
              },
              {
                "RollNum": 40,
                "div": "F",
                "PRN": 12210730,
                "Name": "GAJBHIYE ABHINAY YUVRAJ",
                "username": "abhinay.gajbhiye22@vit.edu",
                "GroupID": "F07",
                "Role": "Students",
                "password": "12210730"
              },
              {
                "RollNum": 41,
                "div": "F",
                "PRN": 12211125,
                "Name": "GAJBHIYE PRANJAL VIKAS",
                "username": "pranjal.gajbhiye22@vit.edu",
                "GroupID": "F07",
                "Role": "Students",
                "password": "12211125"
              },
              {
                "RollNum": 42,
                "div": "F",
                "PRN": 12210485,
                "Name": "GAJDHANE PUSHKAR POPAT",
                "username": "pushkar.gajdhane22@vit.edu",
                "GroupID": "F08",
                "Role": "Students",
                "password": "12210485"
              },
              {
                "RollNum": 43,
                "div": "F",
                "PRN": 12211531,
                "Name": "GAKHARE DEWANSHU VIJAY",
                "username": "dewanshu.gakhare221@vit.edu",
                "GroupID": "F08",
                "Role": "Students",
                "password": "12211531"
              },
              {
                "RollNum": 44,
                "div": "F",
                "PRN": 12211752,
                "Name": "GANDHI KAVYANSH DEEPAK",
                "username": "kavyansh.gandhi221@vit.edu",
                "GroupID": "F08",
                "Role": "Students",
                "password": "12211752"
              },
              {
                "RollNum": 45,
                "div": "F",
                "PRN": 12211596,
                "Name": "GANDHI NIDHI NILESH",
                "username": "nidhi.gandhi22@vit.edu",
                "GroupID": "F08",
                "Role": "Students",
                "password": "12211596"
              },
              {
                "RollNum": 46,
                "div": "F",
                "PRN": 12210613,
                "Name": "GANDHI SAMIKA SANTOSH",
                "username": "samika.gandhi22@vit.edu",
                "GroupID": "F08",
                "Role": "Students",
                "password": "12210613"
              },
              {
                "RollNum": 47,
                "div": "F",
                "PRN": 12210435,
                "Name": "GANGODE SANKET DAULAT",
                "username": "sanket.gangode22@vit.edu",
                "GroupID": "F09",
                "Role": "Students",
                "password": "12210435"
              },
              {
                "RollNum": 48,
                "div": "F",
                "PRN": 12210747,
                "Name": "GARALE YASH NAVANATH",
                "username": "yash.garale22@vit.edu",
                "GroupID": "F09",
                "Role": "Students",
                "password": "12210747"
              },
              {
                "RollNum": 49,
                "div": "F",
                "PRN": 12211134,
                "Name": "Mohit Garg",
                "username": "mohit.garg22@vit.edu",
                "GroupID": "F09",
                "Role": "Students",
                "password": "12211134"
              },
              {
                "RollNum": 50,
                "div": "F",
                "PRN": 12211003,
                "Name": "GARJE KSHITIJA ANIL",
                "username": "kshitija.garje22@vit.edu",
                "GroupID": "F09",
                "Role": "Students",
                "password": "12211003"
              },
              {
                "RollNum": 51,
                "div": "F",
                "PRN": 12210652,
                "Name": "GARJE RUTUJA GORAKSH",
                "username": "rutuja.garje22@vit.edu",
                "GroupID": "F09",
                "Role": "Students",
                "password": "12210652"
              },
              {
                "RollNum": 52,
                "div": "F",
                "PRN": 12210025,
                "Name": "GARUD SWAPNIL CHAITANYA",
                "username": "swapnil.garud22@vit.edu",
                "GroupID": "F09",
                "Role": "Students",
                "password": "12210025"
              },
              {
                "RollNum": 53,
                "div": "F",
                "PRN": 12211597,
                "Name": "GARVIT KHANDELWAL",
                "username": "garvit.khandelwal22@vit.edu",
                "GroupID": "F10",
                "Role": "Students",
                "password": "12211597"
              },
              {
                "RollNum": 54,
                "div": "F",
                "PRN": 12211010,
                "Name": "GATHE ALOK SUBHASH",
                "username": "alok.gathe22@vit.edu",
                "GroupID": "F10",
                "Role": "Students",
                "password": "12211010"
              },
              {
                "RollNum": 55,
                "div": "F",
                "PRN": 12210700,
                "Name": "GAUR JITENDRA BABULAL",
                "username": "jitendra.gaur22@vit.edu",
                "GroupID": "F10",
                "Role": "Students",
                "password": "12210700"
              },
              {
                "RollNum": 56,
                "div": "F",
                "PRN": 12211503,
                "Name": "GAURAV SULSULE",
                "username": "gaurav.sulsule221@vit.edu",
                "GroupID": "F10",
                "Role": "Students",
                "password": "12211503"
              },
              {
                "RollNum": 57,
                "div": "F",
                "PRN": 12210254,
                "Name": "GAUTAM CHANDRAKANT WARVATKAR",
                "username": "gautam.warvatkar22@vit.edu",
                "GroupID": "F10",
                "Role": "Students",
                "password": "12210254"
              },
              {
                "RollNum": 58,
                "div": "F",
                "PRN": 12211584,
                "Name": "GAVADE ANIKET ANANDA",
                "username": "aniket.gavade22@vit.edu",
                "GroupID": "F10",
                "Role": "Students",
                "password": "12211584"
              },
              {
                "RollNum": 59,
                "div": "F",
                "PRN": 12210666,
                "Name": "GAVALI PRUTHAVIK MARUTI",
                "username": "pruthavik.gavali22@vit.edu",
                "GroupID": "F11",
                "Role": "Students",
                "password": "12210666"
              },
              {
                "RollNum": 60,
                "div": "F",
                "PRN": 12210480,
                "Name": "GAVATE ADITYA UMESH",
                "username": "aditya.gavate22@vit.edu",
                "GroupID": "F11",
                "Role": "Students",
                "password": "12210480"
              },
              {
                "RollNum": 61,
                "div": "F",
                "PRN": 12210329,
                "Name": "GAVIT JAYKUMAR MOHANDAS",
                "username": "jaykumar.gavit22@vit.edu",
                "GroupID": "F11",
                "Role": "Students",
                "password": "12210329"
              },
              {
                "RollNum": 62,
                "div": "F",
                "PRN": 12211099,
                "Name": "GAWADE RUSHIKESH SANJAY",
                "username": "rushikesh.gawade22@vit.edu",
                "GroupID": "F11",
                "Role": "Students",
                "password": "12211099"
              },
              {
                "RollNum": 63,
                "div": "F",
                "PRN": 12210290,
                "Name": "GAWAI SUMIT RAJU",
                "username": "sumit.gawai22@vit.edu",
                "GroupID": "F11",
                "Role": "Students",
                "password": "12210290"
              },
              {
                "RollNum": 64,
                "div": "F",
                "PRN": 12210941,
                "Name": "GAWANDE ANISH NITIN",
                "username": "anish.gawande22@vit.edu",
                "GroupID": "F11",
                "Role": "Students",
                "password": "12210941"
              },
              {
                "RollNum": 65,
                "div": "F",
                "PRN": 12211455,
                "Name": "Dnyaneshwar Chandan Gawande",
                "username": "dnyaneshwarchandan.gawande221@vit.edu",
                "GroupID": "F12",
                "Role": "Students",
                "password": "12211455"
              },
              {
                "RollNum": 66,
                "div": "F",
                "PRN": 12211068,
                "Name": "GAWANDE HARSHAL RAMESH",
                "username": "harshal.gawande22@vit.edu",
                "GroupID": "F12",
                "Role": "Students",
                "password": "12211068"
              },
              {
                "RollNum": 67,
                "div": "F",
                "PRN": 12210315,
                "Name": "GEJAGE VIPUL RAMESH",
                "username": "vipul.gejage22@vit.edu",
                "GroupID": "F12",
                "Role": "Students",
                "password": "12210315"
              },
              {
                "RollNum": 68,
                "div": "F",
                "PRN": 12210340,
                "Name": "GHATOLE MAYURI MADHAVRAO",
                "username": "mayuri.ghatole22@vit.edu",
                "GroupID": "F12",
                "Role": "Students",
                "password": "12210340"
              },
              {
                "RollNum": 69,
                "div": "F",
                "PRN": 12211449,
                "Name": "GHAVATE SARTHAK VISHNU",
                "username": "sarthak.ghavate22@vit.edu",
                "GroupID": "F12",
                "Role": "Students",
                "password": "12211449"
              },
              {
                "RollNum": 1,
                "div": "G",
                "PRN": 12211107,
                "Name": "GHODAKE KANISHKA SANJAY",
                "username": "kanishka.ghodake22@vit.edu",
                "GroupID": "G01",
                "Role": "Students",
                "password": "12211107"
              },
              {
                "RollNum": 2,
                "div": "G",
                "PRN": 12211521,
                "Name": "GHODAKE SHIVAM ARVIND",
                "username": "shivam.ghodake22@vit.edu",
                "GroupID": "G01",
                "Role": "Students",
                "password": "12211521"
              },
              {
                "RollNum": 3,
                "div": "G",
                "PRN": 12210572,
                "Name": "GHODKE SIDDHANT GAUTAM",
                "username": "siddhant.ghodke22@vit.edu",
                "GroupID": "G01",
                "Role": "Students",
                "password": "12210572"
              },
              {
                "RollNum": 4,
                "div": "G",
                "PRN": 12211104,
                "Name": "GHUGE ADITYA BALU",
                "username": "aditya.ghuge22@vit.edu",
                "GroupID": "G01",
                "Role": "Students",
                "password": "12211104"
              },
              {
                "RollNum": 5,
                "div": "G",
                "PRN": 12210586,
                "Name": "GHUGE DARSHAN SADASHIV",
                "username": "darshan.ghuge22@vit.edu",
                "GroupID": "G01",
                "Role": "Students",
                "password": "12210586"
              },
              {
                "RollNum": 6,
                "div": "G",
                "PRN": 12210374,
                "Name": "GHUGE DNYANESHWARI RAVINDRA",
                "username": "dnyaneshwari.ghuge22@vit.edu",
                "GroupID": "G01",
                "Role": "Students",
                "password": "12210374"
              },
              {
                "RollNum": 7,
                "div": "G",
                "PRN": 12210688,
                "Name": "GHULE CHAITRALI JAYRAM",
                "username": "chaitrali.ghule22@vit.edu",
                "GroupID": "G02",
                "Role": "Students",
                "password": "12210688"
              },
              {
                "RollNum": 8,
                "div": "G",
                "PRN": 12210637,
                "Name": "GHUME ABHISHEK JAYANT",
                "username": "abhishek.ghume22@vit.edu",
                "GroupID": "G02",
                "Role": "Students",
                "password": "12210637"
              },
              {
                "RollNum": 9,
                "div": "G",
                "PRN": 12211144,
                "Name": "GHUNDRE SAURABH MAHADEV",
                "username": "saurabh.ghundre22@vit.edu",
                "GroupID": "G02",
                "Role": "Students",
                "password": "12211144"
              },
              {
                "RollNum": 10,
                "div": "G",
                "PRN": 12211326,
                "Name": "GHURYE ADITYA ASHOK",
                "username": "aditya.ghurye221@vit.edu",
                "GroupID": "G02",
                "Role": "Students",
                "password": "12211326"
              },
              {
                "RollNum": 11,
                "div": "G",
                "PRN": 12210352,
                "Name": "GIRI SANIKA ASHOK",
                "username": "sanika.giri22@vit.edu",
                "GroupID": "G02",
                "Role": "Students",
                "password": "12210352"
              },
              {
                "RollNum": 12,
                "div": "G",
                "PRN": 12211613,
                "Name": "GODASE VAISHNAVI ABHIJIT",
                "username": "vaishnavi.godase22@vit.edu",
                "GroupID": "G02",
                "Role": "Students",
                "password": "12211613"
              },
              {
                "RollNum": 13,
                "div": "G",
                "PRN": 12210792,
                "Name": "GOLE RUSHIKESH SATISH",
                "username": "rushikesh.gole22@vit.edu",
                "GroupID": "G03",
                "Role": "Students",
                "password": "12210792"
              },
              {
                "RollNum": 14,
                "div": "G",
                "PRN": 12211186,
                "Name": "GOLE SRUSHTI SANJEEV",
                "username": "srushti.gole22@vit.edu",
                "GroupID": "G03",
                "Role": "Students",
                "password": "12211186"
              },
              {
                "RollNum": 15,
                "div": "G",
                "PRN": 12210826,
                "Name": "GOLEGAONKAR PURVA GIRISH",
                "username": "purva.golegaonkar22@vit.edu",
                "GroupID": "G03",
                "Role": "Students",
                "password": "12210826"
              },
              {
                "RollNum": 16,
                "div": "G",
                "PRN": 12210450,
                "Name": "Prayas Gondane",
                "username": "prayas.gondane22@vit.edu",
                "GroupID": "G03",
                "Role": "Students",
                "password": "12210450"
              },
              {
                "RollNum": 17,
                "div": "G",
                "PRN": 12211071,
                "Name": "GONDKAR ANIRUDDHA GANESH",
                "username": "aniruddha.gondkar22@vit.edu",
                "GroupID": "G03",
                "Role": "Students",
                "password": "12211071"
              },
              {
                "RollNum": 18,
                "div": "G",
                "PRN": 12210802,
                "Name": "GORAVE ADITYA SACHIN",
                "username": "aditya.gorave22@vit.edu",
                "GroupID": "G03",
                "Role": "Students",
                "password": "12210802"
              },
              {
                "RollNum": 19,
                "div": "G",
                "PRN": 12211656,
                "Name": "GORE KRUSHNA RAMDAS",
                "username": "krushna.gore221@vit.edu",
                "GroupID": "G04",
                "Role": "Students",
                "password": "12211656"
              },
              {
                "RollNum": 20,
                "div": "G",
                "PRN": 12210093,
                "Name": "GOSAVI BHAGYASHREE MADHUKARGIR",
                "username": "bhagyashree.gosavi22@vit.edu",
                "GroupID": "G04",
                "Role": "Students",
                "password": "12210093"
              },
              {
                "RollNum": 21,
                "div": "G",
                "PRN": 12210846,
                "Name": "GOTE TANMAY RUPESH",
                "username": "tanmay.gote22@vit.edu",
                "GroupID": "G04",
                "Role": "Students",
                "password": "12210846"
              },
              {
                "RollNum": 22,
                "div": "G",
                "PRN": 12210284,
                "Name": "GOTHWAL KARTARSINGH SAJJANSINGH",
                "username": "kartarsingh.gothwal22@vit.edu",
                "GroupID": "G04",
                "Role": "Students",
                "password": "12210284"
              },
              {
                "RollNum": 23,
                "div": "G",
                "PRN": 12210449,
                "Name": "GOVARDHANE PRANAV KAILAS",
                "username": "pranav.govardhane22@vit.edu",
                "GroupID": "G04",
                "Role": "Students",
                "password": "12210449"
              },
              {
                "RollNum": 24,
                "div": "G",
                "PRN": 12210151,
                "Name": "PRASAD GOVINDRAO WAGDE",
                "username": "prasad.wagde22@vit.edu",
                "GroupID": "G05",
                "Role": "Students",
                "password": "12210151"
              },
              {
                "RollNum": 25,
                "div": "G",
                "PRN": 12211490,
                "Name": "GUDE AYUSH AJAY",
                "username": "ayush.gude22@vit.edu",
                "GroupID": "G05",
                "Role": "Students",
                "password": "12211490"
              },
              {
                "RollNum": 26,
                "div": "G",
                "PRN": 12211750,
                "Name": "GUDI SWAROOP JAYATIRTH",
                "username": "swaroop.gudi22@vit.edu",
                "GroupID": "G05",
                "Role": "Students",
                "password": "12211750"
              },
              {
                "RollNum": 27,
                "div": "G",
                "PRN": 12210511,
                "Name": "GULHANE NANDINI DIGAMBAR",
                "username": "nandini.gulhane22@vit.edu",
                "GroupID": "G05",
                "Role": "Students",
                "password": "12210511"
              },
              {
                "RollNum": 28,
                "div": "G",
                "PRN": 12210394,
                "Name": "GULHANE VEDANT SUNIL",
                "username": "vedant.gulhane22@vit.edu",
                "GroupID": "G05",
                "Role": "Students",
                "password": "12210394"
              },
              {
                "RollNum": 29,
                "div": "G",
                "PRN": 12211632,
                "Name": "GUNJAL TANVI DHARMENDRA",
                "username": "tanvi.gunjal22@vit.edu",
                "GroupID": "G05",
                "Role": "Students",
                "password": "12211632"
              },
              {
                "RollNum": 30,
                "div": "G",
                "PRN": 12211151,
                "Name": "GUNJE SUHANI SHANKAR",
                "username": "suhani.gunje22@vit.edu",
                "GroupID": "G06",
                "Role": "Students",
                "password": "12211151"
              },
              {
                "RollNum": 31,
                "div": "G",
                "PRN": 12211647,
                "Name": "GURBANI GAURAV RAJESH",
                "username": "gaurav.gurbani22@vit.edu",
                "GroupID": "G06",
                "Role": "Students",
                "password": "12211647"
              },
              {
                "RollNum": 32,
                "div": "G",
                "PRN": 12211721,
                "Name": "HADKAR CHAITALI PRASHANT",
                "username": "chaitali.hadkar22@vit.edu",
                "GroupID": "G06",
                "Role": "Students",
                "password": "12211721"
              },
              {
                "RollNum": 33,
                "div": "G",
                "PRN": 12210492,
                "Name": "HAGARE PARSHWA SURESH",
                "username": "parshwa.hagare22@vit.edu",
                "GroupID": "G06",
                "Role": "Students",
                "password": "12210492"
              },
              {
                "RollNum": 34,
                "div": "G",
                "PRN": 12210494,
                "Name": "HAGE SEJAL SHRIKRUSHNA",
                "username": "sejal.hage22@vit.edu",
                "GroupID": "G06",
                "Role": "Students",
                "password": "12210494"
              },
              {
                "RollNum": 35,
                "div": "G",
                "PRN": 12210712,
                "Name": "HALADE ATHARVA RAJU",
                "username": "atharva.halade22@vit.edu",
                "GroupID": "G06",
                "Role": "Students",
                "password": "12210712"
              },
              {
                "RollNum": 36,
                "div": "G",
                "PRN": 12211020,
                "Name": "HALBE SOHAM SHAILESH",
                "username": "soham.halbe22@vit.edu",
                "GroupID": "G07",
                "Role": "Students",
                "password": "12211020"
              },
              {
                "RollNum": 37,
                "div": "G",
                "PRN": 12211646,
                "Name": "HAMLIN DEVADAS NADAR",
                "username": "devadas.hamlin22@vit.edu",
                "GroupID": "G07",
                "Role": "Students",
                "password": "12211646"
              },
              {
                "RollNum": 38,
                "div": "G",
                "PRN": 12211355,
                "Name": "HARALE ADITI ASHISH",
                "username": "aditi.harale221@vit.edu",
                "GroupID": "G07",
                "Role": "Students",
                "password": "12211355"
              },
              {
                "RollNum": 39,
                "div": "G",
                "PRN": 12210657,
                "Name": "HARSH SUNIL DHAKE",
                "username": "harsh.dhake22@vit.edu",
                "GroupID": "G07",
                "Role": "Students",
                "password": "12210657"
              },
              {
                "RollNum": 40,
                "div": "G",
                "PRN": 12210820,
                "Name": "HARSH SUNIL KOLARKAR",
                "username": "sunil.harsh22@vit.edu",
                "GroupID": "G07",
                "Role": "Students",
                "password": "12210820"
              },
              {
                "RollNum": 41,
                "div": "G",
                "PRN": 12211445,
                "Name": "HARSH VIRENDRA PATIL",
                "username": "virendra.harsh221@vit.edu",
                "GroupID": "G07",
                "Role": "Students",
                "password": "12211445"
              },
              {
                "RollNum": 42,
                "div": "G",
                "PRN": 12210103,
                "Name": "HARSHALI PRADIP KOTHAWADE",
                "username": "pradip.harshali22@vit.edu",
                "GroupID": "G08",
                "Role": "Students",
                "password": "12210103"
              },
              {
                "RollNum": 43,
                "div": "G",
                "PRN": 12211430,
                "Name": "HARSHITA YADAV",
                "username": "yadav.harshita22@vit.edu",
                "GroupID": "G08",
                "Role": "Students",
                "password": "12211430"
              },
              {
                "RollNum": 44,
                "div": "G",
                "PRN": 12211097,
                "Name": "HARSHWARDHAN UMESH BHADKE",
                "username": "umesh.harshwardhan22@vit.edu",
                "GroupID": "G08",
                "Role": "Students",
                "password": "12211097"
              },
              {
                "RollNum": 45,
                "div": "G",
                "PRN": 12210123,
                "Name": "HATEDIKAR TEJAS GAJANAN",
                "username": "tejas.hatedikar22@vit.edu",
                "GroupID": "G08",
                "Role": "Students",
                "password": "12210123"
              },
              {
                "RollNum": 46,
                "div": "G",
                "PRN": 12211792,
                "Name": "HAVALDAR AAMOD RAHUL",
                "username": "aamod.havaldar22@vit.edu",
                "GroupID": "G08",
                "Role": "Students",
                "password": "12211792"
              },
              {
                "RollNum": 47,
                "div": "G",
                "PRN": 12211233,
                "Name": "HEDA KRISHNA KIRAN",
                "username": "krishna.heda22@vit.edu",
                "GroupID": "G09",
                "Role": "Students",
                "password": "12211233"
              },
              {
                "RollNum": 48,
                "div": "G",
                "PRN": 12211509,
                "Name": "HEPAT OMKAR MANOHAR",
                "username": "omkar.hepat221@vit.edu",
                "GroupID": "G09",
                "Role": "Students",
                "password": "12211509"
              },
              {
                "RollNum": 49,
                "div": "G",
                "PRN": 12211563,
                "Name": "HEREKAR ISHAN RAJESH",
                "username": "ishan.herekar22@vit.edu",
                "GroupID": "G09",
                "Role": "Students",
                "password": "12211563"
              },
              {
                "RollNum": 50,
                "div": "G",
                "PRN": 12210120,
                "Name": "HIRAVE AVISHKAR SHIVAJI",
                "username": "avishkar.hirave22@vit.edu",
                "GroupID": "G09",
                "Role": "Students",
                "password": "12210120"
              },
              {
                "RollNum": 51,
                "div": "G",
                "PRN": 12210986,
                "Name": "HOTE GAURAV PRALHAD",
                "username": "gaurav.hote22@vit.edu",
                "GroupID": "G09",
                "Role": "Students",
                "password": "12210986"
              },
              {
                "RollNum": 52,
                "div": "G",
                "PRN": 12210344,
                "Name": "HRITESH RAJESH MAIKAP",
                "username": "hritesh.maikap22@vit.edu",
                "GroupID": "G09",
                "Role": "Students",
                "password": "12210344"
              },
              {
                "RollNum": 53,
                "div": "G",
                "PRN": 12210445,
                "Name": "HULENWAR HARSH PRAKASH",
                "username": "harsh.hulenwar22@vit.edu",
                "GroupID": "G10",
                "Role": "Students",
                "password": "12210445"
              },
              {
                "RollNum": 54,
                "Role": "Students",
                "password": ""
              },
              {
                "RollNum": 55,
                "div": "G",
                "PRN": 12211620,
                "Name": "INAMDAR CHINMAY SATISH",
                "username": "chinmay.inamdar22@vit.edu",
                "GroupID": "G10",
                "Role": "Students",
                "password": "12211620"
              },
              {
                "RollNum": 56,
                "div": "G",
                "PRN": 12211356,
                "Name": "INAMDAR YUVRAJ SHAILESH",
                "username": "yuvraj.inamdar22@vit.edu",
                "GroupID": "G10",
                "Role": "Students",
                "password": "12211356"
              },
              {
                "RollNum": 57,
                "div": "G",
                "PRN": 12211408,
                "Name": "INANI HARSHIT MAHENDRAKUMAR",
                "username": "harshit.inani22@vit.edu",
                "GroupID": "G10",
                "Role": "Students",
                "password": "12211408"
              },
              {
                "RollNum": 58,
                "div": "G",
                "PRN": 12210939,
                "Name": "INGALE CHINMAY DNYANESHWAR",
                "username": "chinmay.ingale22@vit.edu",
                "GroupID": "G10",
                "Role": "Students",
                "password": "12210939"
              },
              {
                "RollNum": 59,
                "div": "G",
                "PRN": 12211415,
                "Name": "INGAWALE VISHWARAJ SANDEEP",
                "username": "vishwaraj.ingawale221@vit.edu",
                "GroupID": "G11",
                "Role": "Students",
                "password": "12211415"
              },
              {
                "RollNum": 60,
                "div": "G",
                "PRN": 12210211,
                "Name": "INGLE PRADNYA ASHOK",
                "username": "pradnya.ingle22@vit.edu",
                "GroupID": "G11",
                "Role": "Students",
                "password": "12210211"
              },
              {
                "RollNum": 61,
                "div": "G",
                "PRN": 12210281,
                "Name": "INGLE PRASAD NANDKISHOR",
                "username": "prasad.ingle22@vit.edu",
                "GroupID": "G11",
                "Role": "Students",
                "password": "12210281"
              },
              {
                "RollNum": 62,
                "div": "G",
                "PRN": 12210020,
                "Name": "ISHAAQ SHAIKH",
                "username": "ishaaq.shaikh22@vit.edu",
                "GroupID": "G11",
                "Role": "Students",
                "password": "12210020"
              },
              {
                "RollNum": 63,
                "div": "G",
                "PRN": 12211458,
                "Name": "ISHITA RAMDASI",
                "username": "ramdasi.ishita22@vit.edu",
                "GroupID": "G11",
                "Role": "Students",
                "password": "12211458"
              },
              {
                "RollNum": 64,
                "div": "G",
                "PRN": 12210521,
                "Name": "JADHAO MAHESH DINKAR",
                "username": "mahesh.jadhao22@vit.edu",
                "GroupID": "G11",
                "Role": "Students",
                "password": "12210521"
              },
              {
                "RollNum": 65,
                "div": "G",
                "PRN": 12211608,
                "Name": "JADHAV ATHARVA AJAY",
                "username": "atharva.jadhav222@vit.edu",
                "GroupID": "G12",
                "Role": "Students",
                "password": "12211608"
              },
              {
                "RollNum": 66,
                "div": "G",
                "PRN": 12210185,
                "Name": "JADHAV ATHARVA GANESH",
                "username": "atharva.jadhav22@vit.edu",
                "GroupID": "G12",
                "Role": "Students",
                "password": "12210185"
              },
              {
                "RollNum": 67,
                "div": "G",
                "PRN": 12211135,
                "Name": "JADHAV CHAITANYA JAGDISH",
                "username": "chaitanya.jadhav22@vit.edu",
                "GroupID": "G12",
                "Role": "Students",
                "password": "12211135"
              },
              {
                "RollNum": 68,
                "div": "G",
                "PRN": 12211657,
                "Name": "JADHAV DAKSH DILIP",
                "username": "daksh.jadhav221@vit.edu",
                "GroupID": "G12",
                "Role": "Students",
                "password": "12211657"
              },
              {
                "RollNum": 69,
                "div": "G",
                "PRN": 12211452,
                "Name": "JADHAV DIGVIJAYY MUKUND",
                "username": "digvijayy.jadhav221@vit.edu",
                "GroupID": "G12",
                "Role": "Students",
                "password": "12211452"
              },
              {
                "RollNum": 1,
                "div": "H",
                "PRN": 12210100,
                "Name": "JADHAV NILESH HANAMANT",
                "username": "nilesh.jadhav22@vit.edu",
                "GroupID": "H01",
                "Role": "Students",
                "password": "12210100"
              },
              {
                "RollNum": 2,
                "div": "H",
                "PRN": 12211224,
                "Name": "JADHAV PRATIK SANTOSH",
                "username": "pratik.jadhav22@vit.edu",
                "GroupID": "H01",
                "Role": "Students",
                "password": "12211224"
              },
              {
                "RollNum": 3,
                "div": "H",
                "PRN": 12210088,
                "Name": "JADHAV PRITHVIRAJ DNYANESHWAR",
                "username": "prithviraj.jadhav22@vit.edu",
                "GroupID": "H01",
                "Role": "Students",
                "password": "12210088"
              },
              {
                "RollNum": 4,
                "div": "H",
                "PRN": 12210127,
                "Name": "JADHAV PRITHVIRAJ ROHIDAS",
                "username": "prithviraj.jadhav221@vit.edu",
                "GroupID": "H01",
                "Role": "Students",
                "password": "12210127"
              },
              {
                "RollNum": 5,
                "div": "H",
                "PRN": 12211779,
                "Name": "JADHAV RAVINDRA AVINASH",
                "username": "ravindra.jadhav221@vit.edu",
                "GroupID": "H01",
                "Role": "Students",
                "password": "12211779"
              },
              {
                "RollNum": 6,
                "div": "H",
                "PRN": 12210768,
                "Name": "Ritesh Jadhav",
                "username": "ritesh.jadhav22@vit.edu",
                "GroupID": "H01",
                "Role": "Students",
                "password": "12210768"
              },
              {
                "RollNum": 7,
                "div": "H",
                "PRN": 12211602,
                "Name": "JADHAV SAHIL MAHENDRA",
                "username": "sahil.jadhav221@vit.edu",
                "GroupID": "H02",
                "Role": "Students",
                "password": "12211602"
              },
              {
                "RollNum": 8,
                "div": "H",
                "PRN": 12210349,
                "Name": "JADHAV SANIKA ASHOK",
                "username": "sanika.jadhav22@vit.edu",
                "GroupID": "H02",
                "Role": "Students",
                "password": "12210349"
              },
              {
                "RollNum": 9,
                "div": "H",
                "PRN": 12210943,
                "Name": "JADHAV SARVESH RAJESH",
                "username": "sarvesh.jadhav22@vit.edu",
                "GroupID": "H02",
                "Role": "Students",
                "password": "12210943"
              },
              {
                "RollNum": 10,
                "div": "H",
                "PRN": 12210963,
                "Name": "JADHAV SHIVENDRA MAHADEV",
                "username": "shivendra.jadhav22@vit.edu",
                "GroupID": "H02",
                "Role": "Students",
                "password": "12210963"
              },
              {
                "RollNum": 11,
                "div": "H",
                "PRN": 12211183,
                "Name": "JADHAV SHREYASH VITTHAL",
                "username": "shreyash.jadhav22@vit.edu",
                "GroupID": "H02",
                "Role": "Students",
                "password": "12211183"
              },
              {
                "RollNum": 12,
                "div": "H",
                "PRN": 12210400,
                "Name": "JADHAV SHUBHAM MURLIDHAR",
                "username": "shubham.jadhav22@vit.edu",
                "GroupID": "H02",
                "Role": "Students",
                "password": "12210400"
              },
              {
                "RollNum": 13,
                "div": "H",
                "PRN": 12210476,
                "Name": "JADHAV SONIYA SATISH",
                "username": "soniya.jadhav22@vit.edu",
                "GroupID": "H03",
                "Role": "Students",
                "password": "12210476"
              },
              {
                "RollNum": 14,
                "div": "H",
                "PRN": 12210331,
                "Name": "JADHAV TANAYA MAKARAND",
                "username": "tanaya.jadhav22@vit.edu",
                "GroupID": "H03",
                "Role": "Students",
                "password": "12210331"
              },
              {
                "RollNum": 15,
                "div": "H",
                "PRN": 12211019,
                "Name": "JADHAV YUVRAJ DADARAO",
                "username": "yuvraj.jadhav22@vit.edu",
                "GroupID": "H03",
                "Role": "Students",
                "password": "12211019"
              },
              {
                "RollNum": 16,
                "div": "H",
                "PRN": 12211195,
                "Name": "JADHAVAR PREM PRAKASH",
                "username": "prem.jadhavar22@vit.edu",
                "GroupID": "H03",
                "Role": "Students",
                "password": "12211195"
              },
              {
                "RollNum": 17,
                "div": "H",
                "PRN": 12211599,
                "Name": "JAGDALE DNYANESHWARI SANJAY",
                "username": "dnyaneshwari.jagdale22@vit.edu",
                "GroupID": "H03",
                "Role": "Students",
                "password": "12211599"
              },
              {
                "RollNum": 18,
                "div": "H",
                "PRN": 12211385,
                "Name": "JAGTAP AYUSH VINOD",
                "username": "ayush.jagtap221@vit.edu",
                "GroupID": "H03",
                "Role": "Students",
                "password": "12211385"
              },
              {
                "RollNum": 19,
                "div": "H",
                "PRN": 12210880,
                "Name": "JAGTAP TANISHKA CHANDRASEN",
                "username": "tanishka.jagtap22@vit.edu",
                "GroupID": "H04",
                "Role": "Students",
                "password": "12210880"
              },
              {
                "RollNum": 20,
                "div": "H",
                "PRN": 12210911,
                "Name": "JAI DIPAK UGHADE",
                "username": "jai.ughade22@vit.edu",
                "GroupID": "H04",
                "Role": "Students",
                "password": "12210911"
              },
              {
                "RollNum": 21,
                "div": "H",
                "PRN": 12211635,
                "Name": "JAIN AASTHA ROSHAN",
                "username": "aastha.jain22@vit.edu",
                "GroupID": "H04",
                "Role": "Students",
                "password": "12211635"
              },
              {
                "RollNum": 22,
                "div": "H",
                "PRN": 12210996,
                "Name": "JAIN KRIYA KUMARPAL",
                "username": "kriya.jain22@vit.edu",
                "GroupID": "H04",
                "Role": "Students",
                "password": "12210996"
              },
              {
                "RollNum": 23,
                "div": "H",
                "PRN": 12211681,
                "Name": "JAIN NIKHIL NANDLAL",
                "username": "nikhil.jain22@vit.edu",
                "GroupID": "H04",
                "Role": "Students",
                "password": "12211681"
              },
              {
                "RollNum": 24,
                "div": "H",
                "PRN": 12210175,
                "Name": "JAIN PRATHAM PRAVIN",
                "username": "pratham.jain22@vit.edu",
                "GroupID": "H05",
                "Role": "Students",
                "password": "12210175"
              },
              {
                "RollNum": 25,
                "div": "H",
                "PRN": 12210591,
                "Name": "JAIN RISHI HARISHKUMAR",
                "username": "rishi.jain22@vit.edu",
                "GroupID": "H05",
                "Role": "Students",
                "password": "12210591"
              },
              {
                "RollNum": 26,
                "div": "H",
                "PRN": 12211065,
                "Name": "JAIN TANAY MAHENDRA",
                "username": "tanay.jain22@vit.edu",
                "GroupID": "H05",
                "Role": "Students",
                "password": "12211065"
              },
              {
                "RollNum": 27,
                "div": "H",
                "PRN": 12211742,
                "Name": "JAINIL VAIDYA",
                "username": "vaidya.jainil22@vit.edu",
                "GroupID": "H05",
                "Role": "Students",
                "password": "12211742"
              },
              {
                "RollNum": 28,
                "div": "H",
                "PRN": 12210252,
                "Name": "JAINIVAS ANANDHAN",
                "username": "jainivas.anandhan22@vit.edu",
                "GroupID": "H05",
                "Role": "Students",
                "password": "12210252"
              },
              {
                "RollNum": 29,
                "div": "H",
                "PRN": 12211598,
                "Name": "JAISWAL KRISHNA NILESH",
                "username": "krishna.jaiswal22@vit.edu",
                "GroupID": "H05",
                "Role": "Students",
                "password": "12211598"
              },
              {
                "RollNum": 30,
                "div": "H",
                "PRN": 12210452,
                "Name": "JAISWAL OM SACHIN",
                "username": "om.jaiswal22@vit.edu",
                "GroupID": "H06",
                "Role": "Students",
                "password": "12210452"
              },
              {
                "RollNum": 31,
                "div": "H",
                "PRN": 12211412,
                "Name": "JAISWAL PRITEN SUNIL",
                "username": "priten.jaiswal221@vit.edu",
                "GroupID": "H06",
                "Role": "Students",
                "password": "12211412"
              },
              {
                "RollNum": 32,
                "div": "H",
                "PRN": 12211694,
                "Name": "Radhika Jaju",
                "username": "radhika.jaju22@vit.edu",
                "GroupID": "H06",
                "Role": "Students",
                "password": "12211694"
              },
              {
                "RollNum": 33,
                "div": "H",
                "PRN": 12210371,
                "Name": "JAKAPURE NIKITA ANAND",
                "username": "nikita.jakapure22@vit.edu",
                "GroupID": "H06",
                "Role": "Students",
                "password": "12210371"
              },
              {
                "RollNum": 34,
                "div": "H",
                "PRN": 12211553,
                "Name": "JAKKAN SHANVI SHRINIWAS",
                "username": "shanvi.jakkan22@vit.edu",
                "GroupID": "H06",
                "Role": "Students",
                "password": "12211553"
              },
              {
                "RollNum": 35,
                "div": "H",
                "PRN": 12211001,
                "Name": "janhavi balasaheb awari",
                "username": "janhavi.awari22@vit.edu",
                "GroupID": "H06",
                "Role": "Students",
                "password": "12211001"
              },
              {
                "RollNum": 36,
                "div": "H",
                "PRN": 12210209,
                "Name": "JANNU",
                "username": "undefined.jannu22@vit.edu",
                "GroupID": "H07",
                "Role": "Students",
                "password": "12210209"
              },
              {
                "RollNum": 37,
                "div": "H",
                "PRN": 12211775,
                "Name": "JASUJA ISHITA ANIL",
                "username": "ishita.jasuja221@vit.edu",
                "GroupID": "H07",
                "Role": "Students",
                "password": "12211775"
              },
              {
                "RollNum": 38,
                "div": "H",
                "PRN": 12210436,
                "Name": "JATADE ADITYA LAXMAN",
                "username": "aditya.jatade22@vit.edu",
                "GroupID": "H07",
                "Role": "Students",
                "password": "12210436"
              },
              {
                "RollNum": 39,
                "div": "H",
                "PRN": 12210363,
                "Name": "JATHAR OM",
                "username": "om.jathar22@vit.edu",
                "GroupID": "H07",
                "Role": "Students",
                "password": "12210363"
              },
              {
                "RollNum": 40,
                "div": "H",
                "PRN": 12211655,
                "Name": "JAY DEEPAK PATIL",
                "username": "jay.patil22@vit.edu",
                "GroupID": "H07",
                "Role": "Students",
                "password": "12211655"
              },
              {
                "RollNum": 41,
                "div": "H",
                "PRN": 12211746,
                "Name": "JEEVAM CHIVATE",
                "username": "chivate.jeevam221@vit.edu",
                "GroupID": "H07",
                "Role": "Students",
                "password": "12211746"
              },
              {
                "RollNum": 42,
                "div": "H",
                "PRN": 12210667,
                "Name": "JHA ASHISHKUMAR RAVINDRA",
                "username": "ashishkumar.jha22@vit.edu",
                "GroupID": "H08",
                "Role": "Students",
                "password": "12210667"
              },
              {
                "RollNum": 43,
                "div": "H",
                "PRN": 12211808,
                "Name": "JHA VIVEK MANOJ",
                "username": "vivek.jha22@vit.edu",
                "GroupID": "H08",
                "Role": "Students",
                "password": "12211808"
              },
              {
                "RollNum": 44,
                "div": "H",
                "PRN": 12210355,
                "Name": "JIVA SHELKE",
                "username": "jiva.shelke22@vit.edu",
                "GroupID": "H08",
                "Role": "Students",
                "password": "12210355"
              },
              {
                "RollNum": 45,
                "div": "H",
                "PRN": 12210034,
                "Name": "JOSEPH ABRAHAM",
                "username": "joseph.abraham22@vit.edu",
                "GroupID": "H08",
                "Role": "Students",
                "password": "12210034"
              },
              {
                "RollNum": 46,
                "div": "H",
                "PRN": 12210152,
                "Name": "JOSHI ANUSHKA AVINASH",
                "username": "anushka.joshi22@vit.edu",
                "GroupID": "H08",
                "Role": "Students",
                "password": "12210152"
              },
              {
                "RollNum": 47,
                "div": "H",
                "PRN": 12211591,
                "Name": "JOSHI ATHARV GOPAL",
                "username": "atharv.joshi221@vit.edu",
                "GroupID": "H09",
                "Role": "Students",
                "password": "12211591"
              },
              {
                "RollNum": 48,
                "div": "H",
                "PRN": 12210317,
                "Name": "JOSHI ATHARVA CHAITANYA",
                "username": "atharva.joshi22@vit.edu",
                "GroupID": "H09",
                "Role": "Students",
                "password": "12210317"
              },
              {
                "RollNum": 49,
                "div": "H",
                "PRN": 12211766,
                "Name": "JOSHI AYUSH PRAVIN",
                "username": "ayush.joshi22@vit.edu",
                "GroupID": "H09",
                "Role": "Students",
                "password": "12211766"
              },
              {
                "RollNum": 50,
                "div": "H",
                "PRN": 12211748,
                "Name": "JOSHI PALASH PRASHANT",
                "username": "palash.joshi221@vit.edu",
                "GroupID": "H09",
                "Role": "Students",
                "password": "12211748"
              },
              {
                "RollNum": 51,
                "div": "H",
                "PRN": 12211754,
                "Name": "JOSHI RUJUTA RAJESH",
                "username": "rujuta.joshi22@vit.edu",
                "GroupID": "H09",
                "Role": "Students",
                "password": "12211754"
              },
              {
                "RollNum": 52,
                "div": "H",
                "PRN": 12211289,
                "Name": "JOSHI SOHAM CHANDRASHEKHAR",
                "username": "soham.joshi221@vit.edu",
                "GroupID": "H09",
                "Role": "Students",
                "password": "12211289"
              },
              {
                "RollNum": 53,
                "div": "H",
                "PRN": 12210912,
                "Name": "JOSHI SWADHA SHREEKANT",
                "username": "swadha.joshi22@vit.edu",
                "GroupID": "H10",
                "Role": "Students",
                "password": "12210912"
              },
              {
                "RollNum": 54,
                "div": "H",
                "PRN": 12210190,
                "Name": "JUMBAD VARAD BABASAHEB",
                "username": "varad.jumbad22@vit.edu",
                "GroupID": "H10",
                "Role": "Students",
                "password": "12210190"
              },
              {
                "RollNum": 55,
                "div": "H",
                "PRN": 12210444,
                "Name": "JUNGADE TANVEE UMESH",
                "username": "tanvee.jungade22@vit.edu",
                "GroupID": "H10",
                "Role": "Students",
                "password": "12210444"
              },
              {
                "RollNum": 56,
                "div": "H",
                "PRN": 12210403,
                "Name": "JUNGHARE PRANAY MAHENDRA",
                "username": "pranay.junghare22@vit.edu",
                "GroupID": "H10",
                "Role": "Students",
                "password": "12210403"
              },
              {
                "RollNum": 57,
                "div": "H",
                "PRN": 12211514,
                "Name": "JUNGHARE RUGVED PRADIP",
                "username": "rugved.junghare221@vit.edu",
                "GroupID": "H10",
                "Role": "Students",
                "password": "12211514"
              },
              {
                "RollNum": 58,
                "div": "H",
                "PRN": 12210457,
                "Name": "KABADE MOHAN UDAY",
                "username": "mohan.kabade22@vit.edu",
                "GroupID": "H10",
                "Role": "Students",
                "password": "12210457"
              },
              {
                "RollNum": 59,
                "div": "H",
                "PRN": 12211382,
                "Name": "KAD SARISH UMESH",
                "username": "sarish.kad22@vit.edu",
                "GroupID": "H11",
                "Role": "Students",
                "password": "12211382"
              },
              {
                "RollNum": 60,
                "div": "H",
                "PRN": 12211518,
                "Name": "KADAM ABHISHEK SANJAY",
                "username": "abhishek.kadam221@vit.edu",
                "GroupID": "H11",
                "Role": "Students",
                "password": "12211518"
              },
              {
                "RollNum": 61,
                "div": "H",
                "PRN": 12211726,
                "Name": "KADAM ANUP SURESHRAO",
                "username": "anup.kadam22@vit.edu",
                "GroupID": "H11",
                "Role": "Students",
                "password": "12211726"
              },
              {
                "RollNum": 62,
                "div": "H",
                "PRN": 12210805,
                "Name": "KADAM ARUSHI NARAYAN",
                "username": "arushi.kadam22@vit.edu",
                "GroupID": "H11",
                "Role": "Students",
                "password": "12210805"
              },
              {
                "RollNum": 63,
                "div": "H",
                "PRN": 12211795,
                "Name": "KADAM ATHARVA UMESH",
                "username": "atharva.kadam22@vit.edu",
                "GroupID": "H11",
                "Role": "Students",
                "password": "12211795"
              },
              {
                "RollNum": 64,
                "div": "H",
                "PRN": 12210834,
                "Name": "KADAM SAI JAGDISH",
                "username": "sai.kadam22@vit.edu",
                "GroupID": "H11",
                "Role": "Students",
                "password": "12210834"
              },
              {
                "RollNum": 65,
                "div": "H",
                "PRN": 12210482,
                "Name": "KADAM SANIKA VINAYAK",
                "username": "sanika.kadam22@vit.edu",
                "GroupID": "H12",
                "Role": "Students",
                "password": "12210482"
              },
              {
                "RollNum": 66,
                "div": "H",
                "PRN": 12211592,
                "Name": "KADAM SAURABH ANNASAHEB",
                "username": "saurabh.kadam221@vit.edu",
                "GroupID": "H12",
                "Role": "Students",
                "password": "12211592"
              },
              {
                "RollNum": 67,
                "div": "H",
                "PRN": 12210448,
                "Name": "KADAM SAYALI NILESH",
                "username": "sayali.kadam22@vit.edu",
                "GroupID": "H12",
                "Role": "Students",
                "password": "12210448"
              },
              {
                "RollNum": 68,
                "div": "H",
                "PRN": 12211395,
                "Name": "KAHANE GEETA JAGANNATH",
                "username": "geeta.kahane22@vit.edu",
                "GroupID": "H12",
                "Role": "Students",
                "password": "12211395"
              },
              {
                "RollNum": 69,
                "div": "H",
                "PRN": 12210626,
                "Name": "KAKADE ANKITA SANJAY",
                "username": "ankita.kakade22@vit.edu",
                "GroupID": "H12",
                "Role": "Students",
                "password": "12210626"
              },
              {
                "RollNum": 1,
                "div": "I",
                "PRN": 12211731,
                "Name": "KAKADE ARYAN VIJAY",
                "username": "aryan.kakade22@vit.edu",
                "GroupID": "I01",
                "Role": "Students",
                "password": "12211731"
              },
              {
                "RollNum": 2,
                "div": "I",
                "PRN": 12211165,
                "Name": "KAKADE DHEERAJ NARAYANRAO",
                "username": "dheeraj.kakade22@vit.edu",
                "GroupID": "I01",
                "Role": "Students",
                "password": "12211165"
              },
              {
                "RollNum": 3,
                "div": "I",
                "PRN": 12210215,
                "Name": "KAKADE SHANTANU MAHENDRA",
                "username": "shantanu.kakade22@vit.edu",
                "GroupID": "I01",
                "Role": "Students",
                "password": "12210215"
              },
              {
                "RollNum": 4,
                "div": "I",
                "PRN": 12210333,
                "Name": "KAKARWAL URMILA UDALSING",
                "username": "urmila.kakarwal22@vit.edu",
                "GroupID": "I01",
                "Role": "Students",
                "password": "12210333"
              },
              {
                "RollNum": 5,
                "div": "I",
                "PRN": 12211360,
                "Name": "KALAMKAR KRUSHNA PRAVIN",
                "username": "krushna.kalamkar22@vit.edu",
                "GroupID": "I01",
                "Role": "Students",
                "password": "12211360"
              },
              {
                "RollNum": 6,
                "div": "I",
                "PRN": 12210601,
                "Name": "KALBHOR ANIKET JITENDRA",
                "username": "aniket.kalbhor22@vit.edu",
                "GroupID": "I01",
                "Role": "Students",
                "password": "12210601"
              },
              {
                "RollNum": 7,
                "div": "I",
                "PRN": 12210671,
                "Name": "KALE ANUSHKA JYOTICHANDRA",
                "username": "anushka.kale22@vit.edu",
                "GroupID": "I02",
                "Role": "Students",
                "password": "12210671"
              },
              {
                "RollNum": 8,
                "div": "I",
                "PRN": 12211277,
                "Name": "KALE DEEP ANIL",
                "username": "deep.kale221@vit.edu",
                "GroupID": "I02",
                "Role": "Students",
                "password": "12211277"
              },
              {
                "RollNum": 9,
                "div": "I",
                "PRN": 12210181,
                "Name": "KALE HARSHVARDHAN DADASO",
                "username": "harshvardhan.kale22@vit.edu",
                "GroupID": "I02",
                "Role": "Students",
                "password": "12210181"
              },
              {
                "RollNum": 10,
                "div": "I",
                "PRN": 12211751,
                "Name": "KALE ISHIKA RINA",
                "username": "ishika.kale221@vit.edu",
                "GroupID": "I02",
                "Role": "Students",
                "password": "12211751"
              },
              {
                "RollNum": 11,
                "div": "I",
                "PRN": 12211465,
                "Name": "KALE JAEE RISHIKESH",
                "username": "jaee.kale222@vit.edu",
                "GroupID": "I02",
                "Role": "Students",
                "password": "12211465"
              },
              {
                "RollNum": 12,
                "div": "I",
                "PRN": 12210131,
                "Name": "KALE NIRJALA RAMESH",
                "username": "nirjala.kale22@vit.edu",
                "GroupID": "I02",
                "Role": "Students",
                "password": "12210131"
              },
              {
                "RollNum": 13,
                "div": "I",
                "PRN": 12210555,
                "Name": "KALE PARTH BRAMHA",
                "username": "parth.kale22@vit.edu",
                "GroupID": "I03",
                "Role": "Students",
                "password": "12210555"
              },
              {
                "RollNum": 14,
                "div": "I",
                "PRN": 12210798,
                "Name": "KALE PRADUNYA PRAMOD",
                "username": "pradunya.kale22@vit.edu",
                "GroupID": "I03",
                "Role": "Students",
                "password": "12210798"
              },
              {
                "RollNum": 15,
                "div": "I",
                "PRN": 12211665,
                "Name": "KALE PRANAV RAVINDRA",
                "username": "pranav.kale22@vit.edu",
                "GroupID": "I03",
                "Role": "Students",
                "password": "12211665"
              },
              {
                "RollNum": 16,
                "div": "I",
                "PRN": 12210028,
                "Name": "KALLURWAR PARTH VISHAL",
                "username": "parth.kallurwar22@vit.edu",
                "GroupID": "I03",
                "Role": "Students",
                "password": "12210028"
              },
              {
                "RollNum": 17,
                "div": "I",
                "PRN": 12211641,
                "Name": "KALRAO KSHITIJ SANJAY",
                "username": "kshitij.kalrao22@vit.edu",
                "GroupID": "I03",
                "Role": "Students",
                "password": "12211641"
              },
              {
                "RollNum": 18,
                "div": "I",
                "PRN": 12211803,
                "Name": "KALUSHE TEJAS PRAMOD",
                "username": "tejas.kalushe22@vit.edu",
                "GroupID": "I03",
                "Role": "Students",
                "password": "12211803"
              },
              {
                "RollNum": 19,
                "div": "I",
                "PRN": 12210537,
                "Name": "KAMAT NINAD SUNIL",
                "username": "ninad.kamat22@vit.edu",
                "GroupID": "I04",
                "Role": "Students",
                "password": "12210537"
              },
              {
                "RollNum": 20,
                "div": "I",
                "PRN": 12210786,
                "Name": "KAMBLE AKANKSHA BHIMRAO",
                "username": "akanksha.kamble22@vit.edu",
                "GroupID": "I04",
                "Role": "Students",
                "password": "12210786"
              },
              {
                "RollNum": 21,
                "div": "I",
                "PRN": 12210269,
                "Name": "KAMBLE DHRUVESH KAVIRAJ",
                "username": "dhruvesh.kamble22@vit.edu",
                "GroupID": "I04",
                "Role": "Students",
                "password": "12210269"
              },
              {
                "RollNum": 22,
                "div": "I",
                "PRN": 12210275,
                "Name": "KAMBLE MANASI RAMDAS",
                "username": "manasi.kamble22@vit.edu",
                "GroupID": "I04",
                "Role": "Students",
                "password": "12210275"
              },
              {
                "RollNum": 23,
                "div": "I",
                "PRN": 12211301,
                "Name": "KAMBLE PRASAD AMAR",
                "username": "prasad.kamble221@vit.edu",
                "GroupID": "I04",
                "Role": "Students",
                "password": "12211301"
              },
              {
                "RollNum": 24,
                "div": "I",
                "PRN": 12210178,
                "Name": "KAMBLE RUCHITA BANDUJI",
                "username": "ruchita.kamble22@vit.edu",
                "GroupID": "I05",
                "Role": "Students",
                "password": "12210178"
              },
              {
                "RollNum": 25,
                "div": "I",
                "PRN": 12210680,
                "Name": "KAMBLE SAMARTH DILIP",
                "username": "samarth.kamble22@vit.edu",
                "GroupID": "I05",
                "Role": "Students",
                "password": "12210680"
              },
              {
                "RollNum": 26,
                "div": "I",
                "PRN": 12211046,
                "Name": "KAMINWAR ANJALI LAXMIKANT",
                "username": "anjali.kaminwar22@vit.edu",
                "GroupID": "I05",
                "Role": "Students",
                "password": "12211046"
              },
              {
                "RollNum": 27,
                "div": "I",
                "PRN": 12211759,
                "Name": "KANADKHEDKAR OMKAR SACHIN",
                "username": "omkar.kanadkhedkar22@vit.edu",
                "GroupID": "I05",
                "Role": "Students",
                "password": "12211759"
              },
              {
                "RollNum": 28,
                "div": "I",
                "PRN": 12211417,
                "Name": "KANAWADE SUJIT BHASKAR",
                "username": "sujit.kanawade221@vit.edu",
                "GroupID": "I05",
                "Role": "Students",
                "password": "12211417"
              },
              {
                "RollNum": 29,
                "div": "I",
                "PRN": 12210243,
                "Name": "KANDHARE SANTOSH DATTA",
                "username": "santosh.kandhare22@vit.edu",
                "GroupID": "I05",
                "Role": "Students",
                "password": "12210243"
              },
              {
                "RollNum": 30,
                "div": "I",
                "PRN": 12210169,
                "Name": "KAPASE AASHISH DATTATRAY",
                "username": "aashish.kapase22@vit.edu",
                "GroupID": "I06",
                "Role": "Students",
                "password": "12210169"
              },
              {
                "RollNum": 31,
                "div": "I",
                "PRN": 12211669,
                "Name": "KAPASE SAHIL CHANGDEV",
                "username": "sahil.kapase221@vit.edu",
                "GroupID": "I06",
                "Role": "Students",
                "password": "12211669"
              },
              {
                "RollNum": 32,
                "div": "I",
                "PRN": 12211559,
                "Name": "KAPIL SANGAMESHWAR",
                "username": "kapil.sangameshwar22@vit.edu",
                "GroupID": "I06",
                "Role": "Students",
                "password": "12211559"
              },
              {
                "RollNum": 33,
                "div": "I",
                "PRN": 12211155,
                "Name": "KAPRE VED KEDAR",
                "username": "ved.kapre22@vit.edu",
                "GroupID": "I06",
                "Role": "Students",
                "password": "12211155"
              },
              {
                "RollNum": 34,
                "div": "I",
                "PRN": 12210126,
                "Name": "KAPSE BHAKTI SHRIRAM",
                "username": "bhakti.kapse22@vit.edu",
                "GroupID": "I06",
                "Role": "Students",
                "password": "12210126"
              },
              {
                "RollNum": 35,
                "div": "I",
                "PRN": 12210357,
                "Name": "KAPSE YOGITA DATTATRAYA",
                "username": "yogita.kapse22@vit.edu",
                "GroupID": "I06",
                "Role": "Students",
                "password": "12210357"
              },
              {
                "RollNum": 36,
                "div": "I",
                "PRN": 12211448,
                "Name": "KAPUSKARI ONKAR NAGNATH",
                "username": "onkar.kapuskari221@vit.edu",
                "GroupID": "I07",
                "Role": "Students",
                "password": "12211448"
              },
              {
                "RollNum": 37,
                "div": "I",
                "PRN": 12210612,
                "Name": "KARAN ADITYA HARSHEY",
                "username": "karan.harshey22@vit.edu",
                "GroupID": "I07",
                "Role": "Students",
                "password": "12210612"
              },
              {
                "RollNum": 38,
                "div": "I",
                "PRN": 12210822,
                "Name": "KARANDE PRATHAMESH SUJITKUMAR",
                "username": "prathamesh.karande22@vit.edu",
                "GroupID": "I07",
                "Role": "Students",
                "password": "12210822"
              },
              {
                "RollNum": 39,
                "div": "I",
                "PRN": 12210223,
                "Name": "KARANDIKAR SOHAM RAVINDRA",
                "username": "soham.karandikar22@vit.edu",
                "GroupID": "I07",
                "Role": "Students",
                "password": "12210223"
              },
              {
                "RollNum": 40,
                "div": "I",
                "PRN": 12210326,
                "Name": "KARDE PRATIK BIBHISHAN",
                "username": "pratik.karde22@vit.edu",
                "GroupID": "I07",
                "Role": "Students",
                "password": "12210326"
              },
              {
                "RollNum": 41,
                "div": "I",
                "PRN": 12211807,
                "Name": "KARMALKAR APOORV MANGESH",
                "username": "apoorv.karmalkar221@vit.edu",
                "GroupID": "I07",
                "Role": "Students",
                "password": "12211807"
              },
              {
                "RollNum": 42,
                "div": "I",
                "PRN": 12211078,
                "Name": "KARMANKAR NIKHIL KAWDU",
                "username": "nikhil.karmankar22@vit.edu",
                "GroupID": "I08",
                "Role": "Students",
                "password": "12211078"
              },
              {
                "RollNum": 43,
                "div": "I",
                "PRN": 12210498,
                "Name": "KARSI LIMAY KAMALSING",
                "username": "limay.karsi22@vit.edu",
                "GroupID": "I08",
                "Role": "Students",
                "password": "12210498"
              },
              {
                "RollNum": 44,
                "div": "I",
                "PRN": 12210222,
                "Name": "KARTIK MAHADEO PALVE",
                "username": "mahadeo.kartik22@vit.edu",
                "GroupID": "I08",
                "Role": "Students",
                "password": "12210222"
              },
              {
                "RollNum": 45,
                "div": "I",
                "PRN": 12210031,
                "Name": "KARVIR SHAUNAK SUNIL",
                "username": "shaunak.karvir22@vit.edu",
                "GroupID": "I08",
                "Role": "Students",
                "password": "12210031"
              },
              {
                "RollNum": 46,
                "div": "I",
                "PRN": 12210553,
                "Name": "KASHISH VITTHAL VIDHATE",
                "username": "vitthal.kashish22@vit.edu",
                "GroupID": "I08",
                "Role": "Students",
                "password": "12210553"
              },
              {
                "RollNum": 47,
                "div": "I",
                "PRN": 12211574,
                "Name": "KASLIWAL TARUN MUKESH",
                "username": "tarun.kasliwal22@vit.edu",
                "GroupID": "I09",
                "Role": "Students",
                "password": "12211574"
              },
              {
                "RollNum": 48,
                "div": "I",
                "PRN": 12210615,
                "Name": "KASODEKAR MANAS AMIT",
                "username": "manas.kasodekar22@vit.edu",
                "GroupID": "I09",
                "Role": "Students",
                "password": "12210615"
              },
              {
                "RollNum": 49,
                "div": "I",
                "PRN": 12211425,
                "Name": "KASURDE SOHAM NILESH",
                "username": "soham.kasurde221@vit.edu",
                "GroupID": "I09",
                "Role": "Students",
                "password": "12211425"
              },
              {
                "RollNum": 50,
                "div": "I",
                "PRN": 12210248,
                "Name": "KASWA SIDDHANT AMOL",
                "username": "siddhant.kaswa22@vit.edu",
                "GroupID": "I09",
                "Role": "Students",
                "password": "12210248"
              },
              {
                "RollNum": 51,
                "div": "I",
                "PRN": 12211442,
                "Name": "KATE VEDANT RAVINDRA",
                "username": "vedant.kate22@vit.edu",
                "GroupID": "I09",
                "Role": "Students",
                "password": "12211442"
              },
              {
                "RollNum": 52,
                "div": "I",
                "PRN": 12211614,
                "Name": "KATE YASH RAHUL",
                "username": "yash.kate22@vit.edu",
                "GroupID": "I09",
                "Role": "Students",
                "password": "12211614"
              },
              {
                "RollNum": 53,
                "div": "I",
                "PRN": 12210246,
                "Name": "KATEPALLEWAR PRATHMESH SURESH",
                "username": "prathmesh.katepallewar22@vit.edu",
                "GroupID": "I10",
                "Role": "Students",
                "password": "12210246"
              },
              {
                "RollNum": 54,
                "div": "I",
                "PRN": 12211402,
                "Name": "KATHAR VALLABH SANJAY",
                "username": "vallabh.kathar22@vit.edu",
                "GroupID": "I10",
                "Role": "Students",
                "password": "12211402"
              },
              {
                "RollNum": 55,
                "div": "I",
                "PRN": 12210893,
                "Name": "KATKAR MAITREY BHASKAR",
                "username": "maitrey.katkar22@vit.edu",
                "GroupID": "I10",
                "Role": "Students",
                "password": "12210893"
              },
              {
                "RollNum": 56,
                "div": "I",
                "PRN": 12210736,
                "Name": "KATORE ABHISHEK TANAJI",
                "username": "abhishek.katore22@vit.edu",
                "GroupID": "I10",
                "Role": "Students",
                "password": "12210736"
              },
              {
                "RollNum": 57,
                "div": "I",
                "PRN": 12210173,
                "Name": "Kature",
                "username": "soham.kature22@vit.edu",
                "GroupID": "I10",
                "Role": "Students",
                "password": "12210173"
              },
              {
                "RollNum": 58,
                "div": "I",
                "PRN": 12210084,
                "Name": "KAULWAR AJINKYA SUNIL",
                "username": "ajinkya.kaulwar22@vit.edu",
                "GroupID": "I10",
                "Role": "Students",
                "password": "12210084"
              },
              {
                "RollNum": 59,
                "div": "I",
                "PRN": 12210904,
                "Name": "KAUSADIKAR ANUSHKA ANIL",
                "username": "anushka.kausadikar22@vit.edu",
                "GroupID": "I11",
                "Role": "Students",
                "password": "12210904"
              },
              {
                "RollNum": 60,
                "div": "I",
                "PRN": 12211682,
                "Name": "Kaustubh Muley",
                "username": "kaustubh.muley22@vit.edu",
                "GroupID": "I11",
                "Role": "Students",
                "password": "12211682"
              },
              {
                "RollNum": 61,
                "div": "I",
                "PRN": 12210023,
                "Name": "KAUSTUBH SINGH",
                "username": "kaustubh.singh22@vit.edu",
                "GroupID": "I11",
                "Role": "Students",
                "password": "12210023"
              },
              {
                "RollNum": 62,
                "div": "I",
                "PRN": 12211349,
                "Name": "KAVYA AMRUTKAR",
                "username": "amrutkar.kavya22@vit.edu",
                "GroupID": "I11",
                "Role": "Students",
                "password": "12211349"
              },
              {
                "RollNum": 63,
                "div": "I",
                "PRN": 12210780,
                "Name": "KAWADE DEVENDRA SUHAS",
                "username": "devendra.kawade22@vit.edu",
                "GroupID": "I11",
                "Role": "Students",
                "password": "12210780"
              },
              {
                "RollNum": 64,
                "div": "I",
                "PRN": 12211702,
                "Name": "KAWANE AYUSH PRADIP",
                "username": "ayush.kawane221@vit.edu",
                "GroupID": "I11",
                "Role": "Students",
                "password": "12211702"
              },
              {
                "RollNum": 65,
                "div": "I",
                "PRN": 12210251,
                "Name": "KAWARE SAMRUDDHI SUNIL",
                "username": "samruddhi.kaware22@vit.edu",
                "GroupID": "I12",
                "Role": "Students",
                "password": "12210251"
              },
              {
                "RollNum": 66,
                "div": "I",
                "PRN": 12210602,
                "Name": "KAWTHEKAR OMKAR GAJANAN",
                "username": "omkar.kawthekar22@vit.edu",
                "GroupID": "I12",
                "Role": "Students",
                "password": "12210602"
              },
              {
                "RollNum": 67,
                "div": "I",
                "PRN": 12211055,
                "Name": "KAWTHEKAR ROHIT RAJESH",
                "username": "rohit.kawthekar22@vit.edu",
                "GroupID": "I12",
                "Role": "Students",
                "password": "12211055"
              },
              {
                "RollNum": 68,
                "div": "I",
                "PRN": 12210737,
                "Name": "KAZI AYMAAN YUSUF",
                "username": "aymaan.kazi22@vit.edu",
                "GroupID": "I12",
                "Role": "Students",
                "password": "12210737"
              },
              {
                "RollNum": 69,
                "div": "I",
                "PRN": 12211122,
                "Name": "KAZI SHADAAB NADEEM",
                "username": "shadaab.kazi22@vit.edu",
                "GroupID": "I12",
                "Role": "Students",
                "password": "12211122"
              },
              {
                "RollNum": 1,
                "div": "J",
                "PRN": 12211354,
                "Name": "KECHE VEDANT ANIL",
                "username": "vedant.keche22@vit.edu",
                "GroupID": "J01",
                "Role": "Students",
                "password": "12211354"
              },
              {
                "RollNum": 2,
                "div": "J",
                "PRN": 12210691,
                "Name": "KEDARI PARTH PRASHANT",
                "username": "parth.kedari22@vit.edu",
                "GroupID": "J01",
                "Role": "Students",
                "password": "12210691"
              },
              {
                "RollNum": 3,
                "div": "J",
                "PRN": 12211794,
                "Name": "KEKAN SWARUP RAJENDRA",
                "username": "swarup.kekan22@vit.edu",
                "GroupID": "J01",
                "Role": "Students",
                "password": "12211794"
              },
              {
                "RollNum": 4,
                "div": "J",
                "PRN": 12211810,
                "Name": "KENJALE SHRISHTI AVINASH",
                "username": "shrishti.kenjale22@vit.edu",
                "GroupID": "J01",
                "Role": "Students",
                "password": "12211810"
              },
              {
                "RollNum": 5,
                "div": "J",
                "PRN": 12211141,
                "Name": "KESKAR AARYA ROHIT",
                "username": "aarya.keskar22@vit.edu",
                "GroupID": "J01",
                "Role": "Students",
                "password": "12211141"
              },
              {
                "RollNum": 6,
                "div": "J",
                "PRN": 12210594,
                "Name": "KHADE ANJALI GAJANAN",
                "username": "anjali.khade22@vit.edu",
                "GroupID": "J01",
                "Role": "Students",
                "password": "12210594"
              },
              {
                "RollNum": 7,
                "div": "J",
                "PRN": 12210839,
                "Name": "KHAIRE ATHARVA ASHOK",
                "username": "atharva.khaire22@vit.edu",
                "GroupID": "J02",
                "Role": "Students",
                "password": "12210839"
              },
              {
                "RollNum": 8,
                "div": "J",
                "PRN": 12210852,
                "Name": "KHAMBADKAR PRASAD KESHAORAO",
                "username": "prasad.khambadkar22@vit.edu",
                "GroupID": "J02",
                "Role": "Students",
                "password": "12210852"
              },
              {
                "RollNum": 9,
                "div": "J",
                "PRN": 12210365,
                "Name": "KHAMBAYATE AYUSH KIRAN",
                "username": "ayush.khambayate22@vit.edu",
                "GroupID": "J02",
                "Role": "Students",
                "password": "12210365"
              },
              {
                "RollNum": 10,
                "div": "J",
                "PRN": 12210220,
                "Name": "KHAMKAR SHREYAS DATTATRAY",
                "username": "shreyas.khamkar22@vit.edu",
                "GroupID": "J02",
                "Role": "Students",
                "password": "12210220"
              },
              {
                "RollNum": 11,
                "div": "J",
                "PRN": 12211797,
                "Name": "KHANCHANDANI DEEP MUKESH",
                "username": "deep.khanchandani22@vit.edu",
                "GroupID": "J02",
                "Role": "Students",
                "password": "12211797"
              },
              {
                "RollNum": 12,
                "div": "J",
                "PRN": 12210711,
                "Name": "KHANDARE OM DINESH",
                "username": "om.khandare22@vit.edu",
                "GroupID": "J02",
                "Role": "Students",
                "password": "12210711"
              },
              {
                "RollNum": 13,
                "div": "J",
                "PRN": 12210287,
                "Name": "KHANDARE ROHAN BHANUDAS",
                "username": "rohan.khandare22@vit.edu",
                "GroupID": "J03",
                "Role": "Students",
                "password": "12210287"
              },
              {
                "RollNum": 14,
                "div": "J",
                "PRN": 12210522,
                "Name": "KHANDAVE PRATHAMESH JAGANNATH",
                "username": "prathamesh.khandave22@vit.edu",
                "GroupID": "J03",
                "Role": "Students",
                "password": "12210522"
              },
              {
                "RollNum": 15,
                "div": "J",
                "PRN": 12210390,
                "Name": "KHANDELWAL ANUSHKA DEEPAK",
                "username": "anushka.khandelwal22@vit.edu",
                "GroupID": "J03",
                "Role": "Students",
                "password": "12210390"
              },
              {
                "RollNum": 16,
                "div": "J",
                "PRN": 12210427,
                "Name": "KHANDELWAL SALONI ANIL",
                "username": "saloni.khandelwal22@vit.edu",
                "GroupID": "J03",
                "Role": "Students",
                "password": "12210427"
              },
              {
                "RollNum": 17,
                "div": "J",
                "PRN": 12210825,
                "Name": "KHANGAR DHAWAL NILESH",
                "username": "dhawal.khangar22@vit.edu",
                "GroupID": "J03",
                "Role": "Students",
                "password": "12210825"
              },
              {
                "RollNum": 18,
                "div": "J",
                "PRN": 12211069,
                "Name": "KHANKE RAJ VIJAY",
                "username": "raj.khanke22@vit.edu",
                "GroupID": "J03",
                "Role": "Students",
                "password": "12211069"
              },
              {
                "RollNum": 19,
                "div": "J",
                "PRN": 12210313,
                "Name": "KHANVILKAR OMKAR SUNIL",
                "username": "omkar.khanvilkar22@vit.edu",
                "GroupID": "J04",
                "Role": "Students",
                "password": "12210313"
              },
              {
                "RollNum": 20,
                "div": "J",
                "PRN": 12210426,
                "Name": "KHARARE CHETNA JOGENDRA",
                "username": "chetna.kharare22@vit.edu",
                "GroupID": "J04",
                "Role": "Students",
                "password": "12210426"
              },
              {
                "RollNum": 21,
                "div": "J",
                "PRN": 12211184,
                "Name": "KHARAT ADITYA ANAND",
                "username": "aditya.kharat22@vit.edu",
                "GroupID": "J04",
                "Role": "Students",
                "password": "12211184"
              },
              {
                "RollNum": 22,
                "div": "J",
                "PRN": 12210610,
                "Name": "KHARAT JANVI VILAS",
                "username": "janvi.kharat22@vit.edu",
                "GroupID": "J04",
                "Role": "Students",
                "password": "12210610"
              },
              {
                "RollNum": 23,
                "div": "J",
                "PRN": 12210272,
                "Name": "KHARAT KUNAL SACHIN",
                "username": "kunal.kharat22@vit.edu",
                "GroupID": "J04",
                "Role": "Students",
                "password": "12210272"
              },
              {
                "RollNum": 24,
                "div": "J",
                "PRN": 12210431,
                "Name": "KHARCHE ADITI PRAVIN",
                "username": "aditi.kharche22@vit.edu",
                "GroupID": "J05",
                "Role": "Students",
                "password": "12210431"
              },
              {
                "RollNum": 25,
                "div": "J",
                "PRN": 12210741,
                "Name": "Adarsh Khare",
                "username": "adarsh.khare22@vit.edu",
                "GroupID": "J05",
                "Role": "Students",
                "password": "12210741"
              },
              {
                "RollNum": 26,
                "div": "J",
                "PRN": 12210171,
                "Name": "KHARMALE ADWAIT VILAS",
                "username": "adwait.kharmale22@vit.edu",
                "GroupID": "J05",
                "Role": "Students",
                "password": "12210171"
              },
              {
                "RollNum": 27,
                "div": "J",
                "PRN": 12210566,
                "Name": "KHARWADKAR MEGHAJ JAYANT",
                "username": "meghaj.kharwadkar22@vit.edu",
                "GroupID": "J05",
                "Role": "Students",
                "password": "12210566"
              },
              {
                "RollNum": 28,
                "div": "J",
                "PRN": 12211736,
                "Name": "KHEDKAR PRATHAMESH PRAKASH",
                "username": "prathamesh.khedkar22@vit.edu",
                "GroupID": "J05",
                "Role": "Students",
                "password": "12211736"
              },
              {
                "RollNum": 29,
                "div": "J",
                "PRN": 12211191,
                "Name": "KHEDWALA BURHANUDDIN YUSUF",
                "username": "burhanuddin.khedwala22@vit.edu",
                "GroupID": "J05",
                "Role": "Students",
                "password": "12211191"
              },
              {
                "RollNum": 30,
                "div": "J",
                "PRN": 12211743,
                "Name": "KHINDE PRATIK NAGNATH",
                "username": "pratik.khinde221@vit.edu",
                "GroupID": "J06",
                "Role": "Students",
                "password": "12211743"
              },
              {
                "RollNum": 31,
                "div": "J",
                "PRN": 12210595,
                "Name": "KHOBRAGADE SACHI DILIP",
                "username": "sachi.khobragade22@vit.edu",
                "GroupID": "J06",
                "Role": "Students",
                "password": "12210595"
              },
              {
                "RollNum": 32,
                "div": "J",
                "PRN": 12211129,
                "Name": "KHOBRAGADE URVASHI KAMLAKAR",
                "username": "urvashi.khobragade22@vit.edu",
                "GroupID": "J06",
                "Role": "Students",
                "password": "12211129"
              },
              {
                "RollNum": 33,
                "div": "J",
                "PRN": 12210165,
                "Name": "KHOCHARE GAURAV GANGADHAR",
                "username": "gaurav.khochare22@vit.edu",
                "GroupID": "J06",
                "Role": "Students",
                "password": "12210165"
              },
              {
                "RollNum": 34,
                "div": "J",
                "PRN": 12211773,
                "Name": "KHOPADE SAMPADA RAJENDRA",
                "username": "sampada.khopade22@vit.edu",
                "GroupID": "J06",
                "Role": "Students",
                "password": "12211773"
              },
              {
                "RollNum": 35,
                "div": "J",
                "PRN": 12211711,
                "Name": "SHANTANU SUHAS KHOPADE",
                "username": "shantanu.khopade22@vit.edu",
                "GroupID": "J06",
                "Role": "Students",
                "password": "12211711"
              },
              {
                "RollNum": 36,
                "div": "J",
                "PRN": 12210935,
                "Name": "KHOPE KARTIK SURYAKANT",
                "username": "kartik.khope22@vit.edu",
                "GroupID": "J07",
                "Role": "Students",
                "password": "12210935"
              },
              {
                "RollNum": 37,
                "div": "J",
                "PRN": 12211384,
                "Name": "KHOT ANANT TANAJI",
                "username": "anant.khot22@vit.edu",
                "GroupID": "J07",
                "Role": "Students",
                "password": "12211384"
              },
              {
                "RollNum": 38,
                "div": "J",
                "PRN": 12210237,
                "Name": "KHOT PARTH CHANDRAKANT",
                "username": "parth.khot22@vit.edu",
                "GroupID": "J07",
                "Role": "Students",
                "password": "12210237"
              },
              {
                "RollNum": 39,
                "div": "J",
                "PRN": 12210015,
                "Name": "KIMAYA PRATEEK JOSHI",
                "username": "kimaya.joshi22@vit.edu",
                "GroupID": "J07",
                "Role": "Students",
                "password": "12210015"
              },
              {
                "RollNum": 40,
                "div": "J",
                "PRN": 12210878,
                "Name": "KISHOR VITHOBA GATAVE",
                "username": "vithoba.kishor22@vit.edu",
                "GroupID": "J07",
                "Role": "Students",
                "password": "12210878"
              },
              {
                "RollNum": 41,
                "div": "J",
                "PRN": 12211057,
                "Name": "KOCHARI RUDRA VINAY",
                "username": "rudra.kochari22@vit.edu",
                "GroupID": "J07",
                "Role": "Students",
                "password": "12211057"
              },
              {
                "RollNum": 42,
                "div": "J",
                "PRN": 12210434,
                "Name": "KOHAD NAKUL DHNARAJ",
                "username": "nakul.kohad22@vit.edu",
                "GroupID": "J08",
                "Role": "Students",
                "password": "12210434"
              },
              {
                "RollNum": 43,
                "div": "J",
                "PRN": 12210597,
                "Name": "KOHALE ADITI RAJESH",
                "username": "aditi.kohale22@vit.edu",
                "GroupID": "J08",
                "Role": "Students",
                "password": "12210597"
              },
              {
                "RollNum": 44,
                "div": "J",
                "PRN": 12210304,
                "Name": "KOKANE SUMEDH VILAS",
                "username": "sumedh.kokane22@vit.edu",
                "GroupID": "J08",
                "Role": "Students",
                "password": "12210304"
              },
              {
                "RollNum": 45,
                "div": "J",
                "PRN": 12210094,
                "Name": "KOKANI SIDDHANT SHANTARAM",
                "username": "siddhant.kokani22@vit.edu",
                "GroupID": "J08",
                "Role": "Students",
                "password": "12210094"
              },
              {
                "RollNum": 46,
                "div": "J",
                "PRN": 12210513,
                "Name": "KOKATE GAURI HARISHCHANDRA",
                "username": "gauri.kokate22@vit.edu",
                "GroupID": "J08",
                "Role": "Students",
                "password": "12210513"
              },
              {
                "RollNum": 47,
                "div": "J",
                "PRN": 12211139,
                "Name": "KOKATE SHRAVAN SHRIKRUSHNA",
                "username": "shravan.kokate22@vit.edu",
                "GroupID": "J09",
                "Role": "Students",
                "password": "12211139"
              },
              {
                "RollNum": 48,
                "div": "J",
                "PRN": 12210505,
                "Name": "KOLATE GITA RAJESH",
                "username": "gita.kolate22@vit.edu",
                "GroupID": "J09",
                "Role": "Students",
                "password": "12210505"
              },
              {
                "RollNum": 49,
                "div": "J",
                "PRN": 12211299,
                "Name": "KOLAWALE SANIKA RAJABHAU",
                "username": "sanika.kolawale221@vit.edu",
                "GroupID": "J09",
                "Role": "Students",
                "password": "12211299"
              },
              {
                "RollNum": 50,
                "div": "J",
                "PRN": 12210697,
                "Name": "KOLHE BABUSHA SANTOSH",
                "username": "babusha.kolhe22@vit.edu",
                "GroupID": "J09",
                "Role": "Students",
                "password": "12210697"
              },
              {
                "RollNum": 51,
                "div": "J",
                "PRN": 12210578,
                "Name": "KOLHE KANAD MAHESH",
                "username": "kanad.kolhe22@vit.edu",
                "GroupID": "J09",
                "Role": "Students",
                "password": "12210578"
              },
              {
                "RollNum": 52,
                "div": "J",
                "PRN": 12210463,
                "Name": "KOMAL BARI",
                "username": "bari.komal22@vit.edu",
                "GroupID": "J09",
                "Role": "Students",
                "password": "12210463"
              },
              {
                "RollNum": 53,
                "div": "J",
                "PRN": 12210036,
                "Name": "KONDE ARYAN VIREN",
                "username": "aryan.konde22@vit.edu",
                "GroupID": "J10",
                "Role": "Students",
                "password": "12210036"
              },
              {
                "RollNum": 54,
                "div": "J",
                "PRN": 12211510,
                "Name": "KONDEWAR ADITYA PRASHANT",
                "username": "aditya.kondewar22@vit.edu",
                "GroupID": "J10",
                "Role": "Students",
                "password": "12211510"
              },
              {
                "RollNum": 55,
                "div": "J",
                "PRN": 12210397,
                "Name": "KONDEWAR PARNAVI DATTATRAYA",
                "username": "parnavi.kondewar22@vit.edu",
                "GroupID": "J10",
                "Role": "Students",
                "password": "12210397"
              },
              {
                "RollNum": 56,
                "div": "J",
                "PRN": 12210644,
                "Name": "KORADE SRUSHTI ARUN",
                "username": "srushti.korade22@vit.edu",
                "GroupID": "J10",
                "Role": "Students",
                "password": "12210644"
              },
              {
                "RollNum": 57,
                "div": "J",
                "PRN": 12210438,
                "Name": "KOTA APURVA VYANKATESH",
                "username": "apurva.kota22@vit.edu",
                "GroupID": "J10",
                "Role": "Students",
                "password": "12210438"
              },
              {
                "RollNum": 58,
                "div": "J",
                "PRN": 12210299,
                "Name": "KOTHAWADE ANIKET ANIL",
                "username": "aniket.kothawade22@vit.edu",
                "GroupID": "J10",
                "Role": "Students",
                "password": "12210299"
              },
              {
                "RollNum": 59,
                "div": "J",
                "PRN": 12210859,
                "Name": "KOVE LAXMI PRAKASH",
                "username": "laxmi.kove22@vit.edu",
                "GroupID": "J11",
                "Role": "Students",
                "password": "12210859"
              },
              {
                "RollNum": 60,
                "div": "J",
                "PRN": 12210200,
                "Name": "KRITIKA RAINA",
                "username": "raina.kritika22@vit.edu",
                "GroupID": "J11",
                "Role": "Students",
                "password": "12210200"
              },
              {
                "RollNum": 61,
                "div": "J",
                "PRN": 12211240,
                "Name": "KRRISH PIYUSH KUMBHARE",
                "username": "piyush.krrish22@vit.edu",
                "GroupID": "J11",
                "Role": "Students",
                "password": "12211240"
              },
              {
                "RollNum": 62,
                "div": "J",
                "PRN": 12211745,
                "Name": "KSHIRSAGAR AAYUSHA AMOL",
                "username": "aayusha.kshirsagar22@vit.edu",
                "GroupID": "J11",
                "Role": "Students",
                "password": "12211745"
              },
              {
                "RollNum": 63,
                "div": "J",
                "PRN": 12211236,
                "Name": "KSHIRSAGAR ASHUTOSH SANTOSH",
                "username": "ashutosh.kshirsagar22@vit.edu",
                "GroupID": "J11",
                "Role": "Students",
                "password": "12211236"
              },
              {
                "RollNum": 64,
                "div": "J",
                "PRN": 12211734,
                "Name": "KSHIRSAGAR SAEE GANESH",
                "username": "saee.kshirsagar22@vit.edu",
                "GroupID": "J11",
                "Role": "Students",
                "password": "12211734"
              },
              {
                "RollNum": 65,
                "div": "J",
                "PRN": 12210430,
                "Name": "KSHIRSAGAR SHALVI SHREESH",
                "username": "shalvi.kshirsagar22@vit.edu",
                "GroupID": "J12",
                "Role": "Students",
                "password": "12210430"
              },
              {
                "RollNum": 66,
                "div": "J",
                "PRN": 12211387,
                "Name": "KSHIRSAGAR URVI PRASHANT",
                "username": "urvi.kshirsagar22@vit.edu",
                "GroupID": "J12",
                "Role": "Students",
                "password": "12211387"
              },
              {
                "RollNum": 67,
                "div": "J",
                "PRN": 12210236,
                "Name": "KSHITIJ ANANDRAO GEDAM",
                "username": "anandrao.kshitij22@vit.edu",
                "GroupID": "J12",
                "Role": "Students",
                "password": "12210236"
              },
              {
                "RollNum": 68,
                "div": "J",
                "PRN": 12210536,
                "Name": "KUBADE RAVINA GURUDAS",
                "username": "ravina.kubade22@vit.edu",
                "GroupID": "J12",
                "Role": "Students",
                "password": "12210536"
              },
              {
                "RollNum": 69,
                "div": "J",
                "PRN": 12211365,
                "Name": "KUDE AYUSH AVINASH",
                "username": "ayush.kude22@vit.edu",
                "GroupID": "J12",
                "Role": "Students",
                "password": "12211365"
              },
              {
                "RollNum": 1,
                "div": "K",
                "PRN": 12210849,
                "Name": "KUKADE SAHIL ANIL",
                "username": "sahil.kukade22@vit.edu",
                "GroupID": "K01",
                "Role": "Students",
                "password": "12210849"
              },
              {
                "RollNum": 2,
                "div": "K",
                "PRN": 12210158,
                "Name": "KULKARNI ADITYA DEEPAK",
                "username": "aditya.kulkarni22@vit.edu",
                "GroupID": "K01",
                "Role": "Students",
                "password": "12210158"
              },
              {
                "RollNum": 3,
                "div": "K",
                "PRN": 12210655,
                "Name": "KULKARNI ARPITA ANIRUDH",
                "username": "arpita.kulkarni22@vit.edu",
                "GroupID": "K01",
                "Role": "Students",
                "password": "12210655"
              },
              {
                "RollNum": 4,
                "div": "K",
                "PRN": 12211767,
                "Name": "KULKARNI ATHARVA ABHIJIT",
                "username": "atharva.kulkarni223@vit.edu",
                "GroupID": "K01",
                "Role": "Students",
                "password": "12211767"
              },
              {
                "RollNum": 5,
                "div": "K",
                "PRN": 12211456,
                "Name": "KULKARNI MEDHAJ ULHAS",
                "username": "medhaj.kulkarni222@vit.edu",
                "GroupID": "K01",
                "Role": "Students",
                "password": "12211456"
              },
              {
                "RollNum": 6,
                "div": "K",
                "PRN": 12210007,
                "Name": "KULKARNI OJAS VINOD",
                "username": "ojas.kulkarni22@vit.edu",
                "GroupID": "K01",
                "Role": "Students",
                "password": "12210007"
              },
              {
                "RollNum": 7,
                "div": "K",
                "PRN": 12211328,
                "Name": "KULKARNI PARTH SANJAY",
                "username": "parth.kulkarni22@vit.edu",
                "GroupID": "K02",
                "Role": "Students",
                "password": "12211328"
              },
              {
                "RollNum": 8,
                "div": "K",
                "PRN": 12210460,
                "Name": "KULKARNI PUSHKAR SANDIP",
                "username": "pushkar.kulkarni22@vit.edu",
                "GroupID": "K02",
                "Role": "Students",
                "password": "12210460"
              },
              {
                "RollNum": 9,
                "div": "K",
                "PRN": 12211561,
                "Name": "KULKARNI RHUTU AMIT",
                "username": "rhutu.kulkarni22@vit.edu",
                "GroupID": "K02",
                "Role": "Students",
                "password": "12211561"
              },
              {
                "RollNum": 10,
                "div": "K",
                "PRN": 12211791,
                "Name": "KULKARNI ROHAN RAJESH",
                "username": "rohan.kulkarni22@vit.edu",
                "GroupID": "K02",
                "Role": "Students",
                "password": "12211791"
              },
              {
                "RollNum": 11,
                "div": "K",
                "PRN": 12210052,
                "Name": "KULKARNI SHREYA RAMESH",
                "username": "shreya.kulkarni22@vit.edu",
                "GroupID": "K02",
                "Role": "Students",
                "password": "12210052"
              },
              {
                "RollNum": 12,
                "div": "K",
                "PRN": 12210048,
                "Name": "KULKARNI TANAYA PRASAD",
                "username": "tanaya.kulkarni22@vit.edu",
                "GroupID": "K02",
                "Role": "Students",
                "password": "12210048"
              },
              {
                "RollNum": 13,
                "div": "K",
                "PRN": 12211457,
                "Name": "KULKARNI TEJAS CHANDRASHEKHAR",
                "username": "tejas.kulkarni221@vit.edu",
                "GroupID": "K03",
                "Role": "Students",
                "password": "12211457"
              },
              {
                "RollNum": 14,
                "div": "K",
                "PRN": 12211774,
                "Name": "KULKARNI VARAD NITIN",
                "username": "varad.kulkarni221@vit.edu",
                "GroupID": "K03",
                "Role": "Students",
                "password": "12211774"
              },
              {
                "RollNum": 15,
                "div": "K",
                "PRN": 12211453,
                "Name": "KULKARNI YASH PRASAD",
                "username": "yash.kulkarni221@vit.edu",
                "GroupID": "K03",
                "Role": "Students",
                "password": "12211453"
              },
              {
                "RollNum": 16,
                "div": "K",
                "PRN": 12210851,
                "Name": "Harshal kullarkar kullarkar",
                "username": "harshal.kullarkar22@vit.edu",
                "GroupID": "K03",
                "Role": "Students",
                "password": "12210851"
              },
              {
                "RollNum": 17,
                "div": "K",
                "PRN": 12210325,
                "Name": "KUMARE RAHUL PRAKASH",
                "username": "rahul.kumare22@vit.edu",
                "GroupID": "K03",
                "Role": "Students",
                "password": "12210325"
              },
              {
                "RollNum": 18,
                "div": "K",
                "PRN": 12210361,
                "Name": "KUMAWAT JAY DEELIP",
                "username": "jay.kumawat22@vit.edu",
                "GroupID": "K03",
                "Role": "Students",
                "password": "12210361"
              },
              {
                "RollNum": 19,
                "div": "K",
                "PRN": 12211028,
                "Name": "KUMBHAR AKSHAY REVANSIDDHA",
                "username": "akshay.kumbhar22@vit.edu",
                "GroupID": "K04",
                "Role": "Students",
                "password": "12211028"
              },
              {
                "RollNum": 20,
                "div": "K",
                "PRN": 12210111,
                "Name": "KUMBHAR OMKAR DHANAJI",
                "username": "omkar.kumbhar22@vit.edu",
                "GroupID": "K04",
                "Role": "Students",
                "password": "12210111"
              },
              {
                "RollNum": 21,
                "div": "K",
                "PRN": 12210274,
                "Name": "KUMBHAR SAHIL SANTOSH",
                "username": "sahil.kumbhar22@vit.edu",
                "GroupID": "K04",
                "Role": "Students",
                "password": "12210274"
              },
              {
                "RollNum": 22,
                "div": "K",
                "PRN": 12210373,
                "Name": "KUMBHAR SHASHANK SAKHARAM",
                "username": "shashank.kumbhar22@vit.edu",
                "GroupID": "K04",
                "Role": "Students",
                "password": "12210373"
              },
              {
                "RollNum": 23,
                "div": "K",
                "PRN": 12211729,
                "Name": "KUMBHAR SHRIDHAR CHANDRAKANT",
                "username": "shridhar.kumbhar22@vit.edu",
                "GroupID": "K04",
                "Role": "Students",
                "password": "12211729"
              },
              {
                "RollNum": 24,
                "div": "K",
                "PRN": 12210351,
                "Name": "KUMBHAR SUNANDAN SUBHASH",
                "username": "sunandan.kumbhar22@vit.edu",
                "GroupID": "K05",
                "Role": "Students",
                "password": "12210351"
              },
              {
                "RollNum": 25,
                "div": "K",
                "PRN": 12210130,
                "Name": "KUMBHARE PRAJAKTA KALIDAS",
                "username": "prajakta.kumbhare22@vit.edu",
                "GroupID": "K05",
                "Role": "Students",
                "password": "12210130"
              },
              {
                "RollNum": 26,
                "div": "K",
                "PRN": 12211404,
                "Name": "KUMBHARE VIBHOR ANIL",
                "username": "vibhor.kumbhare22@vit.edu",
                "GroupID": "K05",
                "Role": "Students",
                "password": "12211404"
              },
              {
                "RollNum": 27,
                "div": "K",
                "PRN": 12210508,
                "Name": "KUMKAR DHANRAJ EKNATH",
                "username": "dhanraj.kumkar22@vit.edu",
                "GroupID": "K05",
                "Role": "Students",
                "password": "12210508"
              },
              {
                "RollNum": 28,
                "div": "K",
                "PRN": 12210844,
                "Name": "KUMRE KSHITIJ KISHOR",
                "username": "kshitij.kumre22@vit.edu",
                "GroupID": "K05",
                "Role": "Students",
                "password": "12210844"
              },
              {
                "RollNum": 29,
                "div": "K",
                "PRN": 12211496,
                "Name": "KUNAL KISHOR JADHAV",
                "username": "kunal.jadhav22@vit.edu",
                "GroupID": "K05",
                "Role": "Students",
                "password": "12211496"
              },
              {
                "RollNum": 30,
                "div": "K",
                "PRN": 12210413,
                "Name": "KURANDALE GOKUL SAMPAT",
                "username": "gokul.kurandale22@vit.edu",
                "GroupID": "K06",
                "Role": "Students",
                "password": "12210413"
              },
              {
                "RollNum": 31,
                "div": "K",
                "PRN": 12210067,
                "Name": "KURKUTE PALLAVI DULAJI",
                "username": "pallavi.kurkute22@vit.edu",
                "GroupID": "K06",
                "Role": "Students",
                "password": "12210067"
              },
              {
                "RollNum": 32,
                "div": "K",
                "PRN": 12211615,
                "Name": "LABHSETWAR AARYA AMOL",
                "username": "aarya.labhsetwar22@vit.edu",
                "GroupID": "K06",
                "Role": "Students",
                "password": "12211615"
              },
              {
                "RollNum": 33,
                "div": "K",
                "PRN": 12210062,
                "Name": "LAD ADITYA KIRAN",
                "username": "aditya.lad22@vit.edu",
                "GroupID": "K06",
                "Role": "Students",
                "password": "12210062"
              },
              {
                "RollNum": 34,
                "div": "K",
                "PRN": 12211322,
                "Name": "LADDHA ANUSHREE AKHILESH",
                "username": "anushree.laddha22@vit.edu",
                "GroupID": "K06",
                "Role": "Students",
                "password": "12211322"
              },
              {
                "RollNum": 35,
                "div": "K",
                "PRN": 12210544,
                "Name": "LAHAMAGE MAYUR JALINDAR",
                "username": "mayur.lahamage22@vit.edu",
                "GroupID": "K06",
                "Role": "Students",
                "password": "12210544"
              },
              {
                "RollNum": 36,
                "div": "K",
                "PRN": 12211138,
                "Name": "LAKHE PRATHAMESH SHANKAR",
                "username": "prathamesh.lakhe22@vit.edu",
                "GroupID": "K07",
                "Role": "Students",
                "password": "12211138"
              },
              {
                "RollNum": 37,
                "div": "K",
                "PRN": 12210203,
                "Name": "LAKSH SHARMA",
                "username": "sharma.laksh22@vit.edu",
                "GroupID": "K07",
                "Role": "Students",
                "password": "12210203"
              },
              {
                "RollNum": 38,
                "div": "K",
                "PRN": 12211532,
                "Name": "LALE YOGESH MOHAN",
                "username": "yogesh.lale22@vit.edu",
                "GroupID": "K07",
                "Role": "Students",
                "password": "12211532"
              },
              {
                "RollNum": 39,
                "div": "K",
                "PRN": 12210559,
                "Name": "LALROPUIA SAILO",
                "username": "lalropula.sailo22@vit.edu",
                "GroupID": "K07",
                "Role": "Students",
                "password": "12210559"
              },
              {
                "RollNum": 40,
                "div": "K",
                "PRN": 12210318,
                "Name": "LAMBAT AKHILESH VIJAYRAO",
                "username": "akhilesh.lambat22@vit.edu",
                "GroupID": "K07",
                "Role": "Students",
                "password": "12210318"
              },
              {
                "RollNum": 41,
                "div": "K",
                "PRN": 12210495,
                "Name": "LANDGE INDRAJIT PRAKASH",
                "username": "indrajit.landge22@vit.edu",
                "GroupID": "K07",
                "Role": "Students",
                "password": "12210495"
              },
              {
                "RollNum": 42,
                "div": "K",
                "PRN": 12211286,
                "Name": "LANJEWAR NISHANT UJJWAL",
                "username": "nishant.lanjewar221@vit.edu",
                "GroupID": "K08",
                "Role": "Students",
                "password": "12211286"
              },
              {
                "RollNum": 43,
                "div": "K",
                "PRN": 12210883,
                "Name": "LANJEWAR RIYA KISHOR",
                "username": "riya.lanjewar22@vit.edu",
                "GroupID": "K08",
                "Role": "Students",
                "password": "12210883"
              },
              {
                "RollNum": 44,
                "div": "K",
                "PRN": 12210682,
                "Name": "LASURKAR PRACHI KIRAN",
                "username": "prachi.lasurkar22@vit.edu",
                "GroupID": "K08",
                "Role": "Students",
                "password": "12210682"
              },
              {
                "RollNum": 45,
                "div": "K",
                "PRN": 12211060,
                "Name": "LEEVAN HERALD",
                "username": "herald.leevan22@vit.edu",
                "GroupID": "K08",
                "Role": "Students",
                "password": "12211060"
              },
              {
                "RollNum": 46,
                "div": "K",
                "PRN": 12210991,
                "Name": "LENEKAR MRUNAL SANTOSH",
                "username": "mrunal.lenekar22@vit.edu",
                "GroupID": "K08",
                "Role": "Students",
                "password": "12210991"
              },
              {
                "RollNum": 47,
                "div": "K",
                "PRN": 12210228,
                "Name": "LEON THOMAS",
                "username": "leon.thomas22@vit.edu",
                "GroupID": "K09",
                "Role": "Students",
                "password": "12210228"
              },
              {
                "RollNum": 48,
                "div": "K",
                "PRN": 12211809,
                "Name": "LIMBHORE DIPAK DADA",
                "username": "dipak.limbhore22@vit.edu",
                "GroupID": "K09",
                "Role": "Students",
                "password": "12211809"
              },
              {
                "RollNum": 49,
                "div": "K",
                "PRN": 12210011,
                "Name": "LIMDIYAWALA MUSTAFA MURTAZA",
                "username": "mustafa.limdiyawala22@vit.edu",
                "GroupID": "K09",
                "Role": "Students",
                "password": "12210011"
              },
              {
                "RollNum": 50,
                "div": "K",
                "PRN": 12211629,
                "Name": "LODHA AYUSH HARSHAD",
                "username": "ayush.lodha22@vit.edu",
                "GroupID": "K09",
                "Role": "Students",
                "password": "12211629"
              },
              {
                "RollNum": 51,
                "div": "K",
                "PRN": 12211630,
                "Name": "LODHA PIYUSH HARSHAD",
                "username": "piyush.lodha22@vit.edu",
                "GroupID": "K09",
                "Role": "Students",
                "password": "12211630"
              },
              {
                "RollNum": 52,
                "div": "K",
                "PRN": 12210346,
                "Name": "LOHAKARE SHEFALI SHARAD",
                "username": "shefali.lohakare22@vit.edu",
                "GroupID": "K09",
                "Role": "Students",
                "password": "12210346"
              },
              {
                "RollNum": 53,
                "div": "K",
                "PRN": 12210095,
                "Name": "LOHAR SAURABH JAYWANT",
                "username": "saurabh.lohar22@vit.edu",
                "GroupID": "K10",
                "Role": "Students",
                "password": "12210095"
              },
              {
                "RollNum": 54,
                "div": "K",
                "PRN": 12210353,
                "Name": "LOHOTE SAKSHI SOPAN",
                "username": "sakshi.lohote22@vit.edu",
                "GroupID": "K10",
                "Role": "Students",
                "password": "12210353"
              },
              {
                "RollNum": 55,
                "div": "K",
                "PRN": 12210046,
                "Name": "LOKESH VIVEKANAND CHAUDHARI",
                "username": "lokesh.chaudhari22@vit.edu",
                "GroupID": "K10",
                "Role": "Students",
                "password": "12210046"
              },
              {
                "RollNum": 56,
                "div": "K",
                "PRN": 12210811,
                "Name": "AABHA NARAYAN Lokhande",
                "username": "aabha.lokhande22@vit.edu",
                "GroupID": "K10",
                "Role": "Students",
                "password": "12210811"
              },
              {
                "RollNum": 57,
                "div": "K",
                "PRN": 12210614,
                "Name": "LOLAGE OMKAR SUNIL",
                "username": "omkar.lolage22@vit.edu",
                "GroupID": "K10",
                "Role": "Students",
                "password": "12210614"
              },
              {
                "RollNum": 58,
                "div": "K",
                "PRN": 12210386,
                "Name": "LONARE SHUBHAM SANJAY",
                "username": "shubham.lonare22@vit.edu",
                "GroupID": "K10",
                "Role": "Students",
                "password": "12210386"
              },
              {
                "RollNum": 59,
                "div": "K",
                "PRN": 12210180,
                "Name": "LONIKAR RUSHIKESH MANOHARRAO",
                "username": "rushikesh.lonikar22@vit.edu",
                "GroupID": "K11",
                "Role": "Students",
                "password": "12210180"
              },
              {
                "RollNum": 60,
                "div": "K",
                "PRN": 12210560,
                "Name": "M.S. DAWNGLIANA FANAI",
                "username": "m.s.dawngliana.fanai22@vit.edu",
                "GroupID": "K11",
                "Role": "Students",
                "password": "12210560"
              },
              {
                "RollNum": 61,
                "div": "K",
                "PRN": 12210154,
                "Name": "MADAKE ROSHAN MADHAV",
                "username": "roshan.madake22@vit.edu",
                "GroupID": "K11",
                "Role": "Students",
                "password": "12210154"
              },
              {
                "RollNum": 62,
                "div": "K",
                "PRN": 12210259,
                "Name": "MADALE ADITYA RAVISHANKAR",
                "username": "aditya.madale22@vit.edu",
                "GroupID": "K11",
                "Role": "Students",
                "password": "12210259"
              },
              {
                "RollNum": 63,
                "div": "K",
                "PRN": 12211213,
                "Name": "MADEWAR RAJESH ASHOK",
                "username": "rajesh.madewar22@vit.edu",
                "GroupID": "K11",
                "Role": "Students",
                "password": "12211213"
              },
              {
                "RollNum": 64,
                "div": "K",
                "PRN": 12210885,
                "Name": "MADHAWANI RAHUL AJAYKUMAR",
                "username": "rahul.madhawani22@vit.edu",
                "GroupID": "K11",
                "Role": "Students",
                "password": "12210885"
              },
              {
                "RollNum": 65,
                "div": "K",
                "PRN": 12210368,
                "Name": "MADNURKAR PARTH SHRIDHAR",
                "username": "parth.madnurkar22@vit.edu",
                "GroupID": "K12",
                "Role": "Students",
                "password": "12210368"
              },
              {
                "RollNum": 66,
                "div": "K",
                "PRN": 12211492,
                "Name": "MAGAR PRADNYA HEMANT",
                "username": "pradnya.magar22@vit.edu",
                "GroupID": "K12",
                "Role": "Students",
                "password": "12211492"
              },
              {
                "RollNum": 67,
                "div": "K",
                "PRN": 12210867,
                "Name": "MAGHADE SAURAV TUKARAM",
                "username": "saurav.maghade22@vit.edu",
                "GroupID": "K12",
                "Role": "Students",
                "password": "12210867"
              },
              {
                "RollNum": 68,
                "div": "K",
                "PRN": 12211366,
                "Name": "MAHADIK SHANTANU SANJAY",
                "username": "shantanu.mahadik22@vit.edu",
                "GroupID": "K12",
                "Role": "Students",
                "password": "12211366"
              },
              {
                "RollNum": 69,
                "div": "K",
                "PRN": 12210332,
                "Name": "MAHAJAN BHAGYESH NITIN",
                "username": "bhagyesh.mahajan22@vit.edu",
                "GroupID": "K12",
                "Role": "Students",
                "password": "12210332"
              },
              {
                "RollNum": 1,
                "div": "L",
                "PRN": 12211511,
                "Name": "Parth Mahajan",
                "username": "parth.mahajan221@vit.edu",
                "GroupID": "L01",
                "Role": "Students",
                "password": "12211511"
              },
              {
                "RollNum": 2,
                "div": "L",
                "PRN": 12211524,
                "Name": "MAHAJAN PUSHKAR PULIND",
                "username": "pushkar.mahajan222@vit.edu",
                "GroupID": "L01",
                "Role": "Students",
                "password": "12211524"
              },
              {
                "RollNum": 3,
                "div": "L",
                "PRN": 12210833,
                "Name": "MAHAJAN SHIVSHANKAR RAMLING",
                "username": "shivshankar.mahajan22@vit.edu",
                "GroupID": "L01",
                "Role": "Students",
                "password": "12210833"
              },
              {
                "RollNum": 4,
                "div": "L",
                "PRN": 12211786,
                "Name": "MAHAJAN SWARALI NIRAJ",
                "username": "swarali.mahajan221@vit.edu",
                "GroupID": "L01",
                "Role": "Students",
                "password": "12211786"
              },
              {
                "RollNum": 5,
                "div": "L",
                "PRN": 12211540,
                "Name": "MAHAJAN VISHAL KRISHNA",
                "username": "vishal.mahajan221@vit.edu",
                "GroupID": "L01",
                "Role": "Students",
                "password": "12211540"
              },
              {
                "RollNum": 6,
                "div": "L",
                "PRN": 12210470,
                "Name": "MAHALE HARSH SANTOSH",
                "username": "harsh.mahale22@vit.edu",
                "GroupID": "L01",
                "Role": "Students",
                "password": "12210470"
              },
              {
                "RollNum": 7,
                "div": "L",
                "PRN": 12210303,
                "Name": "MAHALE MANESH DILIP",
                "username": "manesh.mahale22@vit.edu",
                "GroupID": "L02",
                "Role": "Students",
                "password": "12210303"
              },
              {
                "RollNum": 8,
                "div": "L",
                "PRN": 12210499,
                "Name": "MAHAPURE MANDAR ANIL",
                "username": "mandar.mahapure22@vit.edu",
                "GroupID": "L02",
                "Role": "Students",
                "password": "12210499"
              },
              {
                "RollNum": 9,
                "div": "L",
                "PRN": 12210459,
                "Name": "MAHATEKAR ATHARV SURYAKANT",
                "username": "atharv.mahatekar22@vit.edu",
                "GroupID": "L02",
                "Role": "Students",
                "password": "12210459"
              },
              {
                "RollNum": 10,
                "div": "L",
                "PRN": 12210057,
                "Name": "MAHESHWARI SAKSHI AJAY",
                "username": "sakshi.maheshwari22@vit.edu",
                "GroupID": "L02",
                "Role": "Students",
                "password": "12210057"
              },
              {
                "RollNum": 11,
                "div": "L",
                "PRN": 12210115,
                "Name": "MAHINDRAKAR VAISHNAVI SUSHIL",
                "username": "vaishnavi.mahindrakar22@vit.edu",
                "GroupID": "L02",
                "Role": "Students",
                "password": "12210115"
              },
              {
                "RollNum": 12,
                "div": "L",
                "PRN": 12211672,
                "Name": "MAHORE AADITYA RAJENDRA",
                "username": "aaditya.mahore222@vit.edu",
                "GroupID": "L02",
                "Role": "Students",
                "password": "12211672"
              },
              {
                "RollNum": 13,
                "div": "L",
                "PRN": 12210262,
                "Name": "MAHULKAR AMEY SHRIKANT",
                "username": "amey.mahulkar22@vit.edu",
                "GroupID": "L03",
                "Role": "Students",
                "password": "12210262"
              },
              {
                "RollNum": 14,
                "div": "L",
                "PRN": 12211708,
                "Name": "MAIND SANIKA SANJAY",
                "username": "sanika.maind222@vit.edu",
                "GroupID": "L03",
                "Role": "Students",
                "password": "12211708"
              },
              {
                "RollNum": 15,
                "div": "L",
                "PRN": 12210423,
                "Name": "MAINDARGI MOHAMMED NUJAIM QADEER AHMED",
                "username": "mohammed.maindargi22@vit.edu",
                "GroupID": "L03",
                "Role": "Students",
                "password": "12210423"
              },
              {
                "RollNum": 16,
                "div": "L",
                "PRN": 12211052,
                "Name": "MAKADI SAHIL SANJU",
                "username": "sahil.makadi22@vit.edu",
                "GroupID": "L03",
                "Role": "Students",
                "password": "12211052"
              },
              {
                "RollNum": 17,
                "div": "L",
                "PRN": 12211344,
                "Name": "MALAVE NIKHIL RAMDAS",
                "username": "nikhil.malave22@vit.edu",
                "GroupID": "L03",
                "Role": "Students",
                "password": "12211344"
              },
              {
                "RollNum": 18,
                "div": "L",
                "PRN": 12211715,
                "Name": "MALI ADITI ADHIKRAO",
                "username": "aditi.mali22@vit.edu",
                "GroupID": "L03",
                "Role": "Students",
                "password": "12211715"
              },
              {
                "RollNum": 19,
                "div": "L",
                "PRN": 12210510,
                "Name": "MALI HARSHAL MAHALING",
                "username": "harshal.mali22@vit.edu",
                "GroupID": "L04",
                "Role": "Students",
                "password": "12210510"
              },
              {
                "RollNum": 20,
                "div": "L",
                "PRN": 12210316,
                "Name": "MALI PRIT PRASAD",
                "username": "prit.mali22@vit.edu",
                "GroupID": "L04",
                "Role": "Students",
                "password": "12210316"
              },
              {
                "RollNum": 21,
                "div": "L",
                "PRN": 12211330,
                "Name": "Tanmay Sanjay Mali",
                "username": "tanmay.mali22@vit.edu",
                "GroupID": "L04",
                "Role": "Students",
                "password": "12211330"
              },
              {
                "RollNum": 22,
                "div": "L",
                "PRN": 12210213,
                "Name": "MALODE SWAMI RAMESHKUMAR",
                "username": "swami.malode22@vit.edu",
                "GroupID": "L04",
                "Role": "Students",
                "password": "12210213"
              },
              {
                "RollNum": 23,
                "div": "L",
                "PRN": 12211433,
                "Name": "MALSE NOOPUR VINIT",
                "username": "noopur.malse221@vit.edu",
                "GroupID": "L04",
                "Role": "Students",
                "password": "12211433"
              },
              {
                "RollNum": 24,
                "div": "L",
                "PRN": 12211744,
                "Name": "MANAS KADAM",
                "username": "kadam.manas221@vit.edu",
                "GroupID": "L05",
                "Role": "Students",
                "password": "12211744"
              },
              {
                "RollNum": 25,
                "div": "L",
                "PRN": 12210570,
                "Name": "MANDALKAR PRATIK BHAGINATH",
                "username": "pratik.mandalkar22@vit.edu",
                "GroupID": "L05",
                "Role": "Students",
                "password": "12210570"
              },
              {
                "RollNum": 26,
                "div": "L",
                "PRN": 12210543,
                "Name": "MANDAR DHANRAJ BHALERAO",
                "username": "mandar.bhalerao22@vit.edu",
                "GroupID": "L05",
                "Role": "Students",
                "password": "12210543"
              },
              {
                "RollNum": 27,
                "div": "L",
                "PRN": 12211067,
                "Name": "MANDARE SAHIL HEMRAJ",
                "username": "sahil.mandare22@vit.edu",
                "GroupID": "L05",
                "Role": "Students",
                "password": "12211067"
              },
              {
                "RollNum": 28,
                "div": "L",
                "PRN": 12211707,
                "Name": "MANDKE ADITYA SUSHEEL",
                "username": "aditya.mandke22@vit.edu",
                "GroupID": "L05",
                "Role": "Students",
                "password": "12211707"
              },
              {
                "RollNum": 29,
                "div": "L",
                "PRN": 12210611,
                "Name": "MANDPE ATHARV SHAILENDRA",
                "username": "atharv.mandpe22@vit.edu",
                "GroupID": "L05",
                "Role": "Students",
                "password": "12210611"
              },
              {
                "RollNum": 30,
                "div": "L",
                "PRN": 12211722,
                "Name": "MANE AKHILESH RAMESH",
                "username": "akhilesh.mane22@vit.edu",
                "GroupID": "L06",
                "Role": "Students",
                "password": "12211722"
              },
              {
                "RollNum": 31,
                "div": "L",
                "PRN": 12210569,
                "Name": "MANE PRATIK PITAMBAR",
                "username": "pratik.mane22@vit.edu",
                "GroupID": "L06",
                "Role": "Students",
                "password": "12210569"
              },
              {
                "RollNum": 32,
                "div": "L",
                "PRN": 12211103,
                "Name": "MANE RUSHIKESH BALAJI",
                "username": "rushikesh.mane22@vit.edu",
                "GroupID": "L06",
                "Role": "Students",
                "password": "12211103"
              },
              {
                "RollNum": 33,
                "div": "L",
                "PRN": 12211147,
                "Name": "MANE RUTUJA SANTOSH",
                "username": "rutuja.mane22@vit.edu",
                "GroupID": "L06",
                "Role": "Students",
                "password": "12211147"
              },
              {
                "RollNum": 34,
                "div": "L",
                "PRN": 12211158,
                "Name": "MANE TUSHAR RAMESH",
                "username": "tushar.mane22@vit.edu",
                "GroupID": "L06",
                "Role": "Students",
                "password": "12211158"
              },
              {
                "RollNum": 35,
                "div": "L",
                "PRN": 12210106,
                "Name": "MANE YASH PRATAP",
                "username": "yash.mane22@vit.edu",
                "GroupID": "L06",
                "Role": "Students",
                "password": "12210106"
              },
              {
                "RollNum": 36,
                "div": "L",
                "PRN": 12211688,
                "Name": "MANTRI SHREYA SHARAD",
                "username": "shreya.mantri222@vit.edu",
                "GroupID": "L07",
                "Role": "Students",
                "password": "12211688"
              },
              {
                "RollNum": 37,
                "div": "L",
                "PRN": 12210177,
                "Name": "MANWATKAR PRATHMESH DEVIDAS",
                "username": "prathmesh.manwatkar22@vit.edu",
                "GroupID": "L07",
                "Role": "Students",
                "password": "12210177"
              },
              {
                "RollNum": 38,
                "div": "L",
                "PRN": 12210337,
                "Name": "MASKE JANHAVI SANTOSH",
                "username": "janhavi.maske22@vit.edu",
                "GroupID": "L07",
                "Role": "Students",
                "password": "12210337"
              },
              {
                "RollNum": 39,
                "div": "L",
                "PRN": 12210224,
                "Name": "MASRAM TANISHQ VINOD",
                "username": "tanishq.masram22@vit.edu",
                "GroupID": "L07",
                "Role": "Students",
                "password": "12210224"
              },
              {
                "RollNum": 40,
                "div": "L",
                "PRN": 12210118,
                "Name": "MASTI PRATIK SURESH",
                "username": "pratik.masti22@vit.edu",
                "GroupID": "L07",
                "Role": "Students",
                "password": "12210118"
              },
              {
                "RollNum": 41,
                "div": "L",
                "PRN": 12210818,
                "Name": "MATE AKHIL ASHOK",
                "username": "akhil.mate22@vit.edu",
                "GroupID": "L07",
                "Role": "Students",
                "password": "12210818"
              },
              {
                "RollNum": 42,
                "div": "L",
                "PRN": 12210619,
                "Name": "MATHAPATI VIRAJ BASAVRAJ",
                "username": "viraj.mathapati22@vit.edu",
                "GroupID": "L08",
                "Role": "Students",
                "password": "12210619"
              },
              {
                "RollNum": 43,
                "div": "L",
                "PRN": 12211424,
                "Name": "MAURYA AYUSH HARI SHANKER",
                "username": "ayush.maurya22@vit.edu",
                "GroupID": "L08",
                "Role": "Students",
                "password": "12211424"
              },
              {
                "RollNum": 44,
                "div": "L",
                "PRN": 12210233,
                "Name": "MAYANK ZADE",
                "username": "mayank.zade22@vit.edu",
                "GroupID": "L08",
                "Role": "Students",
                "password": "12210233"
              },
              {
                "RollNum": 45,
                "div": "L",
                "PRN": 12211654,
                "Name": "MAYUR MANOJ AGARWAL",
                "username": "mayur.agarwal22@vit.edu",
                "GroupID": "L08",
                "Role": "Students",
                "password": "12211654"
              },
              {
                "RollNum": 46,
                "div": "L",
                "PRN": 12211039,
                "Name": "MEDAGE PRATHAMESH SUNIL",
                "username": "prathamesh.medage22@vit.edu",
                "GroupID": "L08",
                "Role": "Students",
                "password": "12211039"
              },
              {
                "RollNum": 47,
                "div": "L",
                "PRN": 12210886,
                "Name": "MEHETRE PRATIK BABASAHEB",
                "username": "pratik.mehetre22@vit.edu",
                "GroupID": "L09",
                "Role": "Students",
                "password": "12210886"
              },
              {
                "RollNum": 48,
                "div": "L",
                "PRN": 12210776,
                "Name": "MESHRAM KASHISH MORESHWAR",
                "username": "kashish.meshram22@vit.edu",
                "GroupID": "L09",
                "Role": "Students",
                "password": "12210776"
              },
              {
                "RollNum": 49,
                "div": "L",
                "PRN": 12211154,
                "Name": "MESHRAM PRAKASHIT DADARAO",
                "username": "prakashit.meshram22@vit.edu",
                "GroupID": "L09",
                "Role": "Students",
                "password": "12211154"
              },
              {
                "RollNum": 50,
                "div": "L",
                "PRN": 12210138,
                "Name": "MESHRAM PRATIK GANESH",
                "username": "pratik.meshram22@vit.edu",
                "GroupID": "L09",
                "Role": "Students",
                "password": "12210138"
              },
              {
                "RollNum": 51,
                "div": "L",
                "PRN": 12210079,
                "Name": "MHASKE KRISHNA SANJAY",
                "username": "krishna.mhaske22@vit.edu",
                "GroupID": "L09",
                "Role": "Students",
                "password": "12210079"
              },
              {
                "RollNum": 52,
                "div": "L",
                "PRN": 12210689,
                "Name": "MHASKE VIVEK VILAS",
                "username": "vivek.mhaske22@vit.edu",
                "GroupID": "L09",
                "Role": "Students",
                "password": "12210689"
              },
              {
                "RollNum": 53,
                "div": "L",
                "PRN": 12210380,
                "Name": "MHATRE RASHMIT RAJESH",
                "username": "rashmit.mhatre22@vit.edu",
                "GroupID": "L10",
                "Role": "Students",
                "password": "12210380"
              },
              {
                "RollNum": 54,
                "div": "L",
                "PRN": 12210217,
                "Name": "MHETRE MANTESH BHIMASHANKAR",
                "username": "mantesh.mhetre22@vit.edu",
                "GroupID": "L10",
                "Role": "Students",
                "password": "12210217"
              },
              {
                "RollNum": 55,
                "div": "L",
                "PRN": 12211636,
                "Name": "Minerva Senapati",
                "username": "minerva.senapati221@vit.edu",
                "GroupID": "L10",
                "Role": "Students",
                "password": "12211636"
              },
              {
                "RollNum": 56,
                "div": "L",
                "PRN": 12210944,
                "Name": "MISHRA AAKANKSHA VIKASH",
                "username": "aakanksha.mishra22@vit.edu",
                "GroupID": "L10",
                "Role": "Students",
                "password": "12210944"
              },
              {
                "RollNum": 57,
                "div": "L",
                "PRN": 12211414,
                "Name": "MODHAVE PRANAV KESHAV",
                "username": "pranav.modhave22@vit.edu",
                "GroupID": "L10",
                "Role": "Students",
                "password": "12211414"
              },
              {
                "RollNum": 58,
                "div": "L",
                "PRN": 12210540,
                "Name": "MOHEKAR NETRA SANJAY",
                "username": "netra.mohekar22@vit.edu",
                "GroupID": "L10",
                "Role": "Students",
                "password": "12210540"
              },
              {
                "RollNum": 59,
                "div": "L",
                "PRN": 12211423,
                "Name": "MOHITE SHREYA NARAYANRAO",
                "username": "shreya.mohite221@vit.edu",
                "GroupID": "L11",
                "Role": "Students",
                "password": "12211423"
              },
              {
                "RollNum": 60,
                "div": "L",
                "PRN": 12210358,
                "Name": "MOHOD PRATHAMESH RAVINDRA",
                "username": "prathamesh.mohod22@vit.edu",
                "GroupID": "L11",
                "Role": "Students",
                "password": "12210358"
              },
              {
                "RollNum": 61,
                "div": "L",
                "PRN": 12211004,
                "Name": "MOHOL VEDANT BHARAT",
                "username": "vedant.mohol22@vit.edu",
                "GroupID": "L11",
                "Role": "Students",
                "password": "12211004"
              },
              {
                "RollNum": 62,
                "div": "L",
                "PRN": 12211716,
                "Name": "MOHOLE SHRIHARI DAMODAR",
                "username": "shrihari.mohole22@vit.edu",
                "GroupID": "L11",
                "Role": "Students",
                "password": "12211716"
              },
              {
                "RollNum": 63,
                "div": "L",
                "PRN": 12210926,
                "Name": "MOIN KHAN USMAN KHAN",
                "username": "khan.moin22@vit.edu",
                "GroupID": "L11",
                "Role": "Students",
                "password": "12210926"
              },
              {
                "RollNum": 64,
                "div": "L",
                "PRN": 12210136,
                "Name": "MOKHADKAR MRUNAL SATISH",
                "username": "mrunal.mokhadkar22@vit.edu",
                "GroupID": "L11",
                "Role": "Students",
                "password": "12210136"
              },
              {
                "RollNum": 65,
                "div": "L",
                "PRN": 12210014,
                "Name": "MONDAL RUDRA NEIL TAPAN",
                "username": "rudraneil.mondal22@vit.edu",
                "GroupID": "L12",
                "Role": "Students",
                "password": "12210014"
              },
              {
                "RollNum": 66,
                "div": "L",
                "PRN": 12210077,
                "Name": "MONISH RAMESH WADILE",
                "username": "monish.wadile22@vit.edu",
                "GroupID": "L12",
                "Role": "Students",
                "password": "12210077"
              },
              {
                "RollNum": 67,
                "div": "L",
                "PRN": 12210924,
                "Name": "MOR AAYUSH GOVIND",
                "username": "aayush.mor22@vit.edu",
                "GroupID": "L12",
                "Role": "Students",
                "password": "12210924"
              },
              {
                "RollNum": 68,
                "div": "L",
                "PRN": 12210951,
                "Name": "MORALWAR SANDESH SUBHASH",
                "username": "sandesh.moralwar22@vit.edu",
                "GroupID": "L12",
                "Role": "Students",
                "password": "12210951"
              },
              {
                "RollNum": 69,
                "div": "L",
                "PRN": 12210870,
                "Name": "MORE DEEPAK NARSING",
                "username": "deepak.more22@vit.edu",
                "GroupID": "L12",
                "Role": "Students",
                "password": "12210870"
              },
              {
                "RollNum": 1,
                "div": "M",
                "PRN": 12211149,
                "Name": "MORE OMKAR SUBHASH",
                "username": "omkar.more22@vit.edu",
                "GroupID": "M01",
                "Role": "Students",
                "password": "12211149"
              },
              {
                "RollNum": 2,
                "div": "M",
                "PRN": 12210443,
                "Name": "MORE ROHAN RAJENDRA",
                "username": "rohan.more22@vit.edu",
                "GroupID": "M01",
                "Role": "Students",
                "password": "12210443"
              },
              {
                "RollNum": 3,
                "div": "M",
                "PRN": 12210647,
                "Name": "MORE SWAPNIL RAJENDRA",
                "username": "swapnil.more22@vit.edu",
                "GroupID": "M01",
                "Role": "Students",
                "password": "12210647"
              },
              {
                "RollNum": 4,
                "div": "M",
                "PRN": 12210369,
                "Name": "MORE VAIBHAV CHANDRAKANT",
                "username": "vaibhav.more22@vit.edu",
                "GroupID": "M01",
                "Role": "Students",
                "password": "12210369"
              },
              {
                "RollNum": 5,
                "div": "M",
                "PRN": 12211680,
                "Name": "Mrunmai Manoj Girame",
                "username": "mrunmai.girame221@vit.edu",
                "GroupID": "M01",
                "Role": "Students",
                "password": "12211680"
              },
              {
                "RollNum": 6,
                "div": "M",
                "PRN": 12210004,
                "Name": "MUHAMMAD SHAUKAT PARKAR",
                "username": "muhammad.parkar22@vit.edu",
                "GroupID": "M01",
                "Role": "Students",
                "password": "12210004"
              },
              {
                "RollNum": 7,
                "div": "M",
                "PRN": 12210157,
                "Name": "MUHMMAD ZAID AARIF KURESHI",
                "username": "muhmmadzaid.kureshi22@vit.edu",
                "GroupID": "M02",
                "Role": "Students",
                "password": "12210157"
              },
              {
                "RollNum": 8,
                "div": "M",
                "PRN": 12210362,
                "Name": "MUKKAWAR MITALI SANTOSH",
                "username": "mitali.mukkawar22@vit.edu",
                "GroupID": "M02",
                "Role": "Students",
                "password": "12210362"
              },
              {
                "RollNum": 9,
                "div": "M",
                "PRN": 12210239,
                "Name": "MULCHANDANI NEERAJ SUNIL",
                "username": "neeraj.mulchandani22@vit.edu",
                "GroupID": "M02",
                "Role": "Students",
                "password": "12210239"
              },
              {
                "RollNum": 10,
                "div": "M",
                "PRN": 12211130,
                "Name": "MULEY ASHISH PRAKASH",
                "username": "ashish.muley22@vit.edu",
                "GroupID": "M02",
                "Role": "Students",
                "password": "12211130"
              },
              {
                "RollNum": 11,
                "div": "M",
                "PRN": 12211359,
                "Name": "MULEY SAMIRAN SUHAS",
                "username": "samiran.muley22@vit.edu",
                "GroupID": "M02",
                "Role": "Students",
                "password": "12211359"
              },
              {
                "RollNum": 12,
                "div": "M",
                "PRN": 12210074,
                "Name": "MULEY SHRIYOG KISHOR",
                "username": "shriyog.muley22@vit.edu",
                "GroupID": "M02",
                "Role": "Students",
                "password": "12210074"
              },
              {
                "RollNum": 13,
                "div": "M",
                "PRN": 12210590,
                "Name": "MUNDE OM SHRIRAM",
                "username": "om.munde22@vit.edu",
                "GroupID": "M03",
                "Role": "Students",
                "password": "12210590"
              },
              {
                "RollNum": 14,
                "div": "M",
                "PRN": 12211096,
                "Name": "MUNDHE SWARANGI DNYANESHWAR",
                "username": "swarangi.mundhe22@vit.edu",
                "GroupID": "M03",
                "Role": "Students",
                "password": "12211096"
              },
              {
                "RollNum": 15,
                "div": "M",
                "PRN": 12210135,
                "Name": "MUNJALE ADITYA RAMKISAN",
                "username": "aditya.munjale22@vit.edu",
                "GroupID": "M03",
                "Role": "Students",
                "password": "12210135"
              },
              {
                "RollNum": 16,
                "div": "M",
                "PRN": 12210789,
                "Name": "MURKUTE YASH HIMMATRAO",
                "username": "yash.murkute22@vit.edu",
                "GroupID": "M03",
                "Role": "Students",
                "password": "12210789"
              },
              {
                "RollNum": 17,
                "div": "M",
                "PRN": 12210006,
                "Name": "MUSNE PARTH KRISHNAKANT",
                "username": "parth.musne22@vit.edu",
                "GroupID": "M03",
                "Role": "Students",
                "password": "12210006"
              },
              {
                "RollNum": 18,
                "div": "M",
                "PRN": 12211648,
                "Name": "MUSTAFA AFZAL KHAN",
                "username": "mustafa.khan22@vit.edu",
                "GroupID": "M03",
                "Role": "Students",
                "password": "12211648"
              },
              {
                "RollNum": 19,
                "div": "M",
                "PRN": 12211087,
                "Name": "MUTEKAR SAHIL LAXMIKANT",
                "username": "sahil.mutekar22@vit.edu",
                "GroupID": "M04",
                "Role": "Students",
                "password": "12211087"
              },
              {
                "RollNum": 20,
                "div": "M",
                "PRN": 12210632,
                "Name": "MUTHA ROHIT NILESH",
                "username": "rohit.mutha22@vit.edu",
                "GroupID": "M04",
                "Role": "Students",
                "password": "12210632"
              },
              {
                "RollNum": 21,
                "div": "M",
                "PRN": 12211693,
                "Name": "NACHANKAR SALONI JITENDRA",
                "username": "saloni.nachankar22@vit.edu",
                "GroupID": "M04",
                "Role": "Students",
                "password": "12211693"
              },
              {
                "RollNum": 22,
                "div": "M",
                "PRN": 12211505,
                "Name": "NAGARKAR SHREYAS SHRIPAD",
                "username": "shreyas.nagarkar222@vit.edu",
                "GroupID": "M04",
                "Role": "Students",
                "password": "12211505"
              },
              {
                "RollNum": 23,
                "div": "M",
                "PRN": 12211787,
                "Name": "NAGRAJ NARESH RAJAM",
                "username": "naresh.nagraj22@vit.edu",
                "GroupID": "M04",
                "Role": "Students",
                "password": "12211787"
              },
              {
                "RollNum": 24,
                "div": "M",
                "PRN": 12211207,
                "Name": "NAGRALE YASH RAJENDRA",
                "username": "yash.nagrale22@vit.edu",
                "GroupID": "M05",
                "Role": "Students",
                "password": "12211207"
              },
              {
                "RollNum": 25,
                "div": "M",
                "PRN": 12211392,
                "Name": "NAHAR MEET PRITAM",
                "username": "meet.nahar22@vit.edu",
                "GroupID": "M05",
                "Role": "Students",
                "password": "12211392"
              },
              {
                "RollNum": 26,
                "div": "M",
                "PRN": 12210065,
                "Name": "NAIK KRIPA DATTA",
                "username": "kripa.naik22@vit.edu",
                "GroupID": "M05",
                "Role": "Students",
                "password": "12210065"
              },
              {
                "RollNum": 27,
                "div": "M",
                "PRN": 12210050,
                "Name": "NAIK MRUNMAYEE RAJAN",
                "username": "mrunmayee.naik22@vit.edu",
                "GroupID": "M05",
                "Role": "Students",
                "password": "12210050"
              },
              {
                "RollNum": 28,
                "div": "M",
                "PRN": 12211153,
                "Name": "NAIK SAKSHI NANDUJI",
                "username": "sakshi.naik22@vit.edu",
                "GroupID": "M05",
                "Role": "Students",
                "password": "12211153"
              },
              {
                "RollNum": 29,
                "div": "M",
                "PRN": 12210058,
                "Name": "NAKAWAL MITAL VIKAS",
                "username": "mital.nakawal22@vit.edu",
                "GroupID": "M05",
                "Role": "Students",
                "password": "12210058"
              },
              {
                "RollNum": 30,
                "div": "M",
                "PRN": 12211111,
                "Name": "NAMA OMKAR VILAS",
                "username": "omkar.nama22@vit.edu",
                "GroupID": "M06",
                "Role": "Students",
                "password": "12211111"
              },
              {
                "RollNum": 31,
                "div": "M",
                "PRN": 12210501,
                "Name": "NANDANE HEMANT GANESH",
                "username": "hemant.nandane22@vit.edu",
                "GroupID": "M06",
                "Role": "Students",
                "password": "12210501"
              },
              {
                "RollNum": 32,
                "div": "M",
                "PRN": 12211621,
                "Name": "NANDWALKAR KUMAR ATUL",
                "username": "kumar.nandwalkar22@vit.edu",
                "GroupID": "M06",
                "Role": "Students",
                "password": "12211621"
              },
              {
                "RollNum": 33,
                "div": "M",
                "PRN": 12210415,
                "Name": "NANEKAR APURVA RAMESHWAR",
                "username": "apurva.nanekar22@vit.edu",
                "GroupID": "M06",
                "Role": "Students",
                "password": "12210415"
              },
              {
                "RollNum": 34,
                "div": "M",
                "PRN": 12210257,
                "Name": "NANGARE GAYATRI DADASO",
                "username": "gayatri.nangare22@vit.edu",
                "GroupID": "M06",
                "Role": "Students",
                "password": "12210257"
              },
              {
                "RollNum": 35,
                "div": "M",
                "PRN": 12211132,
                "Name": "NANGARE PATIL AMARSINH ANKUSH",
                "username": "patil.nangare22@vit.edu",
                "GroupID": "M06",
                "Role": "Students",
                "password": "12211132"
              },
              {
                "RollNum": 36,
                "div": "M",
                "PRN": 12210662,
                "Name": "NARAGUDE INDRAKUMAR HANUMANT",
                "username": "indrakumar.naragude22@vit.edu",
                "GroupID": "M07",
                "Role": "Students",
                "password": "12210662"
              },
              {
                "RollNum": 37,
                "div": "M",
                "PRN": 12211728,
                "Name": "NARKHEDE OM PRAVIN",
                "username": "om.narkhede22@vit.edu",
                "GroupID": "M07",
                "Role": "Students",
                "password": "12211728"
              },
              {
                "RollNum": 38,
                "div": "M",
                "PRN": 12211427,
                "Name": "NARSALE ADITYA SHRIKANT",
                "username": "aditya.narsale222@vit.edu",
                "GroupID": "M07",
                "Role": "Students",
                "password": "12211427"
              },
              {
                "RollNum": 39,
                "div": "M",
                "PRN": 12211749,
                "Name": "NATTUVETTY ADITHYA KRISHNA MANIKANDAN",
                "username": "adithyakrishna.nattuvetty22@vit.edu",
                "GroupID": "M07",
                "Role": "Students",
                "password": "12211749"
              },
              {
                "RollNum": 40,
                "div": "M",
                "PRN": 12211461,
                "Name": "NELEKAR SHRIRAJ BHARAT",
                "username": "shriraj.nelekar22@vit.edu",
                "GroupID": "M07",
                "Role": "Students",
                "password": "12211461"
              },
              {
                "RollNum": 41,
                "div": "M",
                "PRN": 12211595,
                "Name": "NEMADE MOKSHAD SACHIN",
                "username": "mokshad.nemade221@vit.edu",
                "GroupID": "M07",
                "Role": "Students",
                "password": "12211595"
              },
              {
                "RollNum": 42,
                "div": "M",
                "PRN": 12210044,
                "Name": "NIDHI NAGARAJA KARKERA",
                "username": "nidhi.karkera22@vit.edu",
                "GroupID": "M08",
                "Role": "Students",
                "password": "12210044"
              },
              {
                "RollNum": 43,
                "div": "M",
                "PRN": 12210677,
                "Name": "NIDHISH ANIL WAKODIKAR",
                "username": "nidhish.wakodikar22@vit.edu",
                "GroupID": "M08",
                "Role": "Students",
                "password": "12210677"
              },
              {
                "RollNum": 44,
                "div": "M",
                "PRN": 12210919,
                "Name": "NIKAM ASHISH BAJRANG",
                "username": "ashish.nikam22@vit.edu",
                "GroupID": "M08",
                "Role": "Students",
                "password": "12210919"
              },
              {
                "RollNum": 45,
                "div": "M",
                "PRN": 12210367,
                "Name": "NIKAM MRUNAL GANESH",
                "username": "mrunal.nikam22@vit.edu",
                "GroupID": "M08",
                "Role": "Students",
                "password": "12210367"
              },
              {
                "RollNum": 46,
                "div": "M",
                "PRN": 12210938,
                "Name": "NIKHARE SHREYASH VINOD",
                "username": "shreyash.nikhare22@vit.edu",
                "GroupID": "M08",
                "Role": "Students",
                "password": "12210938"
              },
              {
                "RollNum": 47,
                "div": "M",
                "PRN": 12210230,
                "Name": "NIKHILESH CHAUHAN",
                "username": "chauhan.nikhilesh22@vit.edu",
                "GroupID": "M09",
                "Role": "Students",
                "password": "12210230"
              },
              {
                "RollNum": 48,
                "div": "M",
                "PRN": 12210033,
                "Name": "NIKITA VINAYAK SUPEKAR",
                "username": "nikita.supekar22@vit.edu",
                "GroupID": "M09",
                "Role": "Students",
                "password": "12210033"
              },
              {
                "RollNum": 49,
                "div": "M",
                "PRN": 12210519,
                "Name": "NIKOLE SHREYA KRISHNA",
                "username": "shreya.nikole22@vit.edu",
                "GroupID": "M09",
                "Role": "Students",
                "password": "12210519"
              },
              {
                "RollNum": 50,
                "div": "M",
                "PRN": 12210232,
                "Name": "NIKOSE MAYANK MANOJ",
                "username": "mayank.nikose22@vit.edu",
                "GroupID": "M09",
                "Role": "Students",
                "password": "12210232"
              },
              {
                "RollNum": 51,
                "div": "M",
                "PRN": 12210474,
                "Name": "Anshul Vinod Nimje",
                "username": "anshul.nimje22@vit.edu",
                "GroupID": "M09",
                "Role": "Students",
                "password": "12210474"
              },
              {
                "RollNum": 52,
                "div": "M",
                "PRN": 12211198,
                "Name": "NIMKAR KUNAL ANIL",
                "username": "kunal.nimkar22@vit.edu",
                "GroupID": "M09",
                "Role": "Students",
                "password": "12211198"
              },
              {
                "RollNum": 53,
                "div": "M",
                "PRN": 12211381,
                "Name": "NIPANIKAR SANCHITSAI BALIRAM",
                "username": "sanchitsai.nipanikar22@vit.edu",
                "GroupID": "M10",
                "Role": "Students",
                "password": "12211381"
              },
              {
                "RollNum": 54,
                "div": "M",
                "PRN": 12210265,
                "Name": "NISHANT PRAVIN DEORE",
                "username": "nishant.deore22@vit.edu",
                "GroupID": "M10",
                "Role": "Students",
                "password": "12210265"
              },
              {
                "RollNum": 55,
                "div": "M",
                "PRN": 12210109,
                "Name": "NITESH RAJENDRA TANDEL",
                "username": "nitesh.tandel22@vit.edu",
                "GroupID": "M10",
                "Role": "Students",
                "password": "12210109"
              },
              {
                "RollNum": 56,
                "div": "M",
                "PRN": 12210502,
                "Name": "OAK ANEESH SURENDRA",
                "username": "aneesh.oak22@vit.edu",
                "GroupID": "M10",
                "Role": "Students",
                "password": "12210502"
              },
              {
                "RollNum": 57,
                "div": "M",
                "PRN": 12210038,
                "Name": "OM LALIT KANDPAL",
                "username": "om.kandpal22@vit.edu",
                "GroupID": "M10",
                "Role": "Students",
                "password": "12210038"
              },
              {
                "RollNum": 58,
                "div": "M",
                "PRN": 12211005,
                "Name": "OM PRAFULL POREDDIWAR",
                "username": "om.poreddiwar22@vit.edu",
                "GroupID": "M10",
                "Role": "Students",
                "password": "12211005"
              },
              {
                "RollNum": 59,
                "div": "M",
                "PRN": 12210288,
                "Name": "OM RAVINDRA SHINTRE",
                "username": "om.shintre22@vit.edu",
                "GroupID": "M11",
                "Role": "Students",
                "password": "12210288"
              },
              {
                "RollNum": 60,
                "div": "M",
                "PRN": 12211275,
                "Name": "OM SANJAY JADHAV",
                "username": "sanjay.om22@vit.edu",
                "GroupID": "M11",
                "Role": "Students",
                "password": "12211275"
              },
              {
                "RollNum": 61,
                "div": "M",
                "PRN": 12210698,
                "Name": "OMKAR ASHOK TONGARE",
                "username": "ashok.omkar22@vit.edu",
                "GroupID": "M11",
                "Role": "Students",
                "password": "12210698"
              },
              {
                "RollNum": 62,
                "div": "M",
                "PRN": 12210145,
                "Name": "OMKAR NANA TAKLE",
                "username": "nana.omkar22@vit.edu",
                "GroupID": "M11",
                "Role": "Students",
                "password": "12210145"
              },
              {
                "RollNum": 63,
                "div": "M",
                "PRN": 12211649,
                "Name": "OSWAL KRIYA MANOJ",
                "username": "kriya.oswal22@vit.edu",
                "GroupID": "M11",
                "Role": "Students",
                "password": "12211649"
              },
              {
                "RollNum": 64,
                "div": "M",
                "PRN": 12210234,
                "Name": "OTARI SAMARTH RAKESH",
                "username": "samarth.otari22@vit.edu",
                "GroupID": "M11",
                "Role": "Students",
                "password": "12210234"
              },
              {
                "RollNum": 65,
                "div": "M",
                "PRN": 12210242,
                "Name": "PADALKAR SHIVAM DNYANDEO",
                "username": "shivam.padalkar22@vit.edu",
                "GroupID": "M12",
                "Role": "Students",
                "password": "12210242"
              },
              {
                "RollNum": 66,
                "div": "M",
                "PRN": 12211633,
                "Name": "PADMAN PALAASH RAHUL",
                "username": "palaash.padman22@vit.edu",
                "GroupID": "M12",
                "Role": "Students",
                "password": "12211633"
              },
              {
                "RollNum": 67,
                "div": "M",
                "PRN": 12211798,
                "Name": "PAGARIYA JINAY NILESH",
                "username": "jinay.pagariya221@vit.edu",
                "GroupID": "M12",
                "Role": "Students",
                "password": "12211798"
              },
              {
                "RollNum": 68,
                "div": "M",
                "PRN": 12210997,
                "Name": "PAGERE NIRANJAN DILIP",
                "username": "niranjan.pagere22@vit.edu",
                "GroupID": "M12",
                "Role": "Students",
                "password": "12210997"
              },
              {
                "RollNum": 69,
                "div": "M",
                "PRN": 12210684,
                "Name": "PAHADE YASH SANJAY",
                "username": "yash.pahade22@vit.edu",
                "GroupID": "M12",
                "Role": "Students",
                "password": "12210684"
              },
              {
                "RollNum": 1,
                "div": "N",
                "PRN": 12210286,
                "Name": "PAIMODE RUPALI RAKHAMA",
                "username": "rupali.paimode22@vit.edu",
                "GroupID": "N01",
                "Role": "Students",
                "password": "12210286"
              },
              {
                "RollNum": 2,
                "div": "N",
                "PRN": 12211148,
                "Name": "PALASH BHIVGADE",
                "username": "bhivgade.palash22@vit.edu",
                "GroupID": "N01",
                "Role": "Students",
                "password": "12211148"
              },
              {
                "RollNum": 3,
                "div": "N",
                "PRN": 12211203,
                "Name": "PALDE ASHUMAL LAXMAN",
                "username": "ashumal.palde22@vit.edu",
                "GroupID": "N01",
                "Role": "Students",
                "password": "12211203"
              },
              {
                "RollNum": 4,
                "div": "N",
                "PRN": 12211727,
                "Name": "PALSHIKAR PRATHAMESH SHEKHAR",
                "username": "prathamesh.palshikar22@vit.edu",
                "GroupID": "N01",
                "Role": "Students",
                "password": "12211727"
              },
              {
                "RollNum": 5,
                "div": "N",
                "PRN": 12210958,
                "Name": "PANASKAR AVISHKAR SURESH",
                "username": "avishkar.panaskar22@vit.edu",
                "GroupID": "N01",
                "Role": "Students",
                "password": "12210958"
              },
              {
                "RollNum": 6,
                "div": "N",
                "PRN": 12211041,
                "Name": "PANCHALE MAITREYEE KISHOR",
                "username": "maitreyee.panchale22@vit.edu",
                "GroupID": "N01",
                "Role": "Students",
                "password": "12211041"
              },
              {
                "RollNum": 7,
                "div": "N",
                "PRN": 12211762,
                "Name": "PANDAV SOHAM PANKAJ",
                "username": "soham.pandav221@vit.edu",
                "GroupID": "N02",
                "Role": "Students",
                "password": "12211762"
              },
              {
                "RollNum": 8,
                "div": "N",
                "PRN": 12210366,
                "Name": "PANDE KEYUR VIVEK",
                "username": "keyur.pande22@vit.edu",
                "GroupID": "N02",
                "Role": "Students",
                "password": "12210366"
              },
              {
                "RollNum": 9,
                "div": "N",
                "PRN": 12210298,
                "Name": "PANINDRE ARYAN SAMEER",
                "username": "aryan.panindre22@vit.edu",
                "GroupID": "N02",
                "Role": "Students",
                "password": "12210298"
              },
              {
                "RollNum": 10,
                "div": "N",
                "PRN": 12211723,
                "Name": "PANKEY OMKAR RAM DILIP",
                "username": "omkar.pankey22@vit.edu",
                "GroupID": "N02",
                "Role": "Students",
                "password": "12211723"
              },
              {
                "RollNum": 11,
                "div": "N",
                "PRN": 12210630,
                "Name": "PANSARE NEHA BALASAHEB",
                "username": "neha.pansare22@vit.edu",
                "GroupID": "N02",
                "Role": "Students",
                "password": "12210630"
              },
              {
                "RollNum": 12,
                "div": "N",
                "PRN": 12210016,
                "Name": "PAPADE SPANDAN AVINASH",
                "username": "spandan.papade22@vit.edu",
                "GroupID": "N02",
                "Role": "Students",
                "password": "12210016"
              },
              {
                "RollNum": 13,
                "div": "N",
                "PRN": 12211566,
                "Name": "PAPARKAR ARYAN VIJAY",
                "username": "aryan.paparkar22@vit.edu",
                "GroupID": "N03",
                "Role": "Students",
                "password": "12211566"
              },
              {
                "RollNum": 14,
                "div": "N",
                "PRN": 12211638,
                "Name": "PARAS CHETAN PATIL",
                "username": "paras.patil22@vit.edu",
                "GroupID": "N03",
                "Role": "Students",
                "password": "12211638"
              },
              {
                "RollNum": 15,
                "div": "N",
                "PRN": 12210518,
                "Name": "PARBHANIKAR SHRIPAD KIRAN",
                "username": "shripad.parbhanikar22@vit.edu",
                "GroupID": "N03",
                "Role": "Students",
                "password": "12210518"
              },
              {
                "RollNum": 16,
                "div": "N",
                "PRN": 12210616,
                "Name": "PARBHANKAR ASHUTOSH RAMDAS",
                "username": "ashutosh.parbhankar22@vit.edu",
                "GroupID": "N03",
                "Role": "Students",
                "password": "12210616"
              },
              {
                "RollNum": 17,
                "div": "N",
                "PRN": 12210541,
                "Name": "PARCHURE INDRAJEET NAREN",
                "username": "indrajeet.parchure22@vit.edu",
                "GroupID": "N03",
                "Role": "Students",
                "password": "12210541"
              },
              {
                "RollNum": 18,
                "div": "N",
                "PRN": 12210278,
                "Name": "PARDESHI ATHARVA SURENDRA",
                "username": "atharva.pardeshi22@vit.edu",
                "GroupID": "N03",
                "Role": "Students",
                "password": "12210278"
              },
              {
                "RollNum": 19,
                "div": "N",
                "PRN": 12211368,
                "Name": "PARDESHI DEVANG SHARATSING",
                "username": "devang.pardeshi22@vit.edu",
                "GroupID": "N04",
                "Role": "Students",
                "password": "12211368"
              },
              {
                "RollNum": 20,
                "div": "N",
                "PRN": 12210308,
                "Name": "PARDESHI KARANSINGH SACHINSINGH",
                "username": "karansingh.pardeshi22@vit.edu",
                "GroupID": "N04",
                "Role": "Students",
                "password": "12210308"
              },
              {
                "RollNum": 21,
                "div": "N",
                "PRN": 12210773,
                "Name": "PARDESHI OMESHWARSINGH YUVRAJSINGH",
                "username": "omeshwarsingh.pardeshi22@vit.edu",
                "GroupID": "N04",
                "Role": "Students",
                "password": "12210773"
              },
              {
                "RollNum": 22,
                "div": "N",
                "PRN": 12211159,
                "Name": "PARDESHI TANISHQ PRAMOD",
                "username": "tanishq.pardeshi22@vit.edu",
                "GroupID": "N04",
                "Role": "Students",
                "password": "12211159"
              },
              {
                "RollNum": 23,
                "div": "N",
                "PRN": 12211479,
                "Name": "PAREEK SHYAM DHANRAJ",
                "username": "shyam.pareek22@vit.edu",
                "GroupID": "N04",
                "Role": "Students",
                "password": "12211479"
              },
              {
                "RollNum": 24,
                "div": "N",
                "PRN": 12210496,
                "Name": "PARIHAR ANSHU GUNESHWAR",
                "username": "anshu.parihar22@vit.edu",
                "GroupID": "N05",
                "Role": "Students",
                "password": "12210496"
              },
              {
                "RollNum": 25,
                "div": "N",
                "PRN": 12210017,
                "Name": "PARIKH ARYAN BHARAT",
                "username": "aryan.parikh22@vit.edu",
                "GroupID": "N05",
                "Role": "Students",
                "password": "12210017"
              },
              {
                "RollNum": 26,
                "div": "N",
                "PRN": 12210086,
                "Name": "PARKHI SAKSHI KUMAR",
                "username": "sakshi.parkhi22@vit.edu",
                "GroupID": "N05",
                "Role": "Students",
                "password": "12210086"
              },
              {
                "RollNum": 27,
                "div": "N",
                "PRN": 12211558,
                "Name": "PARLIKAR BHARGAV PRAVIN",
                "username": "bhargav.parlikar22@vit.edu",
                "GroupID": "N05",
                "Role": "Students",
                "password": "12211558"
              },
              {
                "RollNum": 28,
                "div": "N",
                "PRN": 12211298,
                "Name": "PARSHARAM DIKSHA MAHESH",
                "username": "diksha.parsharam221@vit.edu",
                "GroupID": "N05",
                "Role": "Students",
                "password": "12211298"
              },
              {
                "RollNum": 29,
                "div": "N",
                "PRN": 12211113,
                "Name": "PARTH JADHAV",
                "username": "parth.jadhav22@vit.edu",
                "GroupID": "N05",
                "Role": "Students",
                "password": "12211113"
              },
              {
                "RollNum": 30,
                "div": "N",
                "PRN": 12211160,
                "Name": "PARTH JALINDER DURGUDE",
                "username": "parth.durgude22@vit.edu",
                "GroupID": "N06",
                "Role": "Students",
                "password": "12211160"
              },
              {
                "RollNum": 31,
                "div": "N",
                "PRN": 12211422,
                "Name": "PARTH SANJAY KALANI",
                "username": "sanjay.parth22@vit.edu",
                "GroupID": "N06",
                "Role": "Students",
                "password": "12211422"
              },
              {
                "RollNum": 32,
                "div": "N",
                "PRN": 12210336,
                "Name": "PARYANI YASH SANTOSH",
                "username": "yash.paryani22@vit.edu",
                "GroupID": "N06",
                "Role": "Students",
                "password": "12210336"
              },
              {
                "RollNum": 33,
                "div": "N",
                "PRN": 12211639,
                "Name": "PATANGE PRIYAL SHILASRAO",
                "username": "priyal.patange22@vit.edu",
                "GroupID": "N06",
                "Role": "Students",
                "password": "12211639"
              },
              {
                "RollNum": 34,
                "div": "N",
                "PRN": 12211228,
                "Name": "PATANKAR ABHEERAV KAUSHAL",
                "username": "abheerav.patankar221@vit.edu",
                "GroupID": "N06",
                "Role": "Students",
                "password": "12211228"
              },
              {
                "RollNum": 35,
                "div": "N",
                "PRN": 12210105,
                "Name": "PATANKAR HRUSHIKESH AVINASH",
                "username": "hrushikesh.patankar22@vit.edu",
                "GroupID": "N06",
                "Role": "Students",
                "password": "12210105"
              },
              {
                "RollNum": 36,
                "div": "N",
                "PRN": 12210864,
                "Name": "PATEL PRANAV KISHOR",
                "username": "pranav.patel22@vit.edu",
                "GroupID": "N07",
                "Role": "Students",
                "password": "12210864"
              },
              {
                "RollNum": 37,
                "div": "N",
                "PRN": 12211765,
                "Name": "PATEL RUKMODDIN NABAB",
                "username": "rukmoddin.patel221@vit.edu",
                "GroupID": "N07",
                "Role": "Students",
                "password": "12211765"
              },
              {
                "RollNum": 38,
                "div": "N",
                "PRN": 12211406,
                "Name": "PATHAK AARUSHI PRADEEP",
                "username": "aarushi.pathak22@vit.edu",
                "GroupID": "N07",
                "Role": "Students",
                "password": "12211406"
              },
              {
                "RollNum": 39,
                "div": "N",
                "PRN": 12211249,
                "Name": "PATHAK AMEYA RAVINDRDA",
                "username": "ameya.pathak22@vit.edu",
                "GroupID": "N07",
                "Role": "Students",
                "password": "12211249"
              },
              {
                "RollNum": 40,
                "div": "N",
                "PRN": 12210060,
                "Name": "PATHAK ARYA MAHESH",
                "username": "arya.pathak22@vit.edu",
                "GroupID": "N07",
                "Role": "Students",
                "password": "12210060"
              },
              {
                "RollNum": 41,
                "div": "N",
                "PRN": 12210055,
                "Name": "PATHAK REVATI BHALCHANDRA",
                "username": "revati.pathak22@vit.edu",
                "GroupID": "N07",
                "Role": "Students",
                "password": "12210055"
              },
              {
                "RollNum": 42,
                "div": "N",
                "PRN": 12210143,
                "Name": "PATHAK SHUBHAM SHIRISH",
                "username": "shubham.pathak22@vit.edu",
                "GroupID": "N08",
                "Role": "Students",
                "password": "12210143"
              },
              {
                "RollNum": 43,
                "div": "N",
                "PRN": 12210643,
                "Name": "PATIL AADITYA MANISH",
                "username": "aaditya.patil22@vit.edu",
                "GroupID": "N08",
                "Role": "Students",
                "password": "12210643"
              },
              {
                "RollNum": 44,
                "div": "N",
                "PRN": 12211757,
                "Name": "PATIL ADITYA BALASO",
                "username": "aditya.patil223@vit.edu",
                "GroupID": "N08",
                "Role": "Students",
                "password": "12211757"
              },
              {
                "RollNum": 45,
                "div": "N",
                "PRN": 12211070,
                "Name": "PATIL ADITYA KIRAN",
                "username": "aditya.patil22@vit.edu",
                "GroupID": "N08",
                "Role": "Students",
                "password": "12211070"
              },
              {
                "RollNum": 46,
                "div": "N",
                "PRN": 12211182,
                "Name": "PATIL ADITYA SUDHIR",
                "username": "aditya.patil222@vit.edu",
                "GroupID": "N08",
                "Role": "Students",
                "password": "12211182"
              },
              {
                "RollNum": 47,
                "div": "N",
                "PRN": 12211640,
                "Name": "PATIL ARYA MAHESH",
                "username": "arya.patil22@vit.edu",
                "GroupID": "N09",
                "Role": "Students",
                "password": "12211640"
              },
              {
                "RollNum": 48,
                "div": "N",
                "PRN": 12210814,
                "Name": "PATIL AYUSHSINGH ATULSINGH",
                "username": "ayushsingh.patil22@vit.edu",
                "GroupID": "N09",
                "Role": "Students",
                "password": "12210814"
              },
              {
                "RollNum": 49,
                "div": "N",
                "PRN": 12211763,
                "Name": "PATIL BHOSALE YASHSINHRAJENDRA",
                "username": "bhosale.patil22@vit.edu",
                "GroupID": "N09",
                "Role": "Students",
                "password": "12211763"
              },
              {
                "RollNum": 50,
                "div": "N",
                "PRN": 12211079,
                "Name": "PATIL DARSHAN UMESH",
                "username": "darshan.patil22@vit.edu",
                "GroupID": "N09",
                "Role": "Students",
                "password": "12211079"
              },
              {
                "RollNum": 51,
                "div": "N",
                "PRN": 12211504,
                "Name": "PATIL GAURANG SAGAR",
                "username": "gaurang.patil221@vit.edu",
                "GroupID": "N09",
                "Role": "Students",
                "password": "12211504"
              },
              {
                "RollNum": 52,
                "div": "N",
                "PRN": 12210533,
                "Name": "PATIL GAURAV MAHENDRA",
                "username": "gaurav.patil22@vit.edu",
                "GroupID": "N09",
                "Role": "Students",
                "password": "12210533"
              },
              {
                "RollNum": 53,
                "div": "N",
                "PRN": 12211463,
                "Name": "PATIL HARSHWARDHAN AJAY",
                "username": "harshwardhan.patil22@vit.edu",
                "GroupID": "N10",
                "Role": "Students",
                "password": "12211463"
              },
              {
                "RollNum": 54,
                "div": "N",
                "PRN": 12211196,
                "Name": "PATIL HEMASHRI GAURAV",
                "username": "hemashri.patil22@vit.edu",
                "GroupID": "N10",
                "Role": "Students",
                "password": "12211196"
              },
              {
                "RollNum": 55,
                "div": "N",
                "PRN": 12211671,
                "Name": "PATIL HIMANSHU PRASHANT",
                "username": "himanshu.patil221@vit.edu",
                "GroupID": "N10",
                "Role": "Students",
                "password": "12211671"
              },
              {
                "RollNum": 56,
                "div": "N",
                "PRN": 12210264,
                "Name": "PATIL HITESHI SUYOG",
                "username": "hiteshi.patil22@vit.edu",
                "GroupID": "N10",
                "Role": "Students",
                "password": "12210264"
              },
              {
                "RollNum": 57,
                "div": "N",
                "PRN": 12210516,
                "Name": "PATIL INDRAJIT RAVIKUMAR",
                "username": "indrajit.patil22@vit.edu",
                "GroupID": "N10",
                "Role": "Students",
                "password": "12210516"
              },
              {
                "RollNum": 58,
                "div": "N",
                "PRN": 12211038,
                "Name": "PATIL KANAAD SHRIKANT",
                "username": "kanaad.patil22@vit.edu",
                "GroupID": "N10",
                "Role": "Students",
                "password": "12211038"
              },
              {
                "RollNum": 59,
                "div": "N",
                "PRN": 12211226,
                "Name": "PATIL KOUSHAL RAVALNATH",
                "username": "koushal.patil221@vit.edu",
                "GroupID": "N11",
                "Role": "Students",
                "password": "12211226"
              },
              {
                "RollNum": 60,
                "div": "N",
                "PRN": 12210266,
                "Name": "PATIL KRUSHNA ARUN",
                "username": "krushna.patil22@vit.edu",
                "GroupID": "N11",
                "Role": "Students",
                "password": "12210266"
              },
              {
                "RollNum": 61,
                "div": "N",
                "PRN": 12210327,
                "Name": "PATIL MAKRAND MADHUKAR",
                "username": "makrand.patil22@vit.edu",
                "GroupID": "N11",
                "Role": "Students",
                "password": "12210327"
              },
              {
                "RollNum": 62,
                "div": "N",
                "PRN": 12211772,
                "Name": "PATIL MANAS DNYANESHWAR",
                "username": "manas.patil221@vit.edu",
                "GroupID": "N11",
                "Role": "Students",
                "password": "12211772"
              },
              {
                "RollNum": 63,
                "div": "N",
                "PRN": 12210328,
                "Name": "PATIL MANASI BHARAT",
                "username": "manasi.patil22@vit.edu",
                "GroupID": "N11",
                "Role": "Students",
                "password": "12210328"
              },
              {
                "RollNum": 64,
                "div": "N",
                "PRN": 12211105,
                "Name": "PATIL MANASVI MAHADEV",
                "username": "manasvi.patil22@vit.edu",
                "GroupID": "N11",
                "Role": "Students",
                "password": "12211105"
              },
              {
                "RollNum": 65,
                "div": "N",
                "PRN": 12211030,
                "Name": "PATIL MITALI SHISHIR",
                "username": "mitali.patil22@vit.edu",
                "GroupID": "N12",
                "Role": "Students",
                "password": "12211030"
              },
              {
                "RollNum": 66,
                "div": "N",
                "PRN": 12210478,
                "Name": "PATIL NIRAJ PRAVIN",
                "username": "niraj.patil22@vit.edu",
                "GroupID": "N12",
                "Role": "Students",
                "password": "12210478"
              },
              {
                "RollNum": 67,
                "div": "N",
                "PRN": 12210860,
                "Name": "PATIL OM SACHIN",
                "username": "om.patil22@vit.edu",
                "GroupID": "N12",
                "Role": "Students",
                "password": "12210860"
              },
              {
                "RollNum": 68,
                "div": "N",
                "PRN": 12211063,
                "Name": "PATIL PIYUSH SHARAD",
                "username": "piyush.patil22@vit.edu",
                "GroupID": "N12",
                "Role": "Students",
                "password": "12211063"
              },
              {
                "RollNum": 69,
                "div": "N",
                "PRN": 12210072,
                "Name": "PATIL PRANAV AVINASH",
                "username": "pranav.patil22@vit.edu",
                "GroupID": "N12",
                "Role": "Students",
                "password": "12210072"
              },
              {
                "RollNum": 1,
                "div": "O",
                "PRN": 12211080,
                "Name": "PATIL PRANAV CHANDRASHEKHAR",
                "username": "pranav.patil222@vit.edu",
                "GroupID": "O01",
                "Role": "Students",
                "password": "12211080"
              },
              {
                "RollNum": 2,
                "div": "O",
                "PRN": 12210411,
                "Name": "PATIL PRANAV PRAVIN",
                "username": "pranav.patil221@vit.edu",
                "GroupID": "O01",
                "Role": "Students",
                "password": "12210411"
              },
              {
                "RollNum": 3,
                "div": "O",
                "PRN": 12211180,
                "Name": "PATIL PRANAV PRAVIN",
                "username": "pranav.patil223@vit.edu",
                "GroupID": "O01",
                "Role": "Students",
                "password": "12211180"
              },
              {
                "RollNum": 4,
                "div": "O",
                "PRN": 12211258,
                "Name": "PATIL PRASAD SHIVAJI",
                "username": "prasad.patil221@vit.edu",
                "GroupID": "O01",
                "Role": "Students",
                "password": "12211258"
              },
              {
                "RollNum": 5,
                "div": "O",
                "PRN": 12210604,
                "Name": "PATIL PRATHMESH PRADIP",
                "username": "prathmesh.patil22@vit.edu",
                "GroupID": "O01",
                "Role": "Students",
                "password": "12210604"
              },
              {
                "RollNum": 6,
                "div": "O",
                "PRN": 12210866,
                "Name": "PATIL RAJ KAMLAKAR",
                "username": "raj.patil22@vit.edu",
                "GroupID": "O01",
                "Role": "Students",
                "password": "12210866"
              },
              {
                "RollNum": 7,
                "div": "O",
                "PRN": 12211557,
                "Name": "PATIL RAJVARDHAN SANJEEV",
                "username": "rajvardhan.patil22@vit.edu",
                "GroupID": "O02",
                "Role": "Students",
                "password": "12211557"
              },
              {
                "RollNum": 8,
                "div": "O",
                "PRN": 12211051,
                "Name": "PATIL RITESH SANDIP",
                "username": "ritesh.patil22@vit.edu",
                "GroupID": "O02",
                "Role": "Students",
                "password": "12211051"
              },
              {
                "RollNum": 9,
                "div": "O",
                "PRN": 12211383,
                "Name": "PATIL ROHAN DEEPAK",
                "username": "rohan.patil22@vit.edu",
                "GroupID": "O02",
                "Role": "Students",
                "password": "12211383"
              },
              {
                "RollNum": 10,
                "div": "O",
                "PRN": 12211738,
                "Name": "PATIL ROSHAN RAJENDRA",
                "username": "roshan.patil221@vit.edu",
                "GroupID": "O02",
                "Role": "Students",
                "password": "12211738"
              },
              {
                "RollNum": 11,
                "div": "O",
                "PRN": 12211074,
                "Name": "PATIL RUSHIKESH RAJENDRA",
                "username": "rushikesh.patil22@vit.edu",
                "GroupID": "O02",
                "Role": "Students",
                "password": "12211074"
              },
              {
                "RollNum": 12,
                "div": "O",
                "PRN": 12210258,
                "Name": "PATIL RUTHVIK PRASHANT",
                "username": "ruthvik.patil22@vit.edu",
                "GroupID": "O02",
                "Role": "Students",
                "password": "12210258"
              },
              {
                "RollNum": 13,
                "div": "O",
                "PRN": 12211136,
                "Name": "PATIL SAGAR PRAKASH",
                "username": "sagar.patil22@vit.edu",
                "GroupID": "O03",
                "Role": "Students",
                "password": "12211136"
              },
              {
                "RollNum": 14,
                "div": "O",
                "PRN": 12211419,
                "Name": "PATIL SAHIL AMAR",
                "username": "sahil.patil221@vit.edu",
                "GroupID": "O03",
                "Role": "Students",
                "password": "12211419"
              },
              {
                "RollNum": 15,
                "div": "O",
                "PRN": 12211698,
                "Name": "PATIL SAHIL SANJAY",
                "username": "sahil.patil222@vit.edu",
                "GroupID": "O03",
                "Role": "Students",
                "password": "12211698"
              },
              {
                "RollNum": 16,
                "div": "O",
                "PRN": 12211491,
                "Name": "PATIL SANIYA RAJENDRASINH",
                "username": "saniya.patil22@vit.edu",
                "GroupID": "O03",
                "Role": "Students",
                "password": "12211491"
              },
              {
                "RollNum": 17,
                "div": "O",
                "PRN": 12210364,
                "Name": "PATIL SHANTANU PRADIP",
                "username": "shantanu.patil22@vit.edu",
                "GroupID": "O03",
                "Role": "Students",
                "password": "12210364"
              },
              {
                "RollNum": 18,
                "div": "O",
                "PRN": 12211033,
                "Name": "PATIL SHUBHAM SUHAS",
                "username": "shubham.patil221@vit.edu",
                "GroupID": "O03",
                "Role": "Students",
                "password": "12211033"
              },
              {
                "RollNum": 19,
                "div": "O",
                "PRN": 12210087,
                "Name": "PATIL SUJAL MAHESH",
                "username": "sujal.patil22@vit.edu",
                "GroupID": "O04",
                "Role": "Students",
                "password": "12210087"
              },
              {
                "RollNum": 20,
                "div": "O",
                "PRN": 12210507,
                "Name": "PATIL SUSHANT SHANTINATH",
                "username": "sushant.patil22@vit.edu",
                "GroupID": "O04",
                "Role": "Students",
                "password": "12210507"
              },
              {
                "RollNum": 21,
                "div": "O",
                "PRN": 12210407,
                "Name": "PATIL SWAMI CHANDRAKANT",
                "username": "swami.patil22@vit.edu",
                "GroupID": "O04",
                "Role": "Students",
                "password": "12210407"
              },
              {
                "RollNum": 22,
                "div": "O",
                "PRN": 12210280,
                "Name": "PATIL SWARUP PRASHANT",
                "username": "swarup.patil22@vit.edu",
                "GroupID": "O04",
                "Role": "Students",
                "password": "12210280"
              },
              {
                "RollNum": 23,
                "div": "O",
                "PRN": 12211552,
                "Name": "PATIL TANISHA ABHIJEET",
                "username": "tanisha.patil22@vit.edu",
                "GroupID": "O04",
                "Role": "Students",
                "password": "12211552"
              },
              {
                "RollNum": 24,
                "div": "O",
                "PRN": 12210054,
                "Name": "PATIL TANISHKA MANOJ",
                "username": "tanishka.patil22@vit.edu",
                "GroupID": "O05",
                "Role": "Students",
                "password": "12210054"
              },
              {
                "RollNum": 25,
                "div": "O",
                "PRN": 12211547,
                "Name": "PATIL VARUN DEEPAK",
                "username": "varun.patil22@vit.edu",
                "GroupID": "O05",
                "Role": "Students",
                "password": "12211547"
              },
              {
                "RollNum": 26,
                "div": "O",
                "PRN": 12211390,
                "Name": "PATIL VIRAJ MANOHAR",
                "username": "viraj.patil22@vit.edu",
                "GroupID": "O05",
                "Role": "Students",
                "password": "12211390"
              },
              {
                "RollNum": 27,
                "div": "O",
                "PRN": 12211334,
                "Name": "PATIL VIVEK DHARMENDRA",
                "username": "vivek.patil221@vit.edu",
                "GroupID": "O05",
                "Role": "Students",
                "password": "12211334"
              },
              {
                "RollNum": 28,
                "div": "O",
                "PRN": 12210305,
                "Name": "PATIL VRUSHABH DEEPAK",
                "username": "vrushabh.patil22@vit.edu",
                "GroupID": "O05",
                "Role": "Students",
                "password": "12210305"
              },
              {
                "RollNum": 29,
                "div": "O",
                "PRN": 12211204,
                "Name": "PATIL YOG VIJAY",
                "username": "yog.patil22@vit.edu",
                "GroupID": "O05",
                "Role": "Students",
                "password": "12211204"
              },
              {
                "RollNum": 30,
                "div": "O",
                "PRN": 12211238,
                "Name": "PATKAR VARAD VIJAY",
                "username": "varad.patkar221@vit.edu",
                "GroupID": "O06",
                "Role": "Students",
                "password": "12211238"
              },
              {
                "RollNum": 31,
                "div": "O",
                "PRN": 12211230,
                "Name": "PATLE AYUSH PATIRAM",
                "username": "ayush.patle221@vit.edu",
                "GroupID": "O06",
                "Role": "Students",
                "password": "12211230"
              },
              {
                "RollNum": 32,
                "div": "O",
                "PRN": 12210342,
                "Name": "PATLE PRIYANSHI HOMENDRA",
                "username": "priyanshi.patle22@vit.edu",
                "GroupID": "O06",
                "Role": "Students",
                "password": "12210342"
              },
              {
                "RollNum": 33,
                "div": "O",
                "PRN": 12210558,
                "Name": "PATRICE ADLINO ORIFA OSWAHA",
                "username": "patriceadlinoorifa.oswaha22@vit.edu",
                "GroupID": "O06",
                "Role": "Students",
                "password": "12210558"
              },
              {
                "RollNum": 34,
                "div": "O",
                "PRN": 12210907,
                "Name": "PATTHE AADITYA JUGRAJ",
                "username": "aaditya.patthe22@vit.edu",
                "GroupID": "O06",
                "Role": "Students",
                "password": "12210907"
              },
              {
                "RollNum": 35,
                "div": "O",
                "PRN": 12210931,
                "Name": "PATWARDHAN NIKHIL AMIT",
                "username": "nikhil.patwardhan22@vit.edu",
                "GroupID": "O06",
                "Role": "Students",
                "password": "12210931"
              },
              {
                "RollNum": 36,
                "div": "O",
                "PRN": 12210068,
                "Name": "PATWARDHAN SHREYA MANGESH",
                "username": "shreya.patwardhan22@vit.edu",
                "GroupID": "O07",
                "Role": "Students",
                "password": "12210068"
              },
              {
                "RollNum": 37,
                "div": "O",
                "PRN": 12210847,
                "Name": "PATWARDHAN SRUJAN UMESH",
                "username": "srujan.patwardhan22@vit.edu",
                "GroupID": "O07",
                "Role": "Students",
                "password": "12210847"
              },
              {
                "RollNum": 38,
                "div": "O",
                "PRN": 12210345,
                "Name": "PAWAR ADITYA ANIL",
                "username": "aditya.pawar22@vit.edu",
                "GroupID": "O07",
                "Role": "Students",
                "password": "12210345"
              },
              {
                "RollNum": 39,
                "div": "O",
                "PRN": 12211534,
                "Name": "PAWAR AVDHOOT ANIL",
                "username": "avdhoot.pawar22@vit.edu",
                "GroupID": "O07",
                "Role": "Students",
                "password": "12211534"
              },
              {
                "RollNum": 40,
                "div": "O",
                "PRN": 12211231,
                "Name": "PAWAR BHAGYESH SUNIL",
                "username": "bhagyesh.pawar221@vit.edu",
                "GroupID": "O07",
                "Role": "Students",
                "password": "12211231"
              },
              {
                "RollNum": 41,
                "div": "O",
                "PRN": 12211674,
                "Name": "PAWAR KUNAL SANDESH",
                "username": "kunal.pawar22@vit.edu",
                "GroupID": "O07",
                "Role": "Students",
                "password": "12211674"
              },
              {
                "RollNum": 42,
                "div": "O",
                "PRN": 12211163,
                "Name": "PAWAR MOHINI KAILASH",
                "username": "mohini.pawar22@vit.edu",
                "GroupID": "O08",
                "Role": "Students",
                "password": "12211163"
              },
              {
                "RollNum": 43,
                "div": "O",
                "PRN": 12210520,
                "Name": "PAWAR NIKITA VINAYAK",
                "username": "nikita.pawar22@vit.edu",
                "GroupID": "O08",
                "Role": "Students",
                "password": "12210520"
              },
              {
                "RollNum": 44,
                "div": "O",
                "PRN": 12210148,
                "Name": "PAWAR PAVAN VIJAY",
                "username": "pavan.pawar22@vit.edu",
                "GroupID": "O08",
                "Role": "Students",
                "password": "12210148"
              },
              {
                "RollNum": 45,
                "div": "O",
                "PRN": 12210393,
                "Name": "PAWAR SANDIP ANIL",
                "username": "sandip.pawar22@vit.edu",
                "GroupID": "O08",
                "Role": "Students",
                "password": "12210393"
              },
              {
                "RollNum": 46,
                "div": "O",
                "PRN": 12210583,
                "Name": "PAWAR SEJAL DNYANESHWAR",
                "username": "sejal.pawar22@vit.edu",
                "GroupID": "O08",
                "Role": "Students",
                "password": "12210583"
              },
              {
                "RollNum": 47,
                "div": "O",
                "PRN": 12211162,
                "Name": "PAWAR SUJAL SATISH",
                "username": "sujal.pawar22@vit.edu",
                "GroupID": "O09",
                "Role": "Students",
                "password": "12211162"
              },
              {
                "RollNum": 48,
                "div": "O",
                "PRN": 12210147,
                "Name": "PEHERE KUNAL DNYANESHWAR",
                "username": "kunal.pehere22@vit.edu",
                "GroupID": "O09",
                "Role": "Students",
                "password": "12210147"
              },
              {
                "RollNum": 49,
                "div": "O",
                "PRN": 12210458,
                "Name": "PENDOR SMIT BHARAT",
                "username": "smit.pendor22@vit.edu",
                "GroupID": "O09",
                "Role": "Students",
                "password": "12210458"
              },
              {
                "RollNum": 50,
                "div": "O",
                "PRN": 12211435,
                "Name": "Apoorva P",
                "username": "apoorva.pendse221@vit.edu",
                "GroupID": "O09",
                "Role": "Students",
                "password": "12211435"
              },
              {
                "RollNum": 51,
                "div": "O",
                "PRN": 12210497,
                "Name": "PENDSE SARVESH SHIRISH",
                "username": "sarvesh.pendse22@vit.edu",
                "GroupID": "O09",
                "Role": "Students",
                "password": "12210497"
              },
              {
                "RollNum": 52,
                "div": "O",
                "PRN": 12210547,
                "Name": "PETKAR HARSHAL MANGAL",
                "username": "harshal.petkar22@vit.edu",
                "GroupID": "O09",
                "Role": "Students",
                "password": "12210547"
              },
              {
                "RollNum": 53,
                "div": "O",
                "PRN": 12211501,
                "Name": "PETKAR PARTH PRASHANT",
                "username": "parth.petkar221@vit.edu",
                "GroupID": "O10",
                "Role": "Students",
                "password": "12211501"
              },
              {
                "RollNum": 54,
                "div": "O",
                "PRN": 12210956,
                "Name": "PHADE AKSHAT SWAPNIL",
                "username": "akshat.phade22@vit.edu",
                "GroupID": "O10",
                "Role": "Students",
                "password": "12210956"
              },
              {
                "RollNum": 55,
                "div": "O",
                "PRN": 12210080,
                "Name": "PHALKE VARUN MAHENDRA",
                "username": "varun.phalke22@vit.edu",
                "GroupID": "O10",
                "Role": "Students",
                "password": "12210080"
              },
              {
                "RollNum": 56,
                "div": "O",
                "PRN": 12211292,
                "Name": "PHAND SWARAJ SUNILKUMAR",
                "username": "swaraj.phand221@vit.edu",
                "GroupID": "O10",
                "Role": "Students",
                "password": "12211292"
              },
              {
                "RollNum": 57,
                "div": "O",
                "PRN": 12211338,
                "Name": "PHULE DIVYA SURESH",
                "username": "divya.phule221@vit.edu",
                "GroupID": "O10",
                "Role": "Students",
                "password": "12211338"
              },
              {
                "RollNum": 58,
                "div": "O",
                "PRN": 12210021,
                "Name": "PINGAT SOHAM SANJAY",
                "username": "soham.pingat22@vit.edu",
                "GroupID": "O10",
                "Role": "Students",
                "password": "12210021"
              },
              {
                "RollNum": 59,
                "div": "O",
                "PRN": 12211535,
                "Name": "PISE AARYA DINESH",
                "username": "aarya.pise22@vit.edu",
                "GroupID": "O11",
                "Role": "Students",
                "password": "12211535"
              },
              {
                "RollNum": 60,
                "div": "O",
                "PRN": 12210551,
                "Name": "PISE RAHUL MAHADEV",
                "username": "rahul.pise22@vit.edu",
                "GroupID": "O11",
                "Role": "Students",
                "password": "12210551"
              },
              {
                "RollNum": 61,
                "div": "O",
                "PRN": 12210166,
                "Name": "PITHE SARTHAK SANJAY",
                "username": "sarthak.pithe22@vit.edu",
                "GroupID": "O11",
                "Role": "Students",
                "password": "12210166"
              },
              {
                "RollNum": 62,
                "div": "O",
                "PRN": 12210383,
                "Name": "POKALE VAIBHAV BABAN",
                "username": "vaibhav.pokale22@vit.edu",
                "GroupID": "O11",
                "Role": "Students",
                "password": "12210383"
              },
              {
                "RollNum": 63,
                "div": "O",
                "PRN": 12210660,
                "Name": "POOJA SHAILENDRASINGH JADHAVRAO",
                "username": "shailendrasingh.pooja22@vit.edu",
                "GroupID": "O11",
                "Role": "Students",
                "password": "12210660"
              },
              {
                "RollNum": 64,
                "div": "O",
                "PRN": 12211348,
                "Name": "POONAM MAHESH NIKAM",
                "username": "mahesh.poonam22@vit.edu",
                "GroupID": "O11",
                "Role": "Students",
                "password": "12211348"
              },
              {
                "RollNum": 65,
                "div": "O",
                "PRN": 12210338,
                "Name": "POTE DNYANESHWARI MAHESH",
                "username": "dnyaneshwari.pote22@vit.edu",
                "GroupID": "O12",
                "Role": "Students",
                "password": "12210338"
              },
              {
                "RollNum": 66,
                "div": "O",
                "PRN": 12211239,
                "Name": "POTNIS HRISHIKESH SHEKHAR",
                "username": "hrishikesh.potnis221@vit.edu",
                "GroupID": "O12",
                "Role": "Students",
                "password": "12211239"
              },
              {
                "RollNum": 67,
                "div": "O",
                "PRN": 12210174,
                "Name": "POWAR PAYAL RANJEET",
                "username": "payal.powar22@vit.edu",
                "GroupID": "O12",
                "Role": "Students",
                "password": "12210174"
              },
              {
                "RollNum": 68,
                "div": "O",
                "PRN": 12210628,
                "Name": "POWAR SUJAL AMAR",
                "username": "sujal.powar22@vit.edu",
                "GroupID": "O12",
                "Role": "Students",
                "password": "12210628"
              },
              {
                "RollNum": 69,
                "div": "O",
                "PRN": 12211768,
                "Name": "PRABHU CHINMAYEE PRADIPKUMAR",
                "username": "chinmayee.prabhu221@vit.edu",
                "GroupID": "O12",
                "Role": "Students",
                "password": "12211768"
              },
              {
                "RollNum": 1,
                "div": "P",
                "PRN": 12211683,
                "Name": "Pradnyesh Ravane",
                "username": "pradnyesh.ravane221@vit.edu",
                "GroupID": "P01",
                "Role": "Students",
                "password": "12211683"
              },
              {
                "RollNum": 2,
                "div": "P",
                "PRN": 12210110,
                "Name": "PRAJWAL GHULE",
                "username": "prajwal.ghule22@vit.edu",
                "GroupID": "P01",
                "Role": "Students",
                "password": "12210110"
              },
              {
                "RollNum": 3,
                "div": "P",
                "PRN": 12210294,
                "Name": "Prajyot Borikar",
                "username": "prajyot.borikar22@vit.edu",
                "GroupID": "P01",
                "Role": "Students",
                "password": "12210294"
              },
              {
                "RollNum": 4,
                "div": "P",
                "PRN": 12211211,
                "Name": "PRAMOD SHIVAPNOR",
                "username": "shivapnor.pramod22@vit.edu",
                "GroupID": "P01",
                "Role": "Students",
                "password": "12211211"
              },
              {
                "RollNum": 5,
                "div": "P",
                "PRN": 12210417,
                "Name": "PRANAY KUHITE",
                "username": "kuhite.pranay22@vit.edu",
                "GroupID": "P01",
                "Role": "Students",
                "password": "12210417"
              },
              {
                "RollNum": 6,
                "div": "P",
                "PRN": 12211451,
                "Name": "PRATHAM TUSHAR GADKARI",
                "username": "tushar.pratham22@vit.edu",
                "GroupID": "P01",
                "Role": "Students",
                "password": "12211451"
              },
              {
                "RollNum": 7,
                "div": "P",
                "PRN": 12210723,
                "Name": "PRATHAMESH LAHU GARE",
                "username": "lahu.prathamesh22@vit.edu",
                "GroupID": "P02",
                "Role": "Students",
                "password": "12210723"
              },
              {
                "RollNum": 8,
                "div": "P",
                "PRN": 12210617,
                "Name": "PRATHAMESH P GURAV",
                "username": "prathamesh.gurav22@vit.edu",
                "GroupID": "P02",
                "Role": "Students",
                "password": "12210617"
              },
              {
                "RollNum": 9,
                "div": "P",
                "PRN": 12210582,
                "Name": "PRAYAG AMEY ASHISH",
                "username": "amey.prayag22@vit.edu",
                "GroupID": "P02",
                "Role": "Students",
                "password": "12210582"
              },
              {
                "RollNum": 10,
                "div": "P",
                "PRN": 12211367,
                "Name": "PUNDE PARTH PRASHANT",
                "username": "parth.punde22@vit.edu",
                "GroupID": "P02",
                "Role": "Students",
                "password": "12211367"
              },
              {
                "RollNum": 11,
                "div": "P",
                "PRN": 12210008,
                "Name": "PUNDE SHUBHAN SARANG",
                "username": "shubhan.punde22@vit.edu",
                "GroupID": "P02",
                "Role": "Students",
                "password": "12210008"
              },
              {
                "RollNum": 12,
                "div": "P",
                "PRN": 12210059,
                "Name": "PUNIWALA SHUBHAM NILESH",
                "username": "shubham.puniwala22@vit.edu",
                "GroupID": "P02",
                "Role": "Students",
                "password": "12210059"
              },
              {
                "RollNum": 13,
                "div": "P",
                "PRN": 12211582,
                "Name": "PUROHIT SHLOK VINOD",
                "username": "shlok.purohit22@vit.edu",
                "GroupID": "P03",
                "Role": "Students",
                "password": "12211582"
              },
              {
                "RollNum": 14,
                "div": "P",
                "PRN": 12210408,
                "Name": "PUROHIT VISHAL SURESH",
                "username": "vishal.purohit22@vit.edu",
                "GroupID": "P03",
                "Role": "Students",
                "password": "12210408"
              },
              {
                "RollNum": 15,
                "div": "P",
                "PRN": 12211209,
                "Name": "PURVA VILAS SARVADE",
                "username": "purva.sarvade22@vit.edu",
                "GroupID": "P03",
                "Role": "Students",
                "password": "12211209"
              },
              {
                "RollNum": 16,
                "div": "P",
                "PRN": 12210524,
                "Name": "PUSEGAONKAR AMEY HRISHIKESH",
                "username": "amey.pusegaonkar22@vit.edu",
                "GroupID": "P03",
                "Role": "Students",
                "password": "12210524"
              },
              {
                "RollNum": 17,
                "div": "P",
                "PRN": 12211493,
                "Name": "PUSHKAR MARUTI KAMBLE",
                "username": "pushkar.kamble22@vit.edu",
                "GroupID": "P03",
                "Role": "Students",
                "password": "12211493"
              },
              {
                "RollNum": 18,
                "div": "P",
                "PRN": 12210201,
                "Name": "PUSHPINDER SINGH",
                "username": "singh.pushpinder22@vit.edu",
                "GroupID": "P03",
                "Role": "Students",
                "password": "12210201"
              },
              {
                "RollNum": 19,
                "div": "P",
                "PRN": 12210952,
                "Name": "RACHIT DHARMENDRA NIMJE",
                "username": "dharmendra.rachit22@vit.edu",
                "GroupID": "P04",
                "Role": "Students",
                "password": "12210952"
              },
              {
                "RollNum": 20,
                "div": "P",
                "PRN": 12211083,
                "Name": "RACHIT MALARA",
                "username": "malara.rachit22@vit.edu",
                "GroupID": "P04",
                "Role": "Students",
                "password": "12211083"
              },
              {
                "RollNum": 21,
                "div": "P",
                "PRN": 12211724,
                "Name": "RAHANGDALE VED LOKCHAND",
                "username": "ved.rahangdale221@vit.edu",
                "GroupID": "P04",
                "Role": "Students",
                "password": "12211724"
              },
              {
                "RollNum": 22,
                "div": "P",
                "PRN": 12210191,
                "Name": "RAHUL DAGA",
                "username": "rahul.daga22@vit.edu",
                "GroupID": "P04",
                "Role": "Students",
                "password": "12210191"
              },
              {
                "RollNum": 23,
                "div": "P",
                "PRN": 12211061,
                "Name": "RAHUL MILIND LADE",
                "username": "milind.rahul22@vit.edu",
                "GroupID": "P04",
                "Role": "Students",
                "password": "12211061"
              },
              {
                "RollNum": 24,
                "div": "P",
                "PRN": 12211177,
                "Name": "RAHUL RAGHUNATH PRASAD YADAV",
                "username": "raghunath.rahul22@vit.edu",
                "GroupID": "P05",
                "Role": "Students",
                "password": "12211177"
              },
              {
                "RollNum": 25,
                "div": "P",
                "PRN": 12211413,
                "Name": "Sanshodhan Rajesh Soor",
                "username": "rajesh.sanshodhan22@vit.edu",
                "GroupID": "P05",
                "Role": "Students",
                "password": "12211413"
              },
              {
                "RollNum": 26,
                "div": "P",
                "PRN": 12210557,
                "Name": "RAJGADKAR GAURAV BHOPALRAO",
                "username": "gaurav.rajgadkar22@vit.edu",
                "GroupID": "P05",
                "Role": "Students",
                "password": "12210557"
              },
              {
                "RollNum": 27,
                "div": "P",
                "PRN": 12210253,
                "Name": "RAJGURU VARUN MOHAN",
                "username": "varun.rajguru22@vit.edu",
                "GroupID": "P05",
                "Role": "Students",
                "password": "12210253"
              },
              {
                "RollNum": 28,
                "div": "P",
                "PRN": 12211304,
                "Name": "RAJNANDINI DHARASHIVE",
                "username": "dharashive.rajnandini22@vit.edu",
                "GroupID": "P05",
                "Role": "Students",
                "password": "12211304"
              },
              {
                "RollNum": 29,
                "div": "P",
                "PRN": 12211446,
                "Name": "RAJOPADHYE PARTH RAHUL",
                "username": "parth.rajopadhye221@vit.edu",
                "GroupID": "P05",
                "Role": "Students",
                "password": "12211446"
              },
              {
                "RollNum": 30,
                "div": "P",
                "PRN": 12211053,
                "Name": "RAJURKAR GEETESH SANJIV",
                "username": "geetesh.rajurkar22@vit.edu",
                "GroupID": "P06",
                "Role": "Students",
                "password": "12211053"
              },
              {
                "RollNum": 31,
                "div": "P",
                "PRN": 12211309,
                "Name": "RAJURKAR JANHAVI AJIT",
                "username": "janhavi.rajurkar22@vit.edu",
                "GroupID": "P06",
                "Role": "Students",
                "password": "12211309"
              },
              {
                "RollNum": 32,
                "div": "P",
                "PRN": 12210908,
                "Name": "RAJVAIDYA ARYA JAGDISH",
                "username": "arya.rajvaidya22@vit.edu",
                "GroupID": "P06",
                "Role": "Students",
                "password": "12210908"
              },
              {
                "RollNum": 33,
                "div": "P",
                "PRN": 12211013,
                "Name": "RAKH SHANKAR DHANANJAY",
                "username": "shankar.rakh22@vit.edu",
                "GroupID": "P06",
                "Role": "Students",
                "password": "12211013"
              },
              {
                "RollNum": 34,
                "div": "P",
                "PRN": 12210150,
                "Name": "RAKHONDE NACHIKET PRAMOD",
                "username": "nachiket.rakhonde22@vit.edu",
                "GroupID": "P06",
                "Role": "Students",
                "password": "12210150"
              },
              {
                "RollNum": 35,
                "div": "P",
                "PRN": 12210758,
                "Name": "RAMPURE ADITYA SANGRAM",
                "username": "aditya.rampure22@vit.edu",
                "GroupID": "P06",
                "Role": "Students",
                "password": "12210758"
              },
              {
                "RollNum": 36,
                "div": "P",
                "PRN": 12210108,
                "Name": "RANANAVARE VANSHIKA ABHAYSINH",
                "username": "vanshika.rananavare22@vit.edu",
                "GroupID": "P07",
                "Role": "Students",
                "password": "12210108"
              },
              {
                "RollNum": 37,
                "div": "P",
                "PRN": 12210350,
                "Name": "RANAWARE MEGHRAJ PRAMOD",
                "username": "meghraj.ranaware22@vit.edu",
                "GroupID": "P07",
                "Role": "Students",
                "password": "12210350"
              },
              {
                "RollNum": 38,
                "div": "P",
                "PRN": 12210159,
                "Name": "RANE KUNAL SANJAY",
                "username": "kunal.rane22@vit.edu",
                "GroupID": "P07",
                "Role": "Students",
                "password": "12210159"
              },
              {
                "RollNum": 39,
                "div": "P",
                "PRN": 12210343,
                "Name": "RANE VEDANT NITIN",
                "username": "vedant.rane22@vit.edu",
                "GroupID": "P07",
                "Role": "Students",
                "password": "12210343"
              },
              {
                "RollNum": 40,
                "div": "P",
                "PRN": 12210267,
                "Name": "RASAL OMKAR KISHOR",
                "username": "omkar.rasal22@vit.edu",
                "GroupID": "P07",
                "Role": "Students",
                "password": "12210267"
              },
              {
                "RollNum": 41,
                "div": "P",
                "PRN": 12211719,
                "Name": "RASKAR SOHAM VITTHAL",
                "username": "soham.raskar221@vit.edu",
                "GroupID": "P07",
                "Role": "Students",
                "password": "12211719"
              },
              {
                "RollNum": 42,
                "div": "P",
                "PRN": 12210027,
                "Name": "RATHI PARTH AJAY",
                "username": "parth.rathi22@vit.edu",
                "GroupID": "P08",
                "Role": "Students",
                "password": "12210027"
              },
              {
                "RollNum": 43,
                "div": "P",
                "PRN": 12211438,
                "Name": "RATHI PURVESH RAMESHWAR",
                "username": "purvesh.rathi221@vit.edu",
                "GroupID": "P08",
                "Role": "Students",
                "password": "12211438"
              },
              {
                "RollNum": 44,
                "div": "P",
                "PRN": 12210882,
                "Name": "RATHOD CHAITANYA ANARSINGH",
                "username": "chaitanya.rathod22@vit.edu",
                "GroupID": "P08",
                "Role": "Students",
                "password": "12210882"
              },
              {
                "RollNum": 45,
                "div": "P",
                "PRN": 12210548,
                "Name": "RATHOD KHUSHBU PRAMOD",
                "username": "khushbu.rathod22@vit.edu",
                "GroupID": "P08",
                "Role": "Students",
                "password": "12210548"
              },
              {
                "RollNum": 46,
                "div": "P",
                "PRN": 12210226,
                "Name": "RATHOD MANISH SHANKAR",
                "username": "manish.rathod22@vit.edu",
                "GroupID": "P08",
                "Role": "Students",
                "password": "12210226"
              },
              {
                "RollNum": 47,
                "div": "P",
                "PRN": 12211110,
                "Name": "RATHOD SAISH MILIND",
                "username": "saish.rathod22@vit.edu",
                "GroupID": "P09",
                "Role": "Students",
                "password": "12211110"
              },
              {
                "RollNum": 48,
                "div": "P",
                "PRN": 12210324,
                "Name": "RATHOD SAKSHI RAMDAS",
                "username": "sakshi.rathod22@vit.edu",
                "GroupID": "P09",
                "Role": "Students",
                "password": "12210324"
              },
              {
                "RollNum": 49,
                "div": "P",
                "PRN": 12210182,
                "Name": "RATHOD YASH RAJESH",
                "username": "yash.rathod22@vit.edu",
                "GroupID": "P09",
                "Role": "Students",
                "password": "12210182"
              },
              {
                "RollNum": 50,
                "div": "P",
                "PRN": 12210488,
                "Name": "RATNALIKAR PRANAV PRAMOD",
                "username": "pranav.ratnalikar22@vit.edu",
                "GroupID": "P09",
                "Role": "Students",
                "password": "12210488"
              },
              {
                "RollNum": 51,
                "div": "P",
                "PRN": 12211014,
                "Name": "RATNAPARKHI YUVRAJ RAVINDRA",
                "username": "yuvraj.ratnaparkhi22@vit.edu",
                "GroupID": "P09",
                "Role": "Students",
                "password": "12211014"
              },
              {
                "RollNum": 52,
                "div": "P",
                "PRN": 12211364,
                "Name": "RAUL RIDDHI SANJAY",
                "username": "riddhi.raul22@vit.edu",
                "GroupID": "P09",
                "Role": "Students",
                "password": "12211364"
              },
              {
                "RollNum": 53,
                "div": "P",
                "PRN": 12211256,
                "Name": "RAUT ANURAG TRYAMBAK",
                "username": "anurag.raut22@vit.edu",
                "GroupID": "P10",
                "Role": "Students",
                "password": "12211256"
              },
              {
                "RollNum": 54,
                "div": "P",
                "PRN": 12210139,
                "Name": "RAUT KETAKI DHARMARAJ",
                "username": "ketaki.raut22@vit.edu",
                "GroupID": "P10",
                "Role": "Students",
                "password": "12210139"
              },
              {
                "RollNum": 55,
                "div": "P",
                "PRN": 12210409,
                "Name": "RAUT NISHITH PRAKASH",
                "username": "nishith.raut22@vit.edu",
                "GroupID": "P10",
                "Role": "Students",
                "password": "12210409"
              },
              {
                "RollNum": 56,
                "div": "P",
                "PRN": 12211673,
                "Name": "RAUT SAMEER VINOD",
                "username": "sameer.raut22@vit.edu",
                "GroupID": "P10",
                "Role": "Students",
                "password": "12211673"
              },
              {
                "RollNum": 57,
                "div": "P",
                "PRN": 12210307,
                "Name": "RAUT SAMRUDDHI GAJANAN",
                "username": "samruddhi.raut22@vit.edu",
                "GroupID": "P10",
                "Role": "Students",
                "password": "12210307"
              },
              {
                "RollNum": 58,
                "div": "P",
                "PRN": 12211396,
                "Name": "RAUT SHREYA SANTOSH",
                "username": "shreya.raut22@vit.edu",
                "GroupID": "P10",
                "Role": "Students",
                "password": "12211396"
              },
              {
                "RollNum": 59,
                "div": "P",
                "PRN": 12210396,
                "Name": "RAWALE VEDANT DIGAMBAR",
                "username": "vedant.rawale22@vit.edu",
                "GroupID": "P11",
                "Role": "Students",
                "password": "12210396"
              },
              {
                "RollNum": 60,
                "div": "P",
                "PRN": 12211075,
                "Name": "RENUKA RAJESH PAWAR",
                "username": "renuka.pawar22@vit.edu",
                "GroupID": "P11",
                "Role": "Students",
                "password": "12211075"
              },
              {
                "RollNum": 61,
                "div": "P",
                "PRN": 12211624,
                "Name": "REVANKAR VRUSHABH SUNIL",
                "username": "vrushabh.revankar22@vit.edu",
                "GroupID": "P11",
                "Role": "Students",
                "password": "12211624"
              },
              {
                "RollNum": 62,
                "div": "P",
                "PRN": 12210053,
                "Name": "REVATI JITENDRA SHIMPI",
                "username": "revati.shimpi22@vit.edu",
                "GroupID": "P11",
                "Role": "Students",
                "password": "12210053"
              },
              {
                "RollNum": 63,
                "div": "P",
                "PRN": 12211370,
                "Name": "RODE RUSHABH CHANDRASHEKHAR",
                "username": "rushabh.rode22@vit.edu",
                "GroupID": "P11",
                "Role": "Students",
                "password": "12211370"
              },
              {
                "RollNum": 64,
                "div": "P",
                "PRN": 12210164,
                "Name": "ROHAM SIMRAN PRABHAKAR",
                "username": "simran.roham22@vit.edu",
                "GroupID": "P11",
                "Role": "Students",
                "password": "12210164"
              },
              {
                "RollNum": 65,
                "div": "P",
                "PRN": 12211622,
                "Name": "ROHAN RAJKUMAR SONJI",
                "username": "rohan.rajkumar22@vit.edu",
                "GroupID": "P12",
                "Role": "Students",
                "password": "12211622"
              },
              {
                "RollNum": 66,
                "div": "P",
                "PRN": 12211652,
                "Name": "ROHIT RAJENDRA DHAGE",
                "username": "rohit.dhage22@vit.edu",
                "GroupID": "P12",
                "Role": "Students",
                "password": "12211652"
              },
              {
                "RollNum": 67,
                "div": "P",
                "PRN": 12210484,
                "Name": "ROHITASHVA KUMAWAT",
                "username": "rohitashva.kumawat22@vit.edu",
                "GroupID": "P12",
                "Role": "Students",
                "password": "12210484"
              },
              {
                "RollNum": 68,
                "div": "P",
                "PRN": 12210263,
                "Name": "ROKADE MAYUR BHIVASEN",
                "username": "mayur.rokade22@vit.edu",
                "GroupID": "P12",
                "Role": "Students",
                "password": "12210263"
              },
              {
                "RollNum": 69,
                "div": "P",
                "PRN": 12211475,
                "Name": "ROKADE RAJWARDHAN JAYWANT",
                "username": "rajwardhan.rokade221@vit.edu",
                "GroupID": "P12",
                "Role": "Students",
                "password": "12211475"
              },
              {
                "RollNum": 1,
                "div": "Q",
                "PRN": 12211369,
                "Name": "RUDRABHISHEK CHOUDHURY",
                "username": "choudhury.rudrabhishek22@vit.edu",
                "GroupID": "Q01",
                "Role": "Students",
                "password": "12211369"
              },
              {
                "RollNum": 2,
                "div": "Q",
                "PRN": 12211663,
                "Name": "RUIKAR SHREYAS SHRIVALLABH",
                "username": "shreyas.ruikar22@vit.edu",
                "GroupID": "Q01",
                "Role": "Students",
                "password": "12211663"
              },
              {
                "RollNum": 3,
                "div": "Q",
                "PRN": 12211176,
                "Name": "RUSHI GAJANAN MAHAMUNE",
                "username": "rushi.mahamune22@vit.edu",
                "GroupID": "Q01",
                "Role": "Students",
                "password": "12211176"
              },
              {
                "RollNum": 4,
                "div": "Q",
                "PRN": 12210567,
                "Name": "SABALE VAISHNAVI KESHAV",
                "username": "vaishnavi.sabale22@vit.edu",
                "GroupID": "Q01",
                "Role": "Students",
                "password": "12210567"
              },
              {
                "RollNum": 5,
                "div": "Q",
                "PRN": 12210577,
                "Name": "SABNIS SIDDHESH NAGESH",
                "username": "siddhesh.sabnis22@vit.edu",
                "GroupID": "Q01",
                "Role": "Students",
                "password": "12210577"
              },
              {
                "RollNum": 6,
                "div": "Q",
                "PRN": 12210001,
                "Name": "SACHI CHAKRABARTI",
                "username": "sachi.chakrabarti22@vit.edu",
                "GroupID": "Q01",
                "Role": "Students",
                "password": "12210001"
              },
              {
                "RollNum": 7,
                "div": "Q",
                "PRN": 12210639,
                "Name": "SADAKE SIDDHARTH VIKAS",
                "username": "siddharth.sadake22@vit.edu",
                "GroupID": "Q02",
                "Role": "Students",
                "password": "12210639"
              },
              {
                "RollNum": 8,
                "div": "Q",
                "PRN": 12210149,
                "Name": "SADAVARE ADITI SANTOSH",
                "username": "aditi.sadavare22@vit.edu",
                "GroupID": "Q02",
                "Role": "Students",
                "password": "12210149"
              },
              {
                "RollNum": 9,
                "div": "Q",
                "PRN": 12211227,
                "Name": "SAHANI PRINCE GANGARAM",
                "username": "prince.sahani22@vit.edu",
                "GroupID": "Q02",
                "Role": "Students",
                "password": "12211227"
              },
              {
                "RollNum": 10,
                "div": "Q",
                "PRN": 12211697,
                "Name": "SAHASRABUDDHE PRANAV SWAPNIL",
                "username": "pranav.sahasrabuddhe221@vit.edu",
                "GroupID": "Q02",
                "Role": "Students",
                "password": "12211697"
              },
              {
                "RollNum": 11,
                "div": "Q",
                "PRN": 12210192,
                "Name": "SAHIL KUMAR",
                "username": "kumar.sahil22@vit.edu",
                "GroupID": "Q02",
                "Role": "Students",
                "password": "12210192"
              },
              {
                "RollNum": 12,
                "div": "Q",
                "PRN": 12211780,
                "Name": "SAHNEY DILPREET SINGH AVNEETSINGH",
                "username": "dilpreet.sahney22@vit.edu",
                "GroupID": "Q02",
                "Role": "Students",
                "password": "12211780"
              },
              {
                "RollNum": 13,
                "div": "Q",
                "PRN": 12211229,
                "Name": "KHAN SAIF SALIM",
                "username": "salim.saif22@vit.edu",
                "GroupID": "Q03",
                "Role": "Students",
                "password": "12211229"
              },
              {
                "RollNum": 14,
                "div": "Q",
                "PRN": 12210392,
                "Name": "SAKHARE ADITYA ANUPKUMAR",
                "username": "aditya.sakhare22@vit.edu",
                "GroupID": "Q03",
                "Role": "Students",
                "password": "12210392"
              },
              {
                "RollNum": 15,
                "div": "Q",
                "PRN": 12210529,
                "Name": "SAKHARE RUSHIKESH SATYNARAYAN",
                "username": "rushikesh.sakhare22@vit.edu",
                "GroupID": "Q03",
                "Role": "Students",
                "password": "12210529"
              },
              {
                "RollNum": 16,
                "div": "Q",
                "PRN": 12210791,
                "Name": "SAKPAL RAHUL AVINASH",
                "username": "rahul.sakpal22@vit.edu",
                "GroupID": "Q03",
                "Role": "Students",
                "password": "12210791"
              },
              {
                "RollNum": 17,
                "div": "Q",
                "PRN": 12211031,
                "Name": "SALOKHE PRATHAMESH SHIVAJI",
                "username": "prathamesh.salokhe22@vit.edu",
                "GroupID": "Q03",
                "Role": "Students",
                "password": "12211031"
              },
              {
                "RollNum": 18,
                "div": "Q",
                "PRN": 12210727,
                "Name": "SALUNKE SAKSHI DAYANAND",
                "username": "sakshi.salunke22@vit.edu",
                "GroupID": "Q03",
                "Role": "Students",
                "password": "12210727"
              },
              {
                "RollNum": 19,
                "div": "Q",
                "PRN": 12211290,
                "Name": "SALUNKHE AMEYA SHASHIKANT",
                "username": "ameya.salunkhe221@vit.edu",
                "GroupID": "Q04",
                "Role": "Students",
                "password": "12211290"
              },
              {
                "RollNum": 20,
                "div": "Q",
                "PRN": 12210161,
                "Name": "SALUNKHE ATHARVA SHANKAR",
                "username": "atharva.salunkhe22@vit.edu",
                "GroupID": "Q04",
                "Role": "Students",
                "password": "12210161"
              },
              {
                "RollNum": 21,
                "div": "Q",
                "PRN": 12210261,
                "Name": "SALVE ABHINAV HANUMANT",
                "username": "abhinav.salve22@vit.edu",
                "GroupID": "Q04",
                "Role": "Students",
                "password": "12210261"
              },
              {
                "RollNum": 22,
                "div": "Q",
                "PRN": 12210219,
                "Name": "SALVE SHRAVASTI SATYAWAN",
                "username": "shravasti.salve22@vit.edu",
                "GroupID": "Q04",
                "Role": "Students",
                "password": "12210219"
              },
              {
                "RollNum": 23,
                "div": "Q",
                "PRN": 12210821,
                "Name": "SALVI SAAKSHI DINESH",
                "username": "saakshi.salvi22@vit.edu",
                "GroupID": "Q04",
                "Role": "Students",
                "password": "12210821"
              },
              {
                "RollNum": 24,
                "div": "Q",
                "PRN": 12210216,
                "Name": "SAMARGADE ADITI RAJKUMAR",
                "username": "aditi.samargade22@vit.edu",
                "GroupID": "Q05",
                "Role": "Students",
                "password": "12210216"
              },
              {
                "RollNum": 25,
                "div": "Q",
                "PRN": 12210212,
                "Name": "SAMARTH AMOL ANUSE",
                "username": "samarth.anuse22@vit.edu",
                "GroupID": "Q05",
                "Role": "Students",
                "password": "12210212"
              },
              {
                "RollNum": 26,
                "div": "Q",
                "PRN": 12210189,
                "Name": "SAMARVEER SUSHANT MORAY",
                "username": "samarveer.moray22@vit.edu",
                "GroupID": "Q05",
                "Role": "Students",
                "password": "12210189"
              },
              {
                "RollNum": 27,
                "div": "Q",
                "PRN": 12211345,
                "Name": "SANAP ROHAN NIVRUTTI",
                "username": "rohan.sanap22@vit.edu",
                "GroupID": "Q05",
                "Role": "Students",
                "password": "12211345"
              },
              {
                "RollNum": 28,
                "div": "Q",
                "PRN": 12211121,
                "Name": "SANAP SHIVAM CHANDRAKANT",
                "username": "shivam.sanap22@vit.edu",
                "GroupID": "Q05",
                "Role": "Students",
                "password": "12211121"
              },
              {
                "RollNum": 29,
                "div": "Q",
                "PRN": 12211796,
                "Name": "SANDEEP VISHWANATH JADHAV",
                "username": "sandeep.jadhav22@vit.edu",
                "GroupID": "Q05",
                "Role": "Students",
                "password": "12211796"
              },
              {
                "RollNum": 30,
                "div": "Q",
                "PRN": 12210695,
                "Name": "SANDESH SANTOSH KADAM",
                "username": "sandesh.kadam22@vit.edu",
                "GroupID": "Q06",
                "Role": "Students",
                "password": "12210695"
              },
              {
                "RollNum": 31,
                "div": "Q",
                "PRN": 12211805,
                "Name": "GARGI ASHOK SANDEY",
                "username": "gargi.sandey221@vit.edu",
                "GroupID": "Q06",
                "Role": "Students",
                "password": "12211805"
              },
              {
                "RollNum": 32,
                "div": "Q",
                "PRN": 12211802,
                "Name": "SANGAR RAJVARDHANNAVINCHANDRA",
                "username": "rajvardhannavinchandra.sangar22@vit.edu",
                "GroupID": "Q06",
                "Role": "Students",
                "password": "12211802"
              },
              {
                "RollNum": 33,
                "div": "Q",
                "PRN": 12211710,
                "Name": "SANGHAVI VARUN AMOL",
                "username": "varun.sanghavi221@vit.edu",
                "GroupID": "Q06",
                "Role": "Students",
                "password": "12211710"
              },
              {
                "RollNum": 34,
                "div": "Q",
                "PRN": 12211585,
                "Name": "SANGHVI MOKSH KISHORE",
                "username": "moksh.sanghvi22@vit.edu",
                "GroupID": "Q06",
                "Role": "Students",
                "password": "12211585"
              },
              {
                "RollNum": 35,
                "div": "Q",
                "PRN": 12210687,
                "Name": "SANGODE NILAY VISHWAKANT",
                "username": "nilay.sangode22@vit.edu",
                "GroupID": "Q06",
                "Role": "Students",
                "password": "12210687"
              },
              {
                "RollNum": 36,
                "div": "Q",
                "PRN": 12211678,
                "Name": "SANGWAI SIDDHI SHRIDHAR",
                "username": "siddhi.sangwai223@vit.edu",
                "GroupID": "Q07",
                "Role": "Students",
                "password": "12211678"
              },
              {
                "RollNum": 37,
                "div": "Q",
                "PRN": 12211700,
                "Name": "SANIYA ATUL BHATTAD",
                "username": "saniya.bhattad22@vit.edu",
                "GroupID": "Q07",
                "Role": "Students",
                "password": "12211700"
              },
              {
                "RollNum": 38,
                "div": "Q",
                "PRN": 12211577,
                "Name": "SANKET SAMADHAN PALKAR",
                "username": "sanket.palkar221@vit.edu",
                "GroupID": "Q07",
                "Role": "Students",
                "password": "12211577"
              },
              {
                "RollNum": 39,
                "div": "Q",
                "PRN": 12211777,
                "Name": "SAPATE ANUSHRI ASHWINIKUMAR",
                "username": "anushri.sapate221@vit.edu",
                "GroupID": "Q07",
                "Role": "Students",
                "password": "12211777"
              },
              {
                "RollNum": 40,
                "div": "Q",
                "PRN": 12210930,
                "Name": "SAPATE RUTA DURVAS",
                "username": "ruta.sapate22@vit.edu",
                "GroupID": "Q07",
                "Role": "Students",
                "password": "12210930"
              },
              {
                "RollNum": 41,
                "div": "Q",
                "PRN": 12211009,
                "Name": "SASWADE SHRUTI PRAMOD",
                "username": "shruti.saswade22@vit.edu",
                "GroupID": "Q07",
                "Role": "Students",
                "password": "12211009"
              },
              {
                "RollNum": 42,
                "div": "Q",
                "PRN": 12210477,
                "Name": "SATHE KEDAR BALAJI",
                "username": "kedar.sathe22@vit.edu",
                "GroupID": "Q08",
                "Role": "Students",
                "password": "12210477"
              },
              {
                "RollNum": 43,
                "div": "Q",
                "PRN": 12211044,
                "Name": "SATTE SRUSHTI CHANDRASHEKHAR",
                "username": "srushti.satte22@vit.edu",
                "GroupID": "Q08",
                "Role": "Students",
                "password": "12211044"
              },
              {
                "RollNum": 44,
                "div": "Q",
                "PRN": 12211755,
                "Name": "SAVANE SANKALP SUNIL",
                "username": "sankalp.savane221@vit.edu",
                "GroupID": "Q08",
                "Role": "Students",
                "password": "12211755"
              },
              {
                "RollNum": 45,
                "div": "Q",
                "PRN": 12210812,
                "Name": "SAVVY SUNIL GAIKWAD",
                "username": "sunil.savvy22@vit.edu",
                "GroupID": "Q08",
                "Role": "Students",
                "password": "12210812"
              },
              {
                "RollNum": 46,
                "div": "Q",
                "PRN": 12211166,
                "Name": "SAWANE AARYA SHRIPAD",
                "username": "aarya.sawane22@vit.edu",
                "GroupID": "Q08",
                "Role": "Students",
                "password": "12211166"
              },
              {
                "RollNum": 47,
                "div": "Q",
                "PRN": 12211626,
                "Name": "SAWANT SUYASH SUBODH",
                "username": "suyash.sawant22@vit.edu",
                "GroupID": "Q09",
                "Role": "Students",
                "password": "12211626"
              },
              {
                "RollNum": 48,
                "div": "Q",
                "PRN": 12211117,
                "Name": "RITIK ARVIND SAYAM",
                "username": "ritik.sayam22@vit.edu",
                "GroupID": "Q09",
                "Role": "Students",
                "password": "12211117"
              },
              {
                "RollNum": 49,
                "div": "Q",
                "PRN": 12211586,
                "Name": "SHAH MARMIK BRIJESH",
                "username": "marmik.shah22@vit.edu",
                "GroupID": "Q09",
                "Role": "Students",
                "password": "12211586"
              },
              {
                "RollNum": 50,
                "div": "Q",
                "PRN": 12211783,
                "Name": "SHAH TASMAY TUSHARKUMAR",
                "username": "tasmay.shah22@vit.edu",
                "GroupID": "Q09",
                "Role": "Students",
                "password": "12211783"
              },
              {
                "RollNum": 51,
                "div": "Q",
                "PRN": 12211234,
                "Name": "SHAHARI SAGAR HARISH",
                "username": "sagar.shahari221@vit.edu",
                "GroupID": "Q09",
                "Role": "Students",
                "password": "12211234"
              },
              {
                "RollNum": 52,
                "div": "Q",
                "PRN": 12210479,
                "Name": "SHAIKH AADILNAWAZ PARVEZ",
                "username": "aadilnawaz.shaikh22@vit.edu",
                "GroupID": "Q09",
                "Role": "Students",
                "password": "12210479"
              },
              {
                "RollNum": 53,
                "div": "Q",
                "PRN": 12210467,
                "Name": "SHAIKH IFRA NAEEM",
                "username": "ifra.shaikh22@vit.edu",
                "GroupID": "Q10",
                "Role": "Students",
                "password": "12210467"
              },
              {
                "RollNum": 54,
                "div": "Q",
                "PRN": 12211785,
                "Name": "SHAIKH IRAM IMTIYAJ",
                "username": "iram.shaikh22@vit.edu",
                "GroupID": "Q10",
                "Role": "Students",
                "password": "12211785"
              },
              {
                "RollNum": 55,
                "div": "Q",
                "PRN": 12211056,
                "Name": "SHAIKH MOHAMMAD AYAZ",
                "username": "mohammad.shaikh22@vit.edu",
                "GroupID": "Q10",
                "Role": "Students",
                "password": "12211056"
              },
              {
                "RollNum": 56,
                "div": "Q",
                "PRN": 12211575,
                "Name": "SHAIKH NOMAAN SHAIKH AZEEM",
                "username": "nomaan.shaikh22@vit.edu",
                "GroupID": "Q10",
                "Role": "Students",
                "password": "12211575"
              },
              {
                "RollNum": 57,
                "div": "Q",
                "PRN": 12211516,
                "Name": "SHAIKH UMAIR JUNAID",
                "username": "umair.shaikh22@vit.edu",
                "GroupID": "Q10",
                "Role": "Students",
                "password": "12211516"
              },
              {
                "RollNum": 58,
                "div": "Q",
                "PRN": 12210378,
                "Name": "SHANKHAPAL ABHAY SHYAM",
                "username": "abhay.shankhapal22@vit.edu",
                "GroupID": "Q10",
                "Role": "Students",
                "password": "12210378"
              },
              {
                "RollNum": 59,
                "div": "Q",
                "PRN": 12210917,
                "Name": "SHASHANK DAGA",
                "username": "daga.shashank22@vit.edu",
                "GroupID": "Q11",
                "Role": "Students",
                "password": "12210917"
              },
              {
                "RollNum": 60,
                "div": "Q",
                "PRN": 12210184,
                "Name": "SHEJAL KSHITIJA SANJAY",
                "username": "kshitija.shejal22@vit.edu",
                "GroupID": "Q11",
                "Role": "Students",
                "password": "12210184"
              },
              {
                "RollNum": 61,
                "div": "Q",
                "PRN": 12210456,
                "Name": "SHEJOLE VIVEK RAJENDRA",
                "username": "vivek.shejole22@vit.edu",
                "GroupID": "Q11",
                "Role": "Students",
                "password": "12210456"
              },
              {
                "RollNum": 62,
                "div": "Q",
                "PRN": 12210005,
                "Name": "SHELAR ANISH SANTOSH",
                "username": "anish.shelar22@vit.edu",
                "GroupID": "Q11",
                "Role": "Students",
                "password": "12210005"
              },
              {
                "RollNum": 63,
                "div": "Q",
                "PRN": 12210292,
                "Name": "SHELARE PRASHIK PRAMOD",
                "username": "prashik.shelare22@vit.edu",
                "GroupID": "Q11",
                "Role": "Students",
                "password": "12210292"
              },
              {
                "RollNum": 64,
                "div": "Q",
                "PRN": 12210554,
                "Name": "SHELKE DIVYA RAMESH",
                "username": "divya.shelke22@vit.edu",
                "GroupID": "Q11",
                "Role": "Students",
                "password": "12210554"
              },
              {
                "RollNum": 65,
                "div": "Q",
                "PRN": 12211024,
                "Name": "SHENDE RIDDHI SHRIDHAR",
                "username": "riddhi.shende22@vit.edu",
                "GroupID": "Q12",
                "Role": "Students",
                "password": "12211024"
              },
              {
                "RollNum": 66,
                "div": "Q",
                "PRN": 12211690,
                "Name": "SHENDGE UNNATI SUNIL",
                "username": "unnati.shendge221@vit.edu",
                "GroupID": "Q12",
                "Role": "Students",
                "password": "12211690"
              },
              {
                "RollNum": 67,
                "div": "Q",
                "PRN": 12211594,
                "Name": "SHERGARDWALA QUSAI ABBAS",
                "username": "qusai.shergardwala22@vit.edu",
                "GroupID": "Q12",
                "Role": "Students",
                "password": "12211594"
              },
              {
                "RollNum": 68,
                "div": "Q",
                "PRN": 12210535,
                "Name": "SHETE DEEP MARUTI",
                "username": "deep.shete22@vit.edu",
                "GroupID": "Q12",
                "Role": "Students",
                "password": "12210535"
              },
              {
                "RollNum": 69,
                "div": "Q",
                "PRN": 12210441,
                "Name": "SHEWALKAR YASH SANDIP",
                "username": "yash.shewalkar22@vit.edu",
                "GroupID": "Q12",
                "Role": "Students",
                "password": "12210441"
              },
              {
                "RollNum": 1,
                "div": "R",
                "PRN": 12211793,
                "Name": "SHILIMKAR SIDDHARTH GANESH",
                "username": "siddharth.shilimkar22@vit.edu",
                "GroupID": "R01",
                "Role": "Students",
                "password": "12211793"
              },
              {
                "RollNum": 2,
                "div": "R",
                "PRN": 12210562,
                "Name": "SHINDE MADHURI BHAIRAVNATH",
                "username": "madhuri.shinde22@vit.edu",
                "GroupID": "R01",
                "Role": "Students",
                "password": "12210562"
              },
              {
                "RollNum": 3,
                "div": "R",
                "PRN": 12211058,
                "Name": "SHINDE MOHIT BHATU",
                "username": "mohit.shinde22@vit.edu",
                "GroupID": "R01",
                "Role": "Students",
                "password": "12211058"
              },
              {
                "RollNum": 4,
                "div": "R",
                "PRN": 12210722,
                "Name": "SHINDE PRANOTI AJINATH",
                "username": "pranoti.shinde22@vit.edu",
                "GroupID": "R01",
                "Role": "Students",
                "password": "12210722"
              },
              {
                "RollNum": 5,
                "div": "R",
                "PRN": 12210306,
                "Name": "SHINDE RISHIKESH NARENDRA",
                "username": "rishikesh.shinde22@vit.edu",
                "GroupID": "R01",
                "Role": "Students",
                "password": "12210306"
              },
              {
                "RollNum": 6,
                "div": "R",
                "PRN": 12211081,
                "Name": "SHINDE SANSKRUTI DATTATRAYA",
                "username": "sanskruti.shinde22@vit.edu",
                "GroupID": "R01",
                "Role": "Students",
                "password": "12211081"
              },
              {
                "RollNum": 7,
                "div": "R",
                "PRN": 12211701,
                "Name": "SHINDE SATYAJIT SUNIL",
                "username": "satyajit.shinde22@vit.edu",
                "GroupID": "R02",
                "Role": "Students",
                "password": "12211701"
              },
              {
                "RollNum": 8,
                "div": "R",
                "PRN": 12210090,
                "Name": "SHINGANKAR PIYUSH PRAMOD",
                "username": "piyush.shingankar22@vit.edu",
                "GroupID": "R02",
                "Role": "Students",
                "password": "12210090"
              },
              {
                "RollNum": 9,
                "div": "R",
                "PRN": 12211714,
                "Name": "SHIRODE DEVANG SACHIN",
                "username": "devang.shirode22@vit.edu",
                "GroupID": "R02",
                "Role": "Students",
                "password": "12211714"
              },
              {
                "RollNum": 10,
                "div": "R",
                "PRN": 12211194,
                "Name": "SHIRSAT HARSHAL MALHARI",
                "username": "harshal.shirsat22@vit.edu",
                "GroupID": "R02",
                "Role": "Students",
                "password": "12211194"
              },
              {
                "RollNum": 11,
                "div": "R",
                "PRN": 12210896,
                "Name": "SHIRSAT YASH POPAT",
                "username": "yash.shirsat22@vit.edu",
                "GroupID": "R02",
                "Role": "Students",
                "password": "12210896"
              },
              {
                "RollNum": 12,
                "div": "R",
                "PRN": 12210196,
                "Name": "SHIVAM MATTOO",
                "username": "mattoo.shivam22@vit.edu",
                "GroupID": "R02",
                "Role": "Students",
                "password": "12210196"
              },
              {
                "RollNum": 13,
                "div": "R",
                "PRN": 12211142,
                "Name": "SHIVANKAR ISHAN VILAS",
                "username": "ishan.shivankar22@vit.edu",
                "GroupID": "R03",
                "Role": "Students",
                "password": "12211142"
              },
              {
                "RollNum": 14,
                "div": "R",
                "PRN": 12210598,
                "Name": "SHIVANSH SARASWAT",
                "username": "shivansh.saraswat22@vit.edu",
                "GroupID": "R03",
                "Role": "Students",
                "password": "12210598"
              },
              {
                "RollNum": 15,
                "div": "R",
                "PRN": 12210075,
                "Name": "SHRADDHA PATEL",
                "username": "shraddha.patel22@vit.edu",
                "GroupID": "R03",
                "Role": "Students",
                "password": "12210075"
              },
              {
                "RollNum": 16,
                "div": "R",
                "PRN": 12210799,
                "Name": "SHREY ARJUN CHOUGULE",
                "username": "arjun.shrey22@vit.edu",
                "GroupID": "R03",
                "Role": "Students",
                "password": "12210799"
              },
              {
                "RollNum": 17,
                "div": "R",
                "PRN": 12210500,
                "Name": "SHREYA SABUT",
                "username": "shreya.sabut22@vit.edu",
                "GroupID": "R03",
                "Role": "Students",
                "password": "12210500"
              },
              {
                "RollNum": 18,
                "div": "R",
                "PRN": 12211570,
                "Name": "SHREYA VILAS NALE",
                "username": "vilas.shreya22@vit.edu",
                "GroupID": "R03",
                "Role": "Students",
                "password": "12211570"
              },
              {
                "RollNum": 19,
                "div": "R",
                "PRN": 12210564,
                "Name": "SHRID VINAYAK DAGWAR",
                "username": "shrid.dagwar22@vit.edu",
                "GroupID": "R04",
                "Role": "Students",
                "password": "12210564"
              },
              {
                "RollNum": 20,
                "div": "R",
                "PRN": 12211108,
                "Name": "SHRIHARI NETAJI SURYAWANSHI",
                "username": "netaji.shrihari22@vit.edu",
                "GroupID": "R04",
                "Role": "Students",
                "password": "12211108"
              },
              {
                "RollNum": 21,
                "div": "R",
                "PRN": 12211146,
                "Name": "SHRIRAO PRACHI PRAVIN",
                "username": "prachi.shrirao22@vit.edu",
                "GroupID": "R04",
                "Role": "Students",
                "password": "12211146"
              },
              {
                "RollNum": 22,
                "div": "R",
                "PRN": 12211073,
                "Name": "SHRIVASTAV TANISHK SHAILESH",
                "username": "tanishk.shrivastav22@vit.edu",
                "GroupID": "R04",
                "Role": "Students",
                "password": "12211073"
              },
              {
                "RollNum": 23,
                "div": "R",
                "PRN": 12211319,
                "Name": "SHRIVASTAVA AANCHAL ANIL KUMAR",
                "username": "aanchal.shrivastava22@vit.edu",
                "GroupID": "R04",
                "Role": "Students",
                "password": "12211319"
              },
              {
                "RollNum": 24,
                "div": "R",
                "PRN": 12210002,
                "Name": "SHRUTI SOOD",
                "username": "shruti.sood22@vit.edu",
                "GroupID": "R05",
                "Role": "Students",
                "password": "12210002"
              },
              {
                "RollNum": 25,
                "div": "R",
                "PRN": 12210204,
                "Name": "SHUBAM VERMA",
                "username": "shubam.verma22@vit.edu",
                "GroupID": "R05",
                "Role": "Students",
                "password": "12210204"
              },
              {
                "RollNum": 26,
                "div": "R",
                "PRN": 12211473,
                "Name": "SIDANALE RIJUL VIDYASAGAR",
                "username": "rijul.sidanale221@vit.edu",
                "GroupID": "R05",
                "Role": "Students",
                "password": "12211473"
              },
              {
                "RollNum": 27,
                "div": "R",
                "PRN": 12211644,
                "Name": "SIDDHANT DATTATRAYA MAHAJAN",
                "username": "siddhant.mahajan22@vit.edu",
                "GroupID": "R05",
                "Role": "Students",
                "password": "12211644"
              },
              {
                "RollNum": 28,
                "div": "R",
                "PRN": 12210056,
                "Name": "SIDDHARTHA CHAKRABARTY",
                "username": "siddhartha.chakrabarty22@vit.edu",
                "GroupID": "R05",
                "Role": "Students",
                "password": "12210056"
              },
              {
                "RollNum": 29,
                "div": "R",
                "PRN": 12211440,
                "Name": "SIDDHESH BHARAT WAGHMARE",
                "username": "bharat.siddhesh22@vit.edu",
                "GroupID": "R05",
                "Role": "Students",
                "password": "12211440"
              },
              {
                "RollNum": 30,
                "div": "R",
                "PRN": 12211617,
                "Name": "SIDDHESH KIRAN MENGANE",
                "username": "siddhesh.mengane22@vit.edu",
                "GroupID": "R06",
                "Role": "Students",
                "password": "12211617"
              },
              {
                "RollNum": 31,
                "div": "R",
                "PRN": 12210983,
                "Name": "SIDDHIKA RAVINDRA BHAGAT",
                "username": "ravindra.siddhika22@vit.edu",
                "GroupID": "R06",
                "Role": "Students",
                "password": "12210983"
              },
              {
                "RollNum": 32,
                "div": "R",
                "PRN": 12210506,
                "Name": "SIDDIQUI FAIZANODDIN MUSHTAQODDIN",
                "username": "faizanoddin.siddiqui22@vit.edu",
                "GroupID": "R06",
                "Role": "Students",
                "password": "12210506"
              },
              {
                "RollNum": 33,
                "div": "R",
                "PRN": 12211799,
                "Name": "SINGH BIKRAMJEET JASWINDER",
                "username": "bikramjeet.singh22@vit.edu",
                "GroupID": "R06",
                "Role": "Students",
                "password": "12211799"
              },
              {
                "RollNum": 34,
                "div": "R",
                "PRN": 12211500,
                "Name": "SINGH LAKSHYA YASHPAL",
                "username": "lakshya.singh222@vit.edu",
                "GroupID": "R06",
                "Role": "Students",
                "password": "12211500"
              },
              {
                "RollNum": 35,
                "div": "R",
                "PRN": 12210163,
                "Name": "SIRSAT OMKAR PRATHVIRAJ",
                "username": "omkar.sirsat22@vit.edu",
                "GroupID": "R06",
                "Role": "Students",
                "password": "12210163"
              },
              {
                "RollNum": 36,
                "div": "R",
                "PRN": 12210205,
                "Name": "SNEHA BHAT",
                "username": "bhat.sneha22@vit.edu",
                "GroupID": "R07",
                "Role": "Students",
                "password": "12210205"
              },
              {
                "RollNum": 37,
                "div": "R",
                "PRN": 12211571,
                "Name": "SNEHA JAIN",
                "username": "sneha.jain221@vit.edu",
                "GroupID": "R07",
                "Role": "Students",
                "password": "12211571"
              },
              {
                "RollNum": 38,
                "div": "R",
                "PRN": 12211658,
                "Name": "SOHAM GARGOTE",
                "username": "balasaheb.soham221@vit.edu",
                "GroupID": "R07",
                "Role": "Students",
                "password": "12211658"
              },
              {
                "RollNum": 39,
                "div": "R",
                "PRN": 12210227,
                "Name": "SOHAM NIMALE",
                "username": "soham.nimale22@vit.edu",
                "GroupID": "R07",
                "Role": "Students",
                "password": "12210227"
              },
              {
                "RollNum": 40,
                "div": "R",
                "PRN": 12211036,
                "Name": "SOMANI TANUJ MAHESH",
                "username": "tanuj.somani22@vit.edu",
                "GroupID": "R07",
                "Role": "Students",
                "password": "12211036"
              },
              {
                "RollNum": 41,
                "div": "R",
                "PRN": 12210121,
                "Name": "SOMNATH NITIN GHADGE",
                "username": "nitin.ghadge22@vit.edu",
                "GroupID": "R07",
                "Role": "Students",
                "password": "12210121"
              },
              {
                "RollNum": 42,
                "div": "R",
                "PRN": 12211143,
                "Name": "SOMRATH BISEN",
                "username": "bisen.somrath22@vit.edu",
                "GroupID": "R08",
                "Role": "Students",
                "password": "12211143"
              },
              {
                "RollNum": 43,
                "div": "R",
                "PRN": 12210176,
                "Name": "SONAR KRISHNA PRAMOD",
                "username": "krishna.sonar22@vit.edu",
                "GroupID": "R08",
                "Role": "Students",
                "password": "12210176"
              },
              {
                "RollNum": 44,
                "div": "R",
                "PRN": 12210693,
                "Name": "SONAR RUSHIKESH UDAY",
                "username": "rushikesh.sonar22@vit.edu",
                "GroupID": "R08",
                "Role": "Students",
                "password": "12210693"
              },
              {
                "RollNum": 45,
                "div": "R",
                "PRN": 12210404,
                "Name": "SONAWANE PRATHMESH SANJAY",
                "username": "prathmesh.sonawane22@vit.edu",
                "GroupID": "R08",
                "Role": "Students",
                "password": "12210404"
              },
              {
                "RollNum": 46,
                "div": "R",
                "PRN": 12210247,
                "Name": "SONKUSARE SHLOK PRADEEP",
                "username": "shlok.sonkusare22@vit.edu",
                "GroupID": "R08",
                "Role": "Students",
                "password": "12210247"
              },
              {
                "RollNum": 47,
                "div": "R",
                "PRN": 12211618,
                "Name": "SRAVAN SRINIVASA RAO AVVARU",
                "username": "sravan.avvaru22@vit.edu",
                "GroupID": "R09",
                "Role": "Students",
                "password": "12211618"
              },
              {
                "RollNum": 48,
                "div": "R",
                "PRN": 12210702,
                "Name": "SUMEDH BAMBAL",
                "username": "sumedh.bambal22@vit.edu",
                "GroupID": "R09",
                "Role": "Students",
                "password": "12210702"
              },
              {
                "RollNum": 49,
                "div": "R",
                "PRN": 12210202,
                "Name": "SUMIT RAINA",
                "username": "raina.sumit22@vit.edu",
                "GroupID": "R09",
                "Role": "Students",
                "password": "12210202"
              },
              {
                "RollNum": 50,
                "div": "R",
                "PRN": 12210162,
                "Name": "SUMIT SURYAKANT NAIK",
                "username": "sumit.naik22@vit.edu",
                "GroupID": "R09",
                "Role": "Students",
                "password": "12210162"
              },
              {
                "RollNum": 51,
                "div": "R",
                "PRN": 12210210,
                "Name": "SURABHI GUPTA",
                "username": "surabhi.gupta22@vit.edu",
                "GroupID": "R09",
                "Role": "Students",
                "password": "12210210"
              },
              {
                "RollNum": 52,
                "div": "R",
                "PRN": 12210761,
                "Name": "SURAJ HARIHARASUBRAMANIAN",
                "username": "suraj.hariharasubramanian22@vit.edu",
                "GroupID": "R09",
                "Role": "Students",
                "password": "12210761"
              },
              {
                "RollNum": 53,
                "div": "R",
                "PRN": 12210699,
                "Name": "SURAJ SHRIKRISHNA CHAVAN",
                "username": "shrikrishna.suraj22@vit.edu",
                "GroupID": "R10",
                "Role": "Students",
                "password": "12210699"
              },
              {
                "RollNum": 54,
                "div": "R",
                "PRN": 12211634,
                "Name": "SURDAS SOHAM PANKAJ",
                "username": "soham.surdas22@vit.edu",
                "GroupID": "R10",
                "Role": "Students",
                "password": "12211634"
              },
              {
                "RollNum": 55,
                "div": "R",
                "PRN": 12211732,
                "Name": "SURVE OMKAR DNYANESHWAR",
                "username": "omkar.surve22@vit.edu",
                "GroupID": "R10",
                "Role": "Students",
                "password": "12211732"
              },
              {
                "RollNum": 56,
                "div": "R",
                "PRN": 12210955,
                "Name": "SURWASE NIKITA TUKARAM",
                "username": "nikita.surwase22@vit.edu",
                "GroupID": "R10",
                "Role": "Students",
                "password": "12210955"
              },
              {
                "RollNum": 57,
                "div": "R",
                "PRN": 12211095,
                "Name": "SURYAWANSHI ADITYA DEEPAK",
                "username": "aditya.suryawanshi22@vit.edu",
                "GroupID": "R10",
                "Role": "Students",
                "password": "12211095"
              },
              {
                "RollNum": 58,
                "div": "R",
                "PRN": 12210892,
                "Name": "SURYAWANSHI OM VISHAL",
                "username": "om.suryawanshi22@vit.edu",
                "GroupID": "R10",
                "Role": "Students",
                "password": "12210892"
              },
              {
                "RollNum": 59,
                "div": "R",
                "PRN": 12210999,
                "Name": "SURYAWANSHI SHRADDHA GANGADHAR",
                "username": "shraddha.suryawanshi22@vit.edu",
                "GroupID": "R11",
                "Role": "Students",
                "password": "12210999"
              },
              {
                "RollNum": 60,
                "div": "R",
                "PRN": 12210781,
                "Name": "SUSHMIT RAJESH JIVTODE",
                "username": "rajesh.sushmit22@vit.edu",
                "GroupID": "R11",
                "Role": "Students",
                "password": "12210781"
              },
              {
                "RollNum": 61,
                "div": "R",
                "PRN": 12211450,
                "Name": "sushrut parashar",
                "username": "sanjay.sushrut22@vit.edu",
                "GroupID": "R11",
                "Role": "Students",
                "password": "12211450"
              },
              {
                "RollNum": 62,
                "div": "R",
                "PRN": 12211660,
                "Name": "SUTAR VEDANT VIJAY",
                "username": "vedant.sutar221@vit.edu",
                "GroupID": "R11",
                "Role": "Students",
                "password": "12211660"
              },
              {
                "RollNum": 63,
                "div": "R",
                "PRN": 12211545,
                "Name": "SUTAWANE ANIRUDDHA PARIMAL",
                "username": "aniruddha.sutawane22@vit.edu",
                "GroupID": "R11",
                "Role": "Students",
                "password": "12211545"
              },
              {
                "RollNum": 64,
                "div": "R",
                "PRN": 12211581,
                "Name": "SUTRAVE ROHIT GANESH",
                "username": "rohit.sutrave22@vit.edu",
                "GroupID": "R11",
                "Role": "Students",
                "password": "12211581"
              },
              {
                "RollNum": 65,
                "div": "R",
                "PRN": 12211619,
                "Name": "SWAN SIDDHANT VINIT",
                "username": "siddhant.swan22@vit.edu",
                "GroupID": "R12",
                "Role": "Students",
                "password": "12211619"
              },
              {
                "RollNum": 66,
                "div": "R",
                "PRN": 12210051,
                "Name": "SWAROOP DINESH DIWAN",
                "username": "dinesh.swaroop22@vit.edu",
                "GroupID": "R12",
                "Role": "Students",
                "password": "12210051"
              },
              {
                "RollNum": 67,
                "div": "R",
                "PRN": 12211778,
                "Name": "TADKASE ANUJ SATISH",
                "username": "anuj.tadkase221@vit.edu",
                "GroupID": "R12",
                "Role": "Students",
                "password": "12211778"
              },
              {
                "RollNum": 68,
                "div": "R",
                "PRN": 12210599,
                "Name": "TAJMOHAMMED KHALED MATEEN SHAFAT",
                "username": "khaled.tajmohammed22@vit.edu",
                "GroupID": "R12",
                "Role": "Students",
                "password": "12210599"
              },
              {
                "RollNum": 69,
                "div": "R",
                "PRN": 12211611,
                "Name": "TAKALE KHADYOT SUNIL",
                "username": "khadyot.takale221@vit.edu",
                "GroupID": "R12",
                "Role": "Students",
                "password": "12211611"
              },
              {
                "RollNum": 1,
                "div": "S",
                "PRN": 12211522,
                "Name": "TAMBE ROHAN BAPPA",
                "username": "rohan.tambe22@vit.edu",
                "GroupID": "S01",
                "Role": "Students",
                "password": "12211522"
              },
              {
                "RollNum": 2,
                "div": "S",
                "PRN": 12211569,
                "Name": "TAMBE SHRAVANI MANIK",
                "username": "shravani.tambe221@vit.edu",
                "GroupID": "S01",
                "Role": "Students",
                "password": "12211569"
              },
              {
                "RollNum": 3,
                "div": "S",
                "PRN": 12211643,
                "Name": "TAMBE SHUBHAM RAJENDRA",
                "username": "shubham.tambe22@vit.edu",
                "GroupID": "S01",
                "Role": "Students",
                "password": "12211643"
              },
              {
                "RollNum": 4,
                "div": "S",
                "PRN": 12210545,
                "Name": "TAMBOLI AAYAN SHABBIR",
                "username": "aayan.tamboli22@vit.edu",
                "GroupID": "S01",
                "Role": "Students",
                "password": "12210545"
              },
              {
                "RollNum": 5,
                "div": "S",
                "PRN": 12211418,
                "Name": "TAMBOLI NAUMAN JAKIR",
                "username": "nauman.tamboli221@vit.edu",
                "GroupID": "S01",
                "Role": "Students",
                "password": "12211418"
              },
              {
                "RollNum": 6,
                "div": "S",
                "PRN": 12210527,
                "Name": "TAMHANE PRESHIT ABHIJIT",
                "username": "preshit.tamhane22@vit.edu",
                "GroupID": "S01",
                "Role": "Students",
                "password": "12210527"
              },
              {
                "RollNum": 7,
                "div": "S",
                "PRN": 12210419,
                "Name": "TAMKHANE DHANSHREE SUDAM",
                "username": "dhanshree.tamkhane22@vit.edu",
                "GroupID": "S02",
                "Role": "Students",
                "password": "12210419"
              },
              {
                "RollNum": 8,
                "div": "S",
                "PRN": 12211653,
                "Name": "TANISHKA TUSHAR PIMPLE",
                "username": "tanishka.pimple22@vit.edu",
                "GroupID": "S02",
                "Role": "Students",
                "password": "12211653"
              },
              {
                "RollNum": 9,
                "div": "S",
                "PRN": 12210091,
                "Name": "TANMAY NANDKISHOR WALKE",
                "username": "tanmay.walke22@vit.edu",
                "GroupID": "S02",
                "Role": "Students",
                "password": "12210091"
              },
              {
                "RollNum": 10,
                "div": "S",
                "PRN": 12211495,
                "Name": "TANMAY YADAV",
                "username": "tanmay.yadav22@vit.edu",
                "GroupID": "S02",
                "Role": "Students",
                "password": "12211495"
              },
              {
                "RollNum": 11,
                "div": "S",
                "PRN": 12210422,
                "Name": "TANUSHREE KANADE",
                "username": "kanade.tanushree22@vit.edu",
                "GroupID": "S02",
                "Role": "Students",
                "password": "12210422"
              },
              {
                "RollNum": 12,
                "div": "S",
                "PRN": 12210918,
                "Name": "TANVI VITTHAL WALTHARE",
                "username": "vitthal.tanvi22@vit.edu",
                "GroupID": "S02",
                "Role": "Students",
                "password": "12210918"
              },
              {
                "RollNum": 13,
                "div": "S",
                "PRN": 12210767,
                "Name": "TAPADIA RAJEEV HARISH",
                "username": "rajeev.tapadia22@vit.edu",
                "GroupID": "S03",
                "Role": "Students",
                "password": "12210767"
              },
              {
                "RollNum": 14,
                "div": "S",
                "PRN": 12210061,
                "Name": "TARADE SHREYA CHINDHARAM",
                "username": "shreya.tarade22@vit.edu",
                "GroupID": "S03",
                "Role": "Students",
                "password": "12210061"
              },
              {
                "RollNum": 15,
                "div": "S",
                "PRN": 12210289,
                "Name": "TARE TANMAY PRAKASH",
                "username": "tanmay.tare22@vit.edu",
                "GroupID": "S03",
                "Role": "Students",
                "password": "12210289"
              },
              {
                "RollNum": 16,
                "div": "S",
                "PRN": 12211380,
                "Name": "TAYDE PRANAV SUNIL",
                "username": "pranav.tayde22@vit.edu",
                "GroupID": "S03",
                "Role": "Students",
                "password": "12211380"
              },
              {
                "RollNum": 17,
                "div": "S",
                "PRN": 12210819,
                "Name": "TAYDE SHUBHAM KADUBA",
                "username": "shubham.tayde22@vit.edu",
                "GroupID": "S03",
                "Role": "Students",
                "password": "12210819"
              },
              {
                "RollNum": 18,
                "div": "S",
                "PRN": 12210010,
                "Name": "TEJAS RAJENDRA PHALKE",
                "username": "tejas.phalke22@vit.edu",
                "GroupID": "S03",
                "Role": "Students",
                "password": "12210010"
              },
              {
                "RollNum": 19,
                "div": "S",
                "PRN": 12210268,
                "Name": "TEJAS RAJKUMAR WASEKAR",
                "username": "rajkumar.tejas22@vit.edu",
                "GroupID": "S04",
                "Role": "Students",
                "password": "12210268"
              },
              {
                "RollNum": 20,
                "div": "S",
                "PRN": 12211587,
                "Name": "TEJAS SANTOSH HIRVE",
                "username": "tejas.hirve22@vit.edu",
                "GroupID": "S04",
                "Role": "Students",
                "password": "12211587"
              },
              {
                "RollNum": 21,
                "div": "S",
                "PRN": 12211471,
                "Name": "TEJAS SHRIRAM SARADE",
                "username": "shriram.tejas22@vit.edu",
                "GroupID": "S04",
                "Role": "Students",
                "password": "12211471"
              },
              {
                "RollNum": 22,
                "div": "S",
                "PRN": 12211276,
                "Name": "TEJAS WARBHE",
                "username": "warbhe.tejas22@vit.edu",
                "GroupID": "S04",
                "Role": "Students",
                "password": "12211276"
              },
              {
                "RollNum": 23,
                "div": "S",
                "PRN": 12210319,
                "Name": "TEJWANI DREAM PURSHOTTAM",
                "username": "dream.tejwani22@vit.edu",
                "GroupID": "S04",
                "Role": "Students",
                "password": "12210319"
              },
              {
                "RollNum": 24,
                "div": "S",
                "PRN": 12211150,
                "Name": "TELGOTE SIDDHANT RAMESH",
                "username": "siddhant.telgote22@vit.edu",
                "GroupID": "S05",
                "Role": "Students",
                "password": "12211150"
              },
              {
                "RollNum": 25,
                "div": "S",
                "PRN": 12211470,
                "Name": "TELSANG SHREYASH SHASHIKANT",
                "username": "shreyash.telsang22@vit.edu",
                "GroupID": "S05",
                "Role": "Students",
                "password": "12211470"
              },
              {
                "RollNum": 26,
                "div": "S",
                "PRN": 12211441,
                "Name": "THAKARE MANTHAN RAJESH",
                "username": "manthan.thakare22@vit.edu",
                "GroupID": "S05",
                "Role": "Students",
                "password": "12211441"
              },
              {
                "RollNum": 27,
                "div": "S",
                "PRN": 12210913,
                "Name": "THAKRE ASHUTOSH RAJESH",
                "username": "ashutosh.thakre22@vit.edu",
                "GroupID": "S05",
                "Role": "Students",
                "password": "12210913"
              },
              {
                "RollNum": 28,
                "div": "S",
                "PRN": 12210454,
                "Name": "THAKUR NAYANA VIJAYSINGH",
                "username": "nayana.thakur22@vit.edu",
                "GroupID": "S05",
                "Role": "Students",
                "password": "12210454"
              },
              {
                "RollNum": 29,
                "div": "S",
                "PRN": 12210116,
                "Name": "THAKUR SOHAAM SUHAS",
                "username": "sohaam.thakur22@vit.edu",
                "GroupID": "S05",
                "Role": "Students",
                "password": "12210116"
              },
              {
                "RollNum": 30,
                "div": "S",
                "PRN": 12211583,
                "Name": "THENGE ANIKET DNYANESHWAR",
                "username": "aniket.thenge221@vit.edu",
                "GroupID": "S06",
                "Role": "Students",
                "password": "12211583"
              },
              {
                "RollNum": 31,
                "div": "S",
                "PRN": 12211590,
                "Name": "THIGALE OM YOGESH",
                "username": "om.thigale221@vit.edu",
                "GroupID": "S06",
                "Role": "Students",
                "password": "12211590"
              },
              {
                "RollNum": 32,
                "div": "S",
                "PRN": 12210950,
                "Name": "THOKAL VEDANT VIKAS",
                "username": "vedant.thokal22@vit.edu",
                "GroupID": "S06",
                "Role": "Students",
                "password": "12210950"
              },
              {
                "RollNum": 33,
                "div": "S",
                "PRN": 12210757,
                "Name": "THOOL ARYAN VILAS",
                "username": "aryan.thool22@vit.edu",
                "GroupID": "S06",
                "Role": "Students",
                "password": "12210757"
              },
              {
                "RollNum": 34,
                "div": "S",
                "PRN": 12211771,
                "Name": "THOPATE RANJEET TANAJI",
                "username": "ranjeet.thopate221@vit.edu",
                "GroupID": "S06",
                "Role": "Students",
                "password": "12211771"
              },
              {
                "RollNum": 35,
                "div": "S",
                "PRN": 12210379,
                "Name": "THORAT HARSHAVARDHAN SANJAY",
                "username": "harshavardhan.thorat22@vit.edu",
                "GroupID": "S06",
                "Role": "Students",
                "password": "12210379"
              },
              {
                "RollNum": 36,
                "div": "S",
                "PRN": 12211178,
                "Name": "THORAT RUSHIKESH RAMESH",
                "username": "rushikesh.thorat22@vit.edu",
                "GroupID": "S07",
                "Role": "Students",
                "password": "12211178"
              },
              {
                "RollNum": 37,
                "div": "S",
                "PRN": 12211628,
                "Name": "THORAT SHREYAS PRAKASH",
                "username": "shreyas.thorat22@vit.edu",
                "GroupID": "S07",
                "Role": "Students",
                "password": "12211628"
              },
              {
                "RollNum": 38,
                "div": "S",
                "PRN": 12210235,
                "Name": "TILAK MANAS KOUSTUBH",
                "username": "manas.tilak22@vit.edu",
                "GroupID": "S07",
                "Role": "Students",
                "password": "12210235"
              },
              {
                "RollNum": 39,
                "div": "S",
                "PRN": 12210238,
                "Name": "Tilaksingh Santoshsingh Chauhan",
                "username": "tilak.chauhan22@vit.edu",
                "GroupID": "S07",
                "Role": "Students",
                "password": "12210238"
              },
              {
                "RollNum": 40,
                "div": "S",
                "PRN": 12210335,
                "Name": "TILEKAR MANSI SHAHAJI",
                "username": "mansi.tilekar22@vit.edu",
                "GroupID": "S07",
                "Role": "Students",
                "password": "12210335"
              },
              {
                "RollNum": 41,
                "div": "S",
                "PRN": 12210561,
                "Name": "TODKAR ADITYA MAHESH",
                "username": "aditya.todkar22@vit.edu",
                "GroupID": "S07",
                "Role": "Students",
                "password": "12210561"
              },
              {
                "RollNum": 42,
                "div": "S",
                "PRN": 12211612,
                "Name": "TOHARE ABHINAV DNYANESHWAR",
                "username": "abhinav.tohare22@vit.edu",
                "GroupID": "S08",
                "Role": "Students",
                "password": "12211612"
              },
              {
                "RollNum": 43,
                "div": "S",
                "PRN": 12211539,
                "Name": "UBALE SHREENATH SANDIP",
                "username": "shreenath.ubale22@vit.edu",
                "GroupID": "S08",
                "Role": "Students",
                "password": "12211539"
              },
              {
                "RollNum": 44,
                "div": "S",
                "PRN": 12210606,
                "Name": "UDAPURE ANUJ DINESH",
                "username": "anuj.udapure22@vit.edu",
                "GroupID": "S08",
                "Role": "Students",
                "password": "12210606"
              },
              {
                "RollNum": 45,
                "div": "S",
                "PRN": 12210483,
                "Name": "UGILE PRATIK RAM",
                "username": "pratik.ugile22@vit.edu",
                "GroupID": "S08",
                "Role": "Students",
                "password": "12210483"
              },
              {
                "RollNum": 46,
                "div": "S",
                "PRN": 12211604,
                "Name": "UJALAMBKAR DNYANESH MILIND",
                "username": "dnyanesh.ujalambkar22@vit.edu",
                "GroupID": "S08",
                "Role": "Students",
                "password": "12211604"
              },
              {
                "RollNum": 47,
                "div": "S",
                "PRN": 12211507,
                "Name": "UJJWAL PATIL",
                "username": "patil.ujjwal221@vit.edu",
                "GroupID": "S09",
                "Role": "Students",
                "password": "12211507"
              },
              {
                "RollNum": 48,
                "div": "S",
                "PRN": 12211037,
                "Name": "UKEY HARSH GAJENDRA",
                "username": "harsh.ukey22@vit.edu",
                "GroupID": "S09",
                "Role": "Students",
                "password": "12211037"
              },
              {
                "RollNum": 49,
                "div": "S",
                "PRN": 12210696,
                "Name": "UMALE OM SUDHIR",
                "username": "om.umale22@vit.edu",
                "GroupID": "S09",
                "Role": "Students",
                "password": "12210696"
              },
              {
                "RollNum": 50,
                "div": "S",
                "PRN": 12210816,
                "Name": "UMARE ADITHYA ANIL",
                "username": "adithya.umare22@vit.edu",
                "GroupID": "S09",
                "Role": "Students",
                "password": "12210816"
              },
              {
                "RollNum": 51,
                "div": "S",
                "PRN": 12210486,
                "Name": "Omkar Umbarje",
                "username": "omkar.umbarje22@vit.edu",
                "GroupID": "S09",
                "Role": "Students",
                "password": "12210486"
              },
              {
                "RollNum": 52,
                "div": "S",
                "PRN": 12210921,
                "Name": "UPASE SHANKAR VENKATRAO",
                "username": "shankar.upase22@vit.edu",
                "GroupID": "S09",
                "Role": "Students",
                "password": "12210921"
              },
              {
                "RollNum": 53,
                "div": "S",
                "PRN": 12211223,
                "Name": "VAIDYA MADHUR PREETAM",
                "username": "madhur.vaidya221@vit.edu",
                "GroupID": "S10",
                "Role": "Students",
                "password": "12211223"
              },
              {
                "RollNum": 54,
                "div": "S",
                "PRN": 12210354,
                "Name": "VAISHNAVI RAMKISAN SONWANE",
                "username": "ramkisan.vaishnavi22@vit.edu",
                "GroupID": "S10",
                "Role": "Students",
                "password": "12210354"
              },
              {
                "RollNum": 55,
                "div": "S",
                "PRN": 12210137,
                "Name": "VAISHNAVI SACHIN SHIVADE",
                "username": "sachin.vaishnavi22@vit.edu",
                "GroupID": "S10",
                "Role": "Students",
                "password": "12210137"
              },
              {
                "RollNum": 56,
                "div": "S",
                "PRN": 12210465,
                "Name": "VAISHNAVI SINGH",
                "username": "vaishnavi.singh22@vit.edu",
                "GroupID": "S10",
                "Role": "Students",
                "password": "12210465"
              },
              {
                "RollNum": 57,
                "div": "S",
                "PRN": 12211339,
                "Name": "VALLABH HARESH WASULE",
                "username": "haresh.vallabh221@vit.edu",
                "GroupID": "S10",
                "Role": "Students",
                "password": "12211339"
              },
              {
                "RollNum": 58,
                "div": "S",
                "PRN": 12210195,
                "Name": "VANSH GANJOO",
                "username": "ganjoo.vansh22@vit.edu",
                "GroupID": "S10",
                "Role": "Students",
                "password": "12210195"
              },
              {
                "RollNum": 59,
                "div": "S",
                "PRN": 12211508,
                "Name": "VARAD SHIVSHANKAR GHOTE",
                "username": "varad.ghote221@vit.edu",
                "GroupID": "S11",
                "Role": "Students",
                "password": "12211508"
              },
              {
                "RollNum": 60,
                "div": "S",
                "PRN": 12211405,
                "Name": "VARTAK KEDAR SACHIN",
                "username": "kedar.vartak22@vit.edu",
                "GroupID": "S11",
                "Role": "Students",
                "password": "12211405"
              },
              {
                "RollNum": 61,
                "div": "S",
                "PRN": 12211264,
                "Name": "Varun Manish Sahu",
                "username": "manish.varun22@vit.edu",
                "GroupID": "S11",
                "Role": "Students",
                "password": "12211264"
              },
              {
                "RollNum": 62,
                "div": "S",
                "PRN": 12211668,
                "Name": "VASKAR SIDDHARTH CHANDRAKANT",
                "username": "siddharth.vaskar22@vit.edu",
                "GroupID": "S11",
                "Role": "Students",
                "password": "12211668"
              },
              {
                "RollNum": 63,
                "div": "S",
                "PRN": 12210082,
                "Name": "VASMATKAR PARIMAL SUNIL",
                "username": "parimal.vasmatkar22@vit.edu",
                "GroupID": "S11",
                "Role": "Students",
                "password": "12210082"
              },
              {
                "RollNum": 64,
                "div": "S",
                "PRN": 12210206,
                "Name": "VASU MAHAJAN",
                "username": "mahajan.vasu22@vit.edu",
                "GroupID": "S11",
                "Role": "Students",
                "password": "12210206"
              },
              {
                "RollNum": 65,
                "div": "S",
                "PRN": 12210576,
                "Name": "VASU SANJAY TUMRAM",
                "username": "vasu.tumram22@vit.edu",
                "GroupID": "S12",
                "Role": "Students",
                "password": "12210576"
              },
              {
                "RollNum": 66,
                "div": "S",
                "PRN": 12210469,
                "Name": "VED ANIL MUNDHE",
                "username": "anil.ved22@vit.edu",
                "GroupID": "S12",
                "Role": "Students",
                "password": "12210469"
              },
              {
                "RollNum": 67,
                "div": "S",
                "PRN": 12210530,
                "Name": "VED VINOD GADMADE",
                "username": "ved.gadmade22@vit.edu",
                "GroupID": "S12",
                "Role": "Students",
                "password": "12210530"
              },
              {
                "RollNum": 68,
                "div": "S",
                "PRN": 12210013,
                "Name": "VEDANGI ABHIJIT KULKARNI",
                "username": "vedangi.kulkarni22@vit.edu",
                "GroupID": "S12",
                "Role": "Students",
                "password": "12210013"
              },
              {
                "RollNum": 69,
                "div": "S",
                "PRN": 12210122,
                "Name": "VEDANT DEVIDAS RANE",
                "username": "vedant.rane221@vit.edu",
                "GroupID": "S12",
                "Role": "Students",
                "password": "12210122"
              },
              {
                "RollNum": 1,
                "div": "T",
                "PRN": 12211538,
                "Name": "VEDANT SANJAY KOTHARI",
                "username": "sanjay.vedant22@vit.edu",
                "GroupID": "T01",
                "Role": "Students",
                "password": "12211538"
              },
              {
                "RollNum": 2,
                "div": "T",
                "PRN": 12210932,
                "Name": "VERMA RUZAN PRITAMSINGH",
                "username": "ruzan.verma22@vit.edu",
                "GroupID": "T01",
                "Role": "Students",
                "password": "12210932"
              },
              {
                "RollNum": 3,
                "div": "T",
                "PRN": 12211556,
                "Name": "VHASALE PRATHMESH BABASAHEB",
                "username": "prathmesh.vhasale22@vit.edu",
                "GroupID": "T01",
                "Role": "Students",
                "password": "12211556"
              },
              {
                "RollNum": 4,
                "div": "T",
                "PRN": 12210405,
                "Name": "VIDHALE SOHAM MANISH",
                "username": "soham.vidhale22@vit.edu",
                "GroupID": "T01",
                "Role": "Students",
                "password": "12210405"
              },
              {
                "RollNum": 5,
                "div": "T",
                "PRN": 12210532,
                "Name": "VIJAY GORE",
                "username": "gore.vijay22@vit.edu",
                "GroupID": "T01",
                "Role": "Students",
                "password": "12210532"
              },
              {
                "RollNum": 6,
                "div": "T",
                "PRN": 12210194,
                "Name": "VIPRA",
                "username": "undefined.vipra22@vit.edu",
                "GroupID": "T02",
                "Role": "Students",
                "password": "12210194"
              },
              {
                "RollNum": 7,
                "div": "T",
                "PRN": 12211210,
                "Name": "Viraj Datta Mane",
                "username": "viraj.mane22@vit.edu",
                "GroupID": "T02",
                "Role": "Students",
                "password": "12211210"
              },
              {
                "RollNum": 8,
                "div": "T",
                "PRN": 12210039,
                "Name": "VIRAJ JETHLIYA",
                "username": "viraj.jethliya22@vit.edu",
                "GroupID": "T02",
                "Role": "Students",
                "password": "12210039"
              },
              {
                "RollNum": 9,
                "div": "T",
                "PRN": 12210076,
                "Name": "VIRNODKAR SANIKA SATISH",
                "username": "sanika.virnodkar22@vit.edu",
                "GroupID": "T02",
                "Role": "Students",
                "password": "12210076"
              },
              {
                "RollNum": 10,
                "div": "T",
                "PRN": 12210207,
                "Name": "VISHAL KUMAR",
                "username": "kumar.vishal22@vit.edu",
                "GroupID": "T02",
                "Role": "Students",
                "password": "12210207"
              },
              {
                "RollNum": 11,
                "div": "T",
                "PRN": 12210208,
                "Name": "VISHAL SINGH MANHAS",
                "username": "vishal.manhas22@vit.edu",
                "GroupID": "T03",
                "Role": "Students",
                "password": "12210208"
              },
              {
                "RollNum": 12,
                "div": "T",
                "PRN": 12211171,
                "Name": "Vivek Randad",
                "username": "narayanji.vivek22@vit.edu",
                "GroupID": "T03",
                "Role": "Students",
                "password": "12211171"
              },
              {
                "RollNum": 13,
                "div": "T",
                "PRN": 12210831,
                "Name": "VRUSHAL AMOL PATIL",
                "username": "vrushal.patil22@vit.edu",
                "GroupID": "T03",
                "Role": "Students",
                "password": "12210831"
              },
              {
                "RollNum": 14,
                "div": "T",
                "PRN": 12210273,
                "Name": "WADADARE SHRIKAR SATISH",
                "username": "shrikar.wadadare22@vit.edu",
                "GroupID": "T03",
                "Role": "Students",
                "password": "12210273"
              },
              {
                "RollNum": 15,
                "div": "T",
                "PRN": 12211352,
                "Name": "WADEKAR HARSH SATYAVAN",
                "username": "harsh.wadekar22@vit.edu",
                "GroupID": "T03",
                "Role": "Students",
                "password": "12211352"
              },
              {
                "RollNum": 16,
                "div": "T",
                "PRN": 12210283,
                "Name": "WAGASKAR AKANKSHA MARUTI",
                "username": "akanksha.wagaskar22@vit.edu",
                "GroupID": "T04",
                "Role": "Students",
                "password": "12210283"
              },
              {
                "RollNum": 17,
                "div": "T",
                "PRN": 12211391,
                "Name": "WAGH ATHARVA MANGESH",
                "username": "atharva.wagh22@vit.edu",
                "GroupID": "T04",
                "Role": "Students",
                "password": "12211391"
              },
              {
                "RollNum": 18,
                "div": "T",
                "PRN": 12210717,
                "Name": "WAGH PRASHIK RAJESH",
                "username": "prashik.wagh22@vit.edu",
                "GroupID": "T04",
                "Role": "Students",
                "password": "12210717"
              },
              {
                "RollNum": 19,
                "div": "T",
                "PRN": 12210231,
                "Name": "WAGH SUJIT GANESH",
                "username": "sujit.wagh22@vit.edu",
                "GroupID": "T04",
                "Role": "Students",
                "password": "12210231"
              },
              {
                "RollNum": 20,
                "div": "T",
                "PRN": 12210779,
                "Name": "WAGH TEJASVINI VIJAYKUMAR",
                "username": "tejasvini.wagh22@vit.edu",
                "GroupID": "T04",
                "Role": "Students",
                "password": "12210779"
              },
              {
                "RollNum": 21,
                "div": "T",
                "PRN": 12210218,
                "Name": "WAGHCHAURE SANDIP VISHNU",
                "username": "sandip.waghchaure22@vit.edu",
                "GroupID": "T04",
                "Role": "Students",
                "password": "12210218"
              },
              {
                "RollNum": 22,
                "div": "T",
                "PRN": 12210895,
                "Name": "WAGHMARE MAYUR MADHAVRAO",
                "username": "mayur.waghmare22@vit.edu",
                "GroupID": "T05",
                "Role": "Students",
                "password": "12210895"
              },
              {
                "RollNum": 23,
                "div": "T",
                "PRN": 12210993,
                "Name": "WAGHMODE MANSI LAXMAN",
                "username": "mansi.waghmode22@vit.edu",
                "GroupID": "T05",
                "Role": "Students",
                "password": "12210993"
              },
              {
                "RollNum": 24,
                "div": "T",
                "PRN": 12210334,
                "Name": "WAGHMODE ONKAR ANIL",
                "username": "onkar.waghmode22@vit.edu",
                "GroupID": "T05",
                "Role": "Students",
                "password": "12210334"
              },
              {
                "RollNum": 25,
                "div": "T",
                "PRN": 12210549,
                "Name": "WAGHMODE PRASHANT MADHUKAR",
                "username": "prashant.waghmode22@vit.edu",
                "GroupID": "T05",
                "Role": "Students",
                "password": "12210549"
              },
              {
                "RollNum": 26,
                "div": "T",
                "PRN": 12210873,
                "Name": "WAGHMODE SHAILESH MAHADU",
                "username": "shailesh.waghmode22@vit.edu",
                "GroupID": "T05",
                "Role": "Students",
                "password": "12210873"
              },
              {
                "RollNum": 27,
                "div": "T",
                "PRN": 12211411,
                "Name": "WAGLE MANAS RAJESH",
                "username": "manas.wagle22@vit.edu",
                "GroupID": "T06",
                "Role": "Students",
                "password": "12211411"
              },
              {
                "RollNum": 28,
                "div": "T",
                "PRN": 12210531,
                "Name": "WAKCHAURE SHRUSHTI RAJARAM",
                "username": "shrushti.wakchaure22@vit.edu",
                "GroupID": "T06",
                "Role": "Students",
                "password": "12210531"
              },
              {
                "RollNum": 29,
                "div": "T",
                "PRN": 12210440,
                "Name": "WAKODE NISHA VIJAY",
                "username": "nisha.wakode22@vit.edu",
                "GroupID": "T06",
                "Role": "Students",
                "password": "12210440"
              },
              {
                "RollNum": 30,
                "div": "T",
                "PRN": 12210035,
                "Name": "WAKODE NRUPAL NITIN",
                "username": "nrupal.wakode22@vit.edu",
                "GroupID": "T06",
                "Role": "Students",
                "password": "12210035"
              },
              {
                "RollNum": 31,
                "div": "T",
                "PRN": 12211717,
                "Name": "WALSEPATIL ADITYA DEEPAK",
                "username": "aditya.walsepatil22@vit.edu",
                "GroupID": "T06",
                "Role": "Students",
                "password": "12211717"
              },
              {
                "RollNum": 32,
                "div": "T",
                "PRN": 12211764,
                "Name": "WANI ADITYA PRADIP",
                "username": "aditya.wani22@vit.edu",
                "GroupID": "T07",
                "Role": "Students",
                "password": "12211764"
              },
              {
                "RollNum": 33,
                "div": "T",
                "PRN": 12210546,
                "Name": "WANI HIMANSHU HARISH",
                "username": "himanshu.wani22@vit.edu",
                "GroupID": "T07",
                "Role": "Students",
                "password": "12210546"
              },
              {
                "RollNum": 34,
                "div": "T",
                "PRN": 12211201,
                "Name": "WANJARI MINAL DNYANESH",
                "username": "minal.wanjari22@vit.edu",
                "GroupID": "T07",
                "Role": "Students",
                "password": "12211201"
              },
              {
                "RollNum": 35,
                "div": "T",
                "PRN": 12210468,
                "Name": "WANKHADE PRANALI DNYANESHWAR",
                "username": "pranali.wankhade22@vit.edu",
                "GroupID": "T07",
                "Role": "Students",
                "password": "12210468"
              },
              {
                "RollNum": 36,
                "div": "T",
                "PRN": 12210471,
                "Name": "WANKHADE VINAYAK DNYANESHWAR",
                "username": "vinayak.wankhade22@vit.edu",
                "GroupID": "T07",
                "Role": "Students",
                "password": "12210471"
              },
              {
                "RollNum": 37,
                "div": "T",
                "PRN": 12211112,
                "Name": "WANKHEDE ASHITOSH KISHANRAO",
                "username": "ashitosh.wankhede22@vit.edu",
                "GroupID": "T08",
                "Role": "Students",
                "password": "12211112"
              },
              {
                "RollNum": 38,
                "div": "T",
                "PRN": 12210461,
                "Name": "WARDHE PIYUSH VILAS",
                "username": "piyush.wardhe22@vit.edu",
                "GroupID": "T08",
                "Role": "Students",
                "password": "12210461"
              },
              {
                "RollNum": 39,
                "div": "T",
                "PRN": 12211386,
                "Name": "WATEGAONKAR NARAYANI SANTOSH",
                "username": "narayani.wategaonkar22@vit.edu",
                "GroupID": "T08",
                "Role": "Students",
                "password": "12211386"
              },
              {
                "RollNum": 40,
                "div": "T",
                "PRN": 12210356,
                "Name": "WATTAMWAR SHRIPAD SHRIRANGRAO",
                "username": "shripad.wattamwar22@vit.edu",
                "GroupID": "T08",
                "Role": "Students",
                "password": "12210356"
              },
              {
                "RollNum": 41,
                "div": "T",
                "PRN": 12210360,
                "Name": "WELADI PRAJWAL ANANTA",
                "username": "prajwal.weladi22@vit.edu",
                "GroupID": "T08",
                "Role": "Students",
                "password": "12210360"
              },
              {
                "RollNum": 42,
                "div": "T",
                "PRN": 12210627,
                "Name": "YADAV ABHAY SAMBHAJI",
                "username": "abhay.yadav22@vit.edu",
                "GroupID": "T08",
                "Role": "Students",
                "password": "12210627"
              },
              {
                "RollNum": 43,
                "div": "T",
                "PRN": 12211170,
                "Name": "YADAV ABHISHEK AVADESH",
                "username": "abhishek.yadav22@vit.edu",
                "GroupID": "T09",
                "Role": "Students",
                "password": "12211170"
              },
              {
                "RollNum": 44,
                "div": "T",
                "PRN": 12210563,
                "Name": "YADAV ADITYA RAHUL",
                "username": "aditya.yadav22@vit.edu",
                "GroupID": "T09",
                "Role": "Students",
                "password": "12210563"
              },
              {
                "RollNum": 45,
                "div": "T",
                "PRN": 12210302,
                "Name": "YADAV ISHAAN DHIRAJ",
                "username": "ishaan.yadav22@vit.edu",
                "GroupID": "T09",
                "Role": "Students",
                "password": "12210302"
              },
              {
                "RollNum": 46,
                "div": "T",
                "PRN": 12210596,
                "Name": "YAMKANMARDI SHRIRAJ SHRIDHAR",
                "username": "shriraj.yamkanmardi22@vit.edu",
                "GroupID": "T09",
                "Role": "Students",
                "password": "12210596"
              },
              {
                "RollNum": 47,
                "div": "T",
                "PRN": 12210416,
                "Name": "YANGALE VITTHAL RAJENDRA",
                "username": "vitthal.yangale22@vit.edu",
                "GroupID": "T09",
                "Role": "Students",
                "password": "12210416"
              },
              {
                "RollNum": 48,
                "div": "T",
                "PRN": 12210097,
                "Name": "YANPALLEWAR SHIVANI VAIJANATH",
                "username": "shivani.yanpallewar22@vit.edu",
                "GroupID": "T10",
                "Role": "Students",
                "password": "12210097"
              },
              {
                "RollNum": 49,
                "div": "T",
                "PRN": 12210096,
                "Name": "YARGOP RAHUL JAYDEEP",
                "username": "rahul.yargop22@vit.edu",
                "GroupID": "T10",
                "Role": "Students",
                "password": "12210096"
              },
              {
                "RollNum": 50,
                "div": "T",
                "PRN": 12211664,
                "Name": "YASH AJIT DUSANKAR",
                "username": "ajit.yash222@vit.edu",
                "GroupID": "T10",
                "Role": "Students",
                "password": "12211664"
              },
              {
                "RollNum": 51,
                "div": "T",
                "PRN": 12210901,
                "Name": "YASH BHAGWAN KOLEKAR",
                "username": "bhagwan.yash22@vit.edu",
                "GroupID": "T10",
                "Role": "Students",
                "password": "12210901"
              },
              {
                "RollNum": 52,
                "div": "T",
                "PRN": 12210982,
                "Name": "YASH NANDKUMAR TELKHADE",
                "username": "yash.telkhade22@vit.edu",
                "GroupID": "T10",
                "Role": "Students",
                "password": "12210982"
              },
              {
                "RollNum": 53,
                "div": "T",
                "PRN": 12211513,
                "Name": "YASH PAWDE",
                "username": "pawde.yash221@vit.edu",
                "GroupID": "T11",
                "Role": "Students",
                "password": "12211513"
              },
              {
                "RollNum": 54,
                "div": "T",
                "PRN": 12211472,
                "Name": "YASH RAKESH MAHESHWARI",
                "username": "yash.maheshwari22@vit.edu",
                "GroupID": "T11",
                "Role": "Students",
                "password": "12211472"
              },
              {
                "RollNum": 55,
                "div": "T",
                "PRN": 12210104,
                "Name": "YASHRAJ SOPAN NALAWADE",
                "username": "sopan.yashraj22@vit.edu",
                "GroupID": "T11",
                "Role": "Students",
                "password": "12210104"
              },
              {
                "RollNum": 56,
                "div": "T",
                "PRN": 12210429,
                "Name": "YATHARTH RASHMIKANT VARMA",
                "username": "yatharth.varma22@vit.edu",
                "GroupID": "T11",
                "Role": "Students",
                "password": "12210429"
              },
              {
                "RollNum": 57,
                "div": "T",
                "PRN": 12211254,
                "Name": "YAWALE SWARNIM PRAFULL",
                "username": "swarnim.yawale22@vit.edu",
                "GroupID": "T11",
                "Role": "Students",
                "password": "12211254"
              },
              {
                "RollNum": 58,
                "div": "T",
                "PRN": 12210552,
                "Name": "YUVA TEJA GOUD BANDHARAPU",
                "username": "yuvateja.bandharapu22@vit.edu",
                "GroupID": "T11",
                "Role": "Students",
                "password": "12210552"
              },
              {
                "RollNum": 59,
                "div": "T",
                "PRN": 12210270,
                "Name": "ZADE TANMAY PRAMOD",
                "username": "tanmay.zade22@vit.edu",
                "GroupID": "T12",
                "Role": "Students",
                "password": "12210270"
              },
              {
                "RollNum": 60,
                "div": "T",
                "PRN": 12211533,
                "Name": "ZANWAR GAURAV SHAILESH",
                "username": "gaurav.zanwar22@vit.edu",
                "GroupID": "T12",
                "Role": "Students",
                "password": "12211533"
              },
              {
                "RollNum": 61,
                "div": "T",
                "PRN": 12210049,
                "Name": "ZENDAGE VAIBHAV VITTHAL",
                "username": "vaibhav.zendage22@vit.edu",
                "GroupID": "T12",
                "Role": "Students",
                "password": "12210049"
              },
              {
                "RollNum": 62,
                "div": "T",
                "PRN": 12211040,
                "Name": "ZITE ADITYA GORAKH",
                "username": "aditya.zite22@vit.edu",
                "GroupID": "T12",
                "Role": "Students",
                "password": "12211040"
              },
              {
                "RollNum": 63,
                "div": "T",
                "PRN": 12210144,
                "Name": "ZOMBADE ROHAN BHAGWAT",
                "username": "rohan.zombade22@vit.edu",
                "GroupID": "T12",
                "Role": "Students",
                "password": "12210144"
              },
              {
                "RollNum": 64,
                "div": "T",
                "PRN": 12110749,
                "Name": "MASKE HARSH VAIJANATH",
                "username": "harsh.maske21@vit.edu",
                "GroupID": "T12",
                "Role": "Students",
                "password": "12110749"
              }
            
          
           
            
            ]
           // isme data daal de
        
        udata.forEach( async element => {
          User.register(new User({username: element.username}), element.password, function(err, user){
            if(err) {
             return res.status(500).json({err:err});
            }
            if(element.Name){
             user.Name = element.Name;
            }
            if (element.PRN) {
             user.PRN = element.PRN;
            }
            if (element.div) {
              user.div = element.div;
            }
            if (element.GroupID) {
              user.GroupID = element.GroupID;
            }

            if (element.RollNum) {
              user.RollNum = element.RollNum;
            }

            if (element.Role){
              user.Role = element.Role;
            }
            user.save(function(err, user){
             passport.authenticate('local')(req, res, function(){
              return res.redirect("/login");
             });
            });
            });
        })

        res.send("saved")
    } catch (error) {
        console.log(error)
        res.send(error)
    }
  }

  

  

  /*****************End Individual Project Page********************************* */

//   async function insertDymmyGroupData(){
//        try {
//            await Group.insertMany(
//             [{
//                     "GroupID": "A01",
//                     "leader": 12010711,
//                     "Members": [12010715, 12010719 , 12010734 , 12010740 , 12010745],
//                 },

//                 {
//                   "GroupID": "A02",
//                   "leader": 12010760,
//                   "Members": [12010708, 12010706 , 12010703, 12010701 , 12010702],
//               },

//               {
//                 "GroupID": "A05",
//                 "leader": 12010767,
//                 "Members": [12010752, 12010754 , 12010756 , 12010759 , 12010755],
//             },

//             {
//               "GroupID": "A01",
//               "leader": 12010787,
//               "Members": [12010760, 12010735 , 12010736 , 12010766 , 12010764],
//           },
                
//             ]);
//        } catch (error) {
//           console.log('err' , + error) 
//        } 
//     }

// insertDymmyGroupData()
    

module.exports =  {
    Home,
    registerView,
    loginView,
    submitProjectView,
    projectDetailsView,
    registerPost,
    loginPost,
    logoutview,
    uploads,
    googleauthS,
    addPS,
    addPSpost,
    PSView,
    PSDetailView,
    problemstatmentinfo,
    postcomment,
    SearchPS,
    Projects,
    postProblemStatment,
    FF180,
    
    Myproject,
    userData,
};