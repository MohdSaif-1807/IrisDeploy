//jshint esversion:6
require('dotenv').config();
const {parse, stringify} = require('flatted');
let {PythonShell} = require('python-shell')
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const error = require('mongoose/lib/error');
//var GoogleStrategy = require('passport-google-oauth2').Strategy;
//const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALL_BACK_URL
},
function(accessToken, refreshToken, profile, done) {
    userProfile=profile;
    return done(null, userProfile);
}
));

app.get('/auth/google', 
passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback', 
passport.authenticate('google', { failureRedirect: '/register' }),
function(req, res) {
  // Successful authentication, redirect success.
  res.redirect('/submit');
});

// app.use(session({
//   secret: "Our little secret.",
//   resave: false,
//   saveUninitialized: false,
//   cookie:{secure:false}
// }));
// app.use(passport.initialize());
// app.use(passport.session());
mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true}).then(()=>{
  console.log("database connected")
}).catch(()=>{
  console.log("database something went wrong!!");
})
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
});

// userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(findOrCreate)
const User = new mongoose.model("User", userSchema);

// passport.use(User.createStrategy());
// const LocalStrategy = require('passport-local').Strategy;
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(function(user,done)
// {
//     done(null,user.id);
// });
// passport.deserializeUser(function(id,done)
// {
//     // User.findById(id,function(err,user)
//     // {
//     //     done(err,user);
//     // });
//     try{
//       User.findById(id)
//         .then((err,user)=>{
//           done(err,user);
//         })
//     }
//     catch(err){
//       console.log("something went wrong");
//     }
// });

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


// passport.use(new GoogleStrategy({
//   clientID: process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   callbackURL: process.env.CALL_BACK_URL,
//   userProfileUrl:   process.env.URL,
// },
// function(request,accessToken, refreshToken, profile, done) {
//   done(null,profile);
//   // User.findOrCreate({ googleId: profile.id,username:profile.id}, function (err, user) {
//   //   return cb(err, user);
//   // });
//   // User.find({ googleId: profile.id,username:profile.id}).then((err,user)=>{
//   //   return cb(err,user);
//   // }).catch(()=>{
//   //   const newData = new User();
//   //   newData.googleId= profile.id;
//   //   newData.username=profile.id;
//   //   newData.save().then((err,user)=>{
//   //     console.log("done");
//   //     return cb(err,user);
//   //   })
//   // })
// }
// ));

// passport.serializeUser((user,done)=>{
//   done(null,user);
// });

// passport.deserializeUser((user,done)=>{
//   done(null,user);
// })

// app.get("/", function(req, res){
//   res.render("home");
// });

// app.get('/auth/google',
//   passport.authenticate('google', { scope:['email','profile' ] }));
// app.get("/auth/google/submit",
//   passport.authenticate('google', { 
//     successRedirect:"/submit",
//     failureRedirect: "/login" })
//   );
// app.use(passport.initialize());
//app.use(passport.session());

app.get("/submit",function(req,res){
  res.render("submit");
})

app.get("/",function(req,res){
  res.render("home");
})
app.get("/login", function(req, res){
  res.render("login");
});
app.post("/login",async function(req,res){
  const ab = req.body.username;
  console.log(ab);
  const tdp = await User.findOne({email:ab});
  console.log(tdp);
if(tdp.password === req.body.password){
  console.log("Login Succesfull");
  res.render("submit");
}
else{
  console.log("Invalid Login");
  res.render("register");
}
    // .then(()=>{
    //   console.log("Login succesfull");
    //   res.render('/submit');
    // })
    // .catch(()=>{
    //   console.log("Invalid Login");
    //   res.render('/register');
    // })
})
app.get("/secrets", function(req, res){
  res.render("secrets");
});
app.get("/register", function(req, res){
  res.render("register");
});
// app.get("/submit",function(req,res,next)
// {
//   if (req.isAuthenticated()){
//     res.render("submit");
//   } else {
//     res.redirect("/login");
//   }
//   //req.user ? next(res.render("submit")) : res.redirect('/login')
// });
final_type=""
final_accuracy=""
final_matrix1=""
final_matrix2=""
final_matrix3=""
app.post("/submit",function(req,res)
{
  const submitted_sepal_length=req.body.sepal_length;
  const submitted_sepal_width=req.body.sepal_width;
  const submitted_petal_length=req.body.petal_length;
  const submitted_petal_width=req.body.petal_width;
  let options={
    args:[submitted_sepal_length,submitted_sepal_width,submitted_petal_length,submitted_petal_width]
  };
  PythonShell.run('algo.py',options, (err,response)=>{
    if (err)
    console.log(err);
    if(response){
      a=stringify(response[0].slice(2,-2));
      final_type=a.slice(2,-2);
      b=stringify(response[1]);
      final_accuracy=b.slice(2,-2);
      c=stringify(response[2]);
      d=stringify(response[3]);
      e=stringify(response[4]);
      final_matrix1=c.slice(4,-3);
      final_matrix2=d.slice(4,-3);
      final_matrix3=e.slice(4,-4);
    }
  });
  res.redirect("/secrets")
  app.get("/secrets", function(req, res){
    res.redirect(req.get('referer'));
  });
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){
  // User.register({username: req.body.username},req.body.password, function(err, user){
  //   if (err) {
  //     console.log(err);
  //     res.redirect("/register");
  //   } else {
  //  //   passport.authenticate("local")(req, res, function(){
  //       res.redirect("/submit");
  //    // });
  //   }
  // });
//   console.log("username"+req.body.username);
//  User.register({username:req.body.username,password:req.body.password});
//   console.log(newData);
//   newData.save().then(()=>{
//     res.redirect("/submit");
//   })
//   .catch((error)=>{
//     console.log(error);
//     res.redirect("/register");
//   })


    const newData = new User({
      email: req.body.username,
      password:req.body.password
    });
    newData.save()
    .then(()=>{console.log("success");res.render('submit');})
    .catch((error)=>{console.log("error"+error);res.redirect('/register');})
});
//  // const tp = new User({username:req.body.username},req.body.password);
//   const newData = new User();
//    {newData.email=req.body.username}
//     newData.password=req.body.password
// //   try{
   
// //     res.status(201).send(data);
// //   }
// //   catch(err){
// //     res.status(201).send(data);
// //   }
// newData.save()
//     .then(()=>{
//       console.log("succesfully inserted");
//         res.redirect("/submit");
//     })
//     .catch((error)=>{console.log("not done");console.log(error);res.redirect('/register')});
// //   //newData.save((err, data) => {
//     // //if (err) {
//     //   res.status(500).send(err);
//     // } else {
//     //     console.log("data inserted successfully")
//     //   res.status(201).send(data);
//     // }
  

// });

// app.post("/register", function (req, res) {
// 	User.register(new User({ email: req.body.username}), req.body.password, function (err, user) {
// 		if (err) {
// 			res.json({ success: false, message: "Your account could not be saved. Error: " + err });
// 		}
// 		else {
// 			req.login(user, (er)=>{
// 				if (er) {
// 					res.json({ success: false, message: er });
// 				}
// 				else {
// 					res.json({ success: true, message: "Your account has been saved" });
// 				}
// 			});
// 		}
// 	});
// });


//app.post("/login", async function(req, res){

//   const user = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });
//   // req.login(user, function(err){
//   //   if (err) {
//   //     console.log(err);
//   //   } else {
//   //     passport.authenticate("local")(req, res, function(){
//   //       res.redirect("/submit");
//   //     });
//   //   }
//   // });
// });

let port = process.env.PORT;
	if (port == null || port == "") {
  	port = 3000;
	}
app.listen(port, function() {
  console.log("Server started on port 3000.");
});
