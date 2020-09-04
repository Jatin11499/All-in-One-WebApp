require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const geoip = require("geoip-lite");
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('Your API Key');
const funFacts = require('fun-facts');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/allDB",{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const listSchema = new mongoose.Schema({
    name: String
});

const Items = mongoose.model("Item", listSchema);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    listItems: [listSchema],
    memoTitle: String,
    memoBody: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("index");
});

app.get("/home", function(req,res){
    if(req.isAuthenticated()){
        const titles = [];
        const content = [];
        const facts = [];
        let list = [];

        newsapi.v2.topHeadlines({
            language: 'en',
            country: 'in'
        })
        .then(response => {
            for(let i=0;i<10;i++){
                titles.push(response.articles[i].title);
                content.push(response.articles[i].description);
                facts.push(funFacts.get({useDesc: 1}));
            }

            User.findOne({name: req.query.name}, function(err,data){
                if(err){
                    console.log(err);
                }
                else
                {
                    res.render("home",{
                        newsTitles: titles,
                        newsContent: content,
                        name: req.query.name,
                        todo: data.listItems,
                        randomFacts: facts,
                        mt: data.memoTitle,
                        mb: data.memoBody
                    });
                }
                });
            });
    }
    else{
        res.redirect("/login");
    }
});

app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", function(req,res){
    User.register({username: req.body.username, name: req.body.name}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/home?name="+req.body.name);
            });
        }
    });
});

app.get("/login", function(req,res){
    res.render("login");
});

app.post("/login", function(req,res){
    const u = req.body.username;
    const p = req.body.password;
    let n = "";

    User.findOne({username: u}, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            if(data){
                n = data.name;
            }
            else{
                res.redirect("/register");
            }
        }
    });

    const user = new User({
        username: u,
        password: p
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/home?name="+n);
            });
        }
    });
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

app.post("/add-new", function(req,res){
    const title = req.body.newItem;
    const n = req.body.name;

    const newItem = new Items({
        name: title
    });

    User.findOne({name: n}, function(err,data){
        if(err){
            console.log(err);
        }
        else{
            if(data){
                data.listItems.push(newItem);
                data.save();
                res.redirect("/home?name="+n);
            }
        }
    });
});

app.post("/delete", function(req,res){
    const checkItemId = req.body.checkbox;
    User.findOneAndUpdate({name: req.body.name}, {$pull: {listItems: {_id: checkItemId}}}, function(err, data){
        if(!err){
            res.redirect("/home?name="+req.body.name);
        }
    });
});

app.post("/memoSubmit", function(req,res){
    const n = req.body.name;
    const mt = req.body.memoTitle;
    const mb = req.body.memoBody;

    User.findOneAndUpdate({name: n}, {$set: {memoTitle: mt,memoBody: mb}}, function(err,data){
        if(err){
            console.log(err);
        }
        else{
             res.redirect("/home?name="+n);
        }
    });
});

app.get("/about", function(req,res){
    res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
});