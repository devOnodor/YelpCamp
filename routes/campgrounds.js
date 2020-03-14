var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// Image Uploader
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dpllk6bvd',
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//********************************************************************************


// Display Campgrounds
router.get("/", (req, res) =>{
	// Get all campgrounds
	Campground.find({}, (err, campgrounds)=>{
		if(err){
			console.log("Error Occured while fetching Campgrounds");
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds: campgrounds, page: "campgrounds"});	
		}
	});
});

// New Campground
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
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