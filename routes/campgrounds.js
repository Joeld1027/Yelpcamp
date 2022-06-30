const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { campgroundSchema, reviewSchema } = require("../JoiSchemas.js");
const ExpressError = require("../utils/ExpressError");
const isLoggedIn = require("../utils/middleware");
const Campground = require("../models/campground");

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get(
	"/",
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campground/index", { campgrounds });
	})
);

router.post(
	"/",
	validateCampground,
	catchAsync(async (req, res) => {
		const newCampground = new Campground(req.body);
		await newCampground.save();
		req.flash("success", "Made a new Campground");
		res.redirect(`/campgrounds/${newCampground.id}`);
	})
);

router.get("/create", isLoggedIn, (req, res) => {
	res.render("campground/newCampground");
});

router.get(
	"/:id",
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate(
			"reviews"
		);
		if (!campground) {
			req.flash("error", "Campground not found");
			return res.redirect("/campgrounds");
		}
		res.render("campground/campground", { campground });
	})
);

router.get(
	"/:id/edit",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash("error", "Campground not found");
			return res.redirect("/campgrounds");
		}
		res.render("campground/editCampground", { campground });
	})
);

router.put(
	"/:id",
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, req.body);
		await campground.save();
		req.flash("success", "Campground  Updated");
		res.redirect(`/campgrounds/${id}`);
	})
);
router.delete(
	"/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndDelete(id);
		req.flash("success", "Campground deleted");
		res.redirect("/campgrounds");
	})
);

module.exports = router;
