const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({}).populate("author");
	res.render("campground/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render("campground/newCampground");
};

module.exports.createCampground = async (req, res) => {
	const newCampground = new Campground(req.body);
	newCampground.author = req.user.id;
	await newCampground.save();
	req.flash("success", "Made a new Campground");
	res.redirect(`/campgrounds/${newCampground.id}`);
};
