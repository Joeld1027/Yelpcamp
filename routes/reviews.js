const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../JoiSchemas.js");
const ExpressError = require("../utils/ExpressError");

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.post(
	"/",
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body);
		campground.reviews.push(review);
		await campground.save();
		await review.save();
		req.flash("success", "Created new Review");
		res.redirect("back");
	})
);

router.delete(
	"/:reviewId",
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			$pull: { reviews: reviewId },
		});
		await campground.save();
		await Review.findByIdAndDelete(reviewId);
		req.flash("success", "Deleted your Review");
		res.redirect("back");
	})
);

module.exports = router;
