// Includes
/***************************************************************************************/
const 	express = require('express'),
		app = express(),
		bodyParser = require("body-parser"),
		mongoose = require("mongoose"),
		passport = require("passport"),
	  	methodOverride = require("method-override"),
	  	flash = require("connect-flash"),
	  	LocalStrategy = require("passport-local");

const	campgroundRoutes = require("./routes/campgrounds"),
	  	commentRoutes = require("./routes/comments"),
	  	indexRoutes = require("./routes/index");

// Setup
/***************************************************************************************/
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelp_camp");
app.use(methodOverride("_method"));
app.use(flash());

// Imports
/***************************************************************************************/

var Campground 		= require("./models/campground");
var Comment 		= require("./models/comment");
var User	 		= require("./models/user");
var seedDB 			= require("./seeds");

// Passport Config
/***************************************************************************************/
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
/***************************************************************************************/
app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// Routes
/***************************************************************************************/
app.use("/campgrounds", campgroundRoutes);
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Start
// Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));