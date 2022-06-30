const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
	title: Joi.string().required(),
	price: Joi.number().required().min(0),
	image: Joi.string().required(),
	location: Joi.string().required(),
	description: Joi.string().required(),
}).required();

module.exports.reviewSchema = Joi.object({
	rating: Joi.number().required().min(0).max(5),
	review: Joi.string().required(),
});
