const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./JoiSchemas.js");
const Review = require("./models/review");

app.use(methodOverride("_method"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

mongoose
	.connect("mongodb://localhost:27017/Campground", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("Connected to DB");
	})
	.catch((err) => {
		console.log("Error connecting to Database", err);
	});
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.get(
	"/campgrounds",
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campground/index", { campgrounds });
	})
);

app.post(
	"/campgrounds",
	validateCampground,
	catchAsync(async (req, res) => {
		const newCampground = new Campground(req.body);
		await newCampground.save();
		res.redirect(`/campgrounds/${newCampground.id}`);
	})
);

app.get("/campgrounds/create", (req, res) => {
	res.render("campground/newCampground");
});

app.get(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate(
			"reviews"
		);
		res.render("campground/campground", { campground });
	})
);

app.get(
	"/campgrounds/:id/edit",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		res.render("campground/editCampground", { campground });
	})
);

app.put(
	"/campgrounds/:id",
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, req.body);
		await campground.save();
		res.redirect("/campgrounds");
	})
);
app.delete(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	})
);
app.post(
	"/campgrounds/:id/reviews",
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body);
		campground.reviews.push(review);
		await campground.save();
		await review.save();
		res.redirect("back");
	})
);

app.delete("/campgrounds/:id/reviews/:reviewId", async (req, res) => {
	const { id, reviewId } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		$pull: { reviews: reviewId },
	});
	await campground.save();
	const review = await Review.findByIdAndDelete(reviewId);
	res.redirect("back");
});
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh no, Something Went Wrong";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Server Running on port 3000");
});
