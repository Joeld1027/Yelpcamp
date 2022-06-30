const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

app.use(
	session({
		secret: "mimicat",
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			expires: Date.now() + 1000 * 60 * 24 * 7,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		},
	})
);
app.use(flash());
app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use(methodOverride("_method"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

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

app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh no, Something Went Wrong";
	res.status(statusCode).render("error", { err });
});
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.listen(3000, () => {
	console.log("Server Running on port 3000");
});
