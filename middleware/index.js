var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};

// Campground Ownership ***********************************************
middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){
			Campground.findById(req.params.id,(err, foundCampground)=>{
			// Display Error
			if(err || !foundCampground){
				req.flash("error", "There was an error while fetching the campground.");
				res.redirect("back");
			} else{
				// Does the user own the campground
				if(foundCampground.author.id.equals(req.user._id)){
				// Render Campground Detailed Page
					next();
				} else {
					req.flash("error", "You must be the owner of this post to do that.");
					res.redirect("back");
				}
			}
		});
	} else {
			req.flash("error", "You must be logged in to do that.");
			res.redirect("back");
	
	}
}
//********************************************************************

// Comment Ownership *************************************************
middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id,(err, foundComment)=>{
			// Display Error
			if(err || !foundComment){
				req.flash("error", "There was an error while fetching the comment.");
				res.redirect("back");
			} else{
				// Does the user own the comment
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else {
					req.flash("error", "You must be the owner of this post to do that.");
					res.redirect("back");
				}
			}
		});
	} else {
			req.flash("error", "You must be logged in to do that.");
			res.redirect("back");
	
	}
}
//********************************************************************

// Check if User is Logged *******************************************
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You must be logged in to do that.");
	res.redirect("/login");
}
//********************************************************************

module.exports = middlewareObj;