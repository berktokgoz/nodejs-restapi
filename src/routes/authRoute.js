const { body, param } = require('express-validator');
const { authController } = require('../controller/controller.index');
const { requestUtil } = require('../utils/utils.index');
const { validator, apiResponse } = require('../middlewares/middlewares.index');

exports.assignRoutes = app => {
	/**
	 * Login
	 */
	app.post(
		requestUtil.getUrlPrefix('auth/login'),
		[
			body('email')
				.exists()
				.isEmail()
				.withMessage('email is not valid an email'),
			body('password')
				.isLength({ min: 5 })
				.exists()
				.withMessage('password must be at least 5 chars long')
		],
		validator.validate,
		authController.login,
		apiResponse.send
	);

	/**
	 * forgotPassword
	 */
	app.post(
		requestUtil.getUrlPrefix('auth/forgotpassword'),
		[
			body('email')
				.exists()
				.isEmail()
				.withMessage('email is not valid an email')
		],
		validator.validate,
		authController.forgotPassword,
		apiResponse.send
	);

	/**
	 * renewPassword
	 */
	app.post(
		requestUtil.getUrlPrefix('auth/renewPassword'),
		[
			body('code')
				.exists()
				.withMessage('Code is required'),
			body('password')
				.isLength({ min: 5 })
				.exists()
				.withMessage('password must be at least 5 chars long'),
			body('confirmPassword')
				.exists()
				.custom((value, { req }) => value === req.body.password)
				.withMessage('passwords are not the same')
		],
		validator.validate,
		authController.renewPassword,
		apiResponse.send
	);
};
