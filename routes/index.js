var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");

// Index
router.get('/', (req, res) =>{
	res.render("landing");
});

// Show Register Form
router.get("/register", (req, res)=>{
	res.render("register");
});

// Sign Up Logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
           	req.flash("success", "Welcome to YelpCamp " + user.username + "!");
			res.redirect("/campgrounds"); 
        });
    });
});

// Show Login Form
router.get("/login", (req, res)=>{
	res.render("login");
});

// Post Login Data
router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), (req, res) => {
	// Empty
});

// Log Out
router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("success", "You have signed out.");
	res.redirect("/campgrounds");
});


module.exports = router;