const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {
	isAuthor,
	isLoggedIn,
	validateCampground,
} = require("../utils/middleware");
const Campground = require("../models/campground");
const {
	index,
	renderNewForm,
	createCampground,
} = require("../controllers/campgrounds");

router.get("/", catchAsync(index));

router.get("/create", isLoggedIn, renderNewForm);

router.post("/", validateCampground, catchAsync(createCampground));

router.get(
	"/:id",
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
			.populate({
				path: "reviews",
				populate: {
					path: "author",
				},
			})
			.populate("author");
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
	isAuthor,
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
	isAuthor,
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
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndDelete(id);
		req.flash("success", "Campground deleted");
		res.redirect("/campgrounds");
	})
);

module.exports = router;
