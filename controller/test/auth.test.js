import { AuthController } from '../auth.js';
import httpMocks from 'node-mocks-http';
import faker from 'faker';

describe('AuthController', () => {
    let userRepository, jwt, bcrypt, config, authController;
    beforeEach(() => {
        userRepository = {};
        jwt = {};
        bcrypt = {};
        config = {bcrypt:{}, jwt:{}};
        authController = new AuthController(userRepository, jwt, bcrypt, config);
    });

    describe('signUp', () => {
        let request, response, username, password, name, email, url, token;
        beforeEach(() => {
            username =  faker.internet.userName();
            password = faker.internet.password();
            name = faker.name.firstName();
            email = faker.internet.email();
            url = faker.internet.url();
            token = faker.random.alphaNumeric(16);
            request = httpMocks.createRequest({
                body: {
                    username,
                    password,
                    name,
                    email,
                    url,
                }
            });
            response = httpMocks.createResponse();
            authController.createJwtToken = jest.fn(() => token);
        });

        it('returns 409 for response when username already exist', async () => {
            const found = {username};
            userRepository.findByUsername = jest.fn((username) => found);
            userRepository.createUser = jest.fn();
            authController.createJwtToken = jest.fn();
            bcrypt.hash = jest.fn();

            await authController.signUp(request, response);

            expect(response.statusCode).toBe(409);
            expect(response._getJSONData()).toMatchObject({message: `${username} already exists`});
            expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(userRepository.createUser).not.toHaveBeenCalled();
            expect(authController.createJwtToken).not.toHaveBeenCalled();
        });

        it('returns 201 and object of created user for response', async () => {
            const hashed = faker.random.alphaNumeric(16);
            const saltRounds = faker.random.alphaNumeric(2);
            config.bcrypt.saltRounds = saltRounds;
            userRepository.findByUsername = jest.fn(() => undefined);
            bcrypt.hash = jest.fn((password, saltRounds) => hashed);
            userRepository.createUser = jest.fn(() => ({
                username,
                password: hashed,
                name,
                email,
                url
            }));
            
            await authController.signUp(request, response);

            expect(response.statusCode).toBe(201);
            expect(response._getJSONData()).toMatchObject({token, username});
            expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
            expect(authController.createJwtToken).toHaveBeenCalledWith({
                username,
                password: hashed,
                name,
                email,
                url
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(password, config.bcrypt.saltRounds);
        });
    });
    
    describe('logIn', () => {
        let request, response, username, password, token;
        beforeEach(() => {
            username = faker.internet.userName();
            password = faker.internet.password();
            token = faker.random.alphaNumeric(16);
            request = httpMocks.createRequest({
                body: {username, password},
            });
            response = httpMocks.createResponse();
            authController.createJwtToken = jest.fn(() => token);
        });

        it('returns 401 for response when cannot find user', async () => {
            userRepository.findByUsername = jest.fn(() => undefined);
            bcrypt.compare = jest.fn();

            await authController.logIn(request, response);
            
            expect(response.statusCode).toBe(401);
            expect(response._getJSONData()).toMatchObject({ message: 'Invalid user or password'});
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(authController.createJwtToken).not.toHaveBeenCalled();
        });

        it('returns 401 for response when cannot match password', async () => {
            userRepository.findByUsername = jest.fn(() => ({id: faker.random.alphaNumeric(16)}));
            bcrypt.compare = jest.fn(() => false);
            
            await authController.logIn(request, response);

            expect(response.statusCode).toBe(401);
            expect(response._getJSONData()).toMatchObject({ message: 'Invalid user or password'});
            expect(authController.createJwtToken).not.toHaveBeenCalled();
        });

        it('retruns 200 and object of created user for response', async () => {
            const user = {id: faker.random.alphaNumeric(16), password};
            userRepository.findByUsername = jest.fn(() => user);
            bcrypt.compare = jest.fn(() => true);

            await authController.logIn(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toMatchObject({token, username});
            expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
            expect(authController.createJwtToken).toHaveBeenCalledWith(user.id);
        });
    });
    
    describe('me', () => {
        let request, response, username, token, userId;
        beforeEach(() => {
            token = faker.random.alphaNumeric(16);
            userId = faker.random.alphaNumeric(16);
            username = faker.internet.userName();
            request = httpMocks.createRequest({
                userId,
                token,
            });
            response = httpMocks.createResponse();
        });
        
        it('returns 404 and message for request when cannot find user', async () => {
            userRepository.findById = jest.fn(() => undefined);

            await authController.me(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toMatchObject({ message: 'User not found'});
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('returns 200 and object of verified user for request', async () => {
            const user = {username};
            userRepository.findById = jest.fn(() => user);

            await authController.me(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toMatchObject({token, username});
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('createdJwtToken', () => {
        it('returns token', () => {
            const token = faker.random.alphaNumeric(16);
            const id = faker.random.alphaNumeric(16);
            const secretKey = faker.random.alphaNumeric(16);
            const expiresInSec = faker.random.alphaNumeric(3);
            config.jwt.secretKey = secretKey;
            config.jwt.expiresInSec = expiresInSec;
            jwt.sign = jest.fn((id, secretKey, option) => token);

            authController.createJwtToken(id);

            expect(authController.createJwtToken(id)).toBe(token);
            expect(jwt.sign).toHaveBeenCalledWith({id}, config.jwt.secretKey, {expiresIn: config.jwt.expiresInSec});
        });
    });
});