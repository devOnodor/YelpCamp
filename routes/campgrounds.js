var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// Display Campgrounds
router.get("/", (req, res) =>{
	// Get all campgrounds
	Campground.find({}, (err, campgrounds)=>{
		if(err){
			console.log("Error Occured while fetching Campgrounds");
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds: campgrounds});	
		}
	});
});

// New Campground
router.post("/", middleware.isLoggedIn, (req, res) =>{
	// Get Data from Form and add to Campgrounds Array
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, image: image, description: description, author: author};
	// Create new Campground and save to DB
	Campground.create(newCampground, (err, newlyCreated)=>{
		if(err || !newlyCreated){
			req.flash("error", "There was an error creating that campground.");
			res.redirect("/new");
		} else{
			// Redirect back to Campgrounds
			req.flash("success", "New Campground Created.");
			res.redirect("/campgrounds");	
		}
	});
});

router.get("/new", middleware.isLoggedIn, (req, res) =>{
	res.render("campgrounds/new.ejs");
});

// Campground Detail
router.get("/:id", (req, res)=>{
	// Find the campground by ID
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground)=>{
		// Display Error
		if(err || !foundCampground){
			req.flash("error", "There was an error while fetching the campground.");
			res.redirect("/");
		} else{
			// Render Campground Detailed Page
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});

});

// Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership,(req, res)=>{
	Campground.findById(req.params.id,(err, foundCampground)=>{
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


// Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	// Find and update campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
		if(err || !updatedCampground){
			req.flash("error", "Something went wrong, your campground was not updated.");
			res.redirect("/campgrounds");
		} else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	// Redirect
});

// Destroy Route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findByIdAndRemove(req.params.id, (err)=>{
		if(err){
			req.flash("error", "Something went wrong, your campground was not deleted.");
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Your campground was deleted.");
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;