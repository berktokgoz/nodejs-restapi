const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const app = require('../src/loaders/express');
const userRepository = require('../src/repository/userRepository');
const { stateEnums } = require('../src/model/enums/enums.index');
const { config } = require('../src/config/config');
const setupTestDBAndConnection = require('./utils/setupTestDBAndConnection');

setupTestDBAndConnection();

const server = app.listen(config.api_config.api_port, () =>
	console.log(
		`%cAPI Running on: ${config.api_config.api_host}:${config.api_config.api_port}${config.api_config.api_base_url}`,
		'color: green'
	)
);

// const server = request.agent(
// 	`${config.api_config.api_host}:${config.api_config.api_port}${config.api_config.api_base_url}`
// );

describe('Authentication API', () => {
	let dbUser;
	let user;

	beforeEach(async () => {
		dbUser = {
			name: 'Bran Stark',
			email: 'branstark@gmail.com',
			password: '123ljkD3ed'
		};

		user = {
			email: 'cembdci@gmail.com',
			password: '123ljkD3ed',
			name: 'Cem Bideci'
		};

		await userRepository.createUser(dbUser);
	});

	describe('POST /api/v1/auth/register', () => {
		it('should register a new user when request is ok', done => {
			request(app)
				.post('/api/v1/auth/register')
				.send(user)
				.expect(httpStatus.OK)
				.then(res => {
					expect(res.body).to.have.a.property('success');
					expect(res.body).to.have.a.property('message');
					const { message } = res.body;
					const { success } = res.body;
					expect(success).to.be.equal(true);
					expect(message).to.include('Succesfull');
				});

			done();
		});

		it('should report error when email already exists', done => {
			request(app)
				.post('/api/v1/auth/register')
				.send(dbUser)
				.expect(httpStatus.NOT_ACCEPTABLE)
				.then(res => {
					expect(res.body).to.have.a.property('success');
					expect(res.body).to.have.a.property('message');
					const { message } = res.body;
					const { success } = res.body;
					expect(success).to.be.equal(false);
					expect(message).to.include('This email is in use');
				});

			done();
		});

		it('should report error when the email provided is not valid', done => {
			user.email = 'this_is_not_an_email';
			request(app)
				.post('/api/v1/auth/register')
				.send(user)
				.expect(httpStatus.UNPROCESSABLE_ENTITY)
				.then(res => {
					expect(res.body).to.have.a.property('errors');
					const { errors } = res.body;
					expect(errors).length.greaterThan(0);
					expect(errors[0].message).to.include('"email" must be a valid email');
				});

			done();
		});

		it('should report error when email and password are not provided', done => {
			request(app)
				.post('/api/v1/auth/register')
				.send({})
				.expect(httpStatus.UNPROCESSABLE_ENTITY)
				.then(res => {
					expect(res.body).to.have.a.property('errors');
					const { errors } = res.body;
					expect(errors).length.greaterThan(0);
					expect(errors[0].message).to.include('"email" is required');
				});

			done();
		});
	});

	describe('POST /api/v1/auth/login', () => {
		let loginUser;

		beforeEach(async () => {
			loginUser = {
				email: 'branstark@gmail.com',
				password: '123ljkD3ed'
			};

			const updateStateUser = await userRepository.getUserByEmail(loginUser.email);
			updateStateUser.state = stateEnums.UserState.Active;
			await userRepository.updateUser(updateStateUser);
		});

		it('should return an token when email and password matches', done => {
			request(app)
				.post('/api/v1/auth/login')
				.send(loginUser)
				.expect(httpStatus.BAD_GATEWAY)
				.then(res => {
					expect(res.body).to.have.a.property('success');
					expect(res.body).to.have.a.property('message');
					expect(res.body).to.have.a.property('data');
					expect(res.body.data).to.have.a.property('token');
					const { message } = res.body;
					const { success } = res.body;
					const { data } = res.body;
					expect(success).to.be.equal(true);
					expect(message).to.include('Succesfull');
					expect(data).to.not.equal(null);
					expect(data).to.not.equal(undefined);
					expect(data.token).to.not.equal(null);
					expect(data.token).to.not.equal(undefined);
				});

			done();
		});

		// 	it('should report error when email and password are not provided', () => {
		// 		return request(app)
		// 			.post('/v1/auth/login')
		// 			.send({})
		// 			.expect(httpStatus.BAD_REQUEST)
		// 			.then(res => {
		// 				const { field } = res.body.errors[0];
		// 				const { location } = res.body.errors[0];
		// 				const { messages } = res.body.errors[0];
		// 				expect(field).to.be.equal('email');
		// 				expect(location).to.be.equal('body');
		// 				expect(messages).to.include('"email" is required');
		// 			});
		// 	});

		// 	it('should report error when the email provided is not valid', () => {
		// 		user.email = 'this_is_not_an_email';
		// 		return request(app)
		// 			.post('/v1/auth/login')
		// 			.send(user)
		// 			.expect(httpStatus.BAD_REQUEST)
		// 			.then(res => {
		// 				const { field } = res.body.errors[0];
		// 				const { location } = res.body.errors[0];
		// 				const { messages } = res.body.errors[0];
		// 				expect(field).to.be.equal('email');
		// 				expect(location).to.be.equal('body');
		// 				expect(messages).to.include('"email" must be a valid email');
		// 			});
		// 	});

		// 	it("should report error when email and password don't match", () => {
		// 		dbUser.password = 'xxx';
		// 		return request(app)
		// 			.post('/v1/auth/login')
		// 			.send(dbUser)
		// 			.expect(httpStatus.UNAUTHORIZED)
		// 			.then(res => {
		// 				const { code } = res.body;
		// 				const { message } = res.body;
		// 				expect(code).to.be.equal(401);
		// 				expect(message).to.be.equal('Incorrect email or password');
		// 			});
		// 	});
	});
});
