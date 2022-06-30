const express = require("express");
const router = express.Router();
const User = require("../models/users");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.get("/register", (req, res) => {
	res.render("users/register");
});

router.post(
	"/register",
	catchAsync(async (req, res, next) => {
		try {
			const { username, email, password } = req.body;
			const user = new User({ email, username });
			const registeredUser = await User.register(user, password);
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash("success", "Welcome to Campgrounds");
				res.redirect("/campgrounds");
			});
		} catch (e) {
			req.flash("error", e.message);
			res.redirect("back");
		}
	})
);

router.get("/login", (req, res) => {
	res.render("users/login");
});

router.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/login",
	}),
	(req, res) => {
		const redirectUrl = req.session.returnTo || "/campgrounds";
		req.flash("success", "Welcome Back");
		res.redirect(redirectUrl);
	}
);

router.get("/logout", (req, res, next) => {
	req.logout((e) => {
		if (e) next(e);
		req.flash("success", "Goodbye");
		res.redirect("/campgrounds");
	});
});

module.exports = router;
