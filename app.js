const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");

app.use(methodOverride("_method"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/campgrounds", async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campground/index", { campgrounds });
});

app.post("/campgrounds", async (req, res) => {
	const newCampground = new Campground(req.body);
	await newCampground.save();
	res.redirect("/campgrounds");
});

app.get("/campgrounds/create", (req, res) => {
	res.render("campground/newCampground");
});

app.get("/campgrounds/:id", async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	res.render("campground/campground", { campground });
});

app.get("/campgrounds/:id/edit", async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	res.render("campground/editCampground", { campground });
});

app.put("/campgrounds/:id", async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, req.body);
	await campground.save();
	res.redirect("/campgrounds");
});
app.delete("/campgrounds/:id", async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndDelete(id);
	res.redirect("/campgrounds");
});

app.listen(3000, () => {
	console.log("Server Running on port 3000");
});
