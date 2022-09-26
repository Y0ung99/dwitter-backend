import axios from 'axios';
import { request } from 'express';
import faker from 'faker';
import { sequelize } from '../../db/database.js';
import { startServer, stopServer } from '../../server.js';

describe('Auth APIs', () => {
    let server;
    let request;

    beforeAll( async () => {
        server = await startServer();
        request = axios.create({
            baseURL: 'http://localhost:8080',
            validateStatus: null,
        });
    });
    
    afterAll(async () => {
        await sequelize.drop();
        await stopServer(server);
    });

    describe('Post to /auth/signup', () => {
        it('returns 201 and token when user details are valid', async () => {
            const user = makeValidUserDetails();
            
            const res = await request.post('/auth/signup', user);

            expect(res.status).toBe(201);
            expect(res.data.token.length).toBeGreaterThan(0); 
        });

        it('returns 409 and message when username is already exist', async () => {
            const user = makeValidUserDetails();

            await request.post('/auth/signup', user);
            const res = await request.post('/auth/signup', user);

            expect(res.status).toBe(409);
            expect(res.data.message).toEqual(`${user.username} already exists`);
        });
        
        test.each([
            {missingFieldName: 'name', expectedMessage: 'name is missing'},
            {missingFieldName: 'username', expectedMessage: 'username should be at least 5 characters'},
            {missingFieldName: 'password', expectedMessage: 'password should be at least 5 characters'},
            {missingFieldName: 'email', expectedMessage: 'invalid Email'},

        ])(
            `returns 400 when $missingFieldName field is missing`,
            async ({missingFieldName, expectedMessage}) => {
            const user = makeValidUserDetails();
            delete user[missingFieldName];
            const res = await request.post('/auth/signup', user);

            expect(res.status).toBe(400);
            expect(res.data.message).toBe(expectedMessage);
        });

        it('returns 400 when password is too short', async() => {
            const user = {
                ...makeValidUserDetails(),
                password: '123',
            };

            const res = await request.post('/auth/signup', user);

            expect(res.status).toBe(400);
            expect(res.data.message).toBe('password should be at least 5 characters')
        });

        it('returns 400 when url is invalid', async() => {
            const user = {
                ...makeValidUserDetails(),
                url: 'fewawef',
            };

            const res = await request.post('/auth/signup', user);

            expect(res.status).toBe(400);
            expect(res.data.message).toBe('invalid URL');
        });
    });

    describe('Post to /auth/login', () => {
        it('return 200 and token when username, password are valid', async () => {
            const user = await createNewUserAccount();

            const res = await request.post('/auth/login', {
                username: user.username,
                password: user.password,
            });

            expect(res.status).toBe(200);
            expect(res.data.token.length).toBeGreaterThan(0); 
        });

        it('return 401 and message when username is not exist', async () => {
            const user = await createNewUserAccount();
            user.username = faker.internet.userName();

            const res = await request.post('/auth/login', {
                username: user.username,
                password: user.password,
            });

            expect(res.status).toBe(401);
            expect(res.data.message).toEqual('Invalid user or password');
        });

        it('return 401 and message when password is incorrect', async () => {
            const user = await createNewUserAccount();
            const wrongPassword = faker.internet.password(10, true);

            const res = await request.post('/auth/login', {
                username: user.username,
                password: wrongPassword,
            });

            expect(res.status).toBe(401);
            expect(res.data.message).toEqual('Invalid user or password');
        });
    });

    describe('GET to /auth/me', () => {
        it('returns 200 and token when verified user exist', async () => {
            const user = await createNewUserAccount();

            const res = await request.get('/auth/me', {
                headers: {Authorization: `Bearer ${user.jwt}`},
            })

            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({
                username: user.username,
                token: user.jwt,
            });
        });
    });

    async function createNewUserAccount() {
        const userDetails = makeValidUserDetails();
        const prepareUserResponse = await request.post('/auth/signup', userDetails);
        return {
            ...userDetails,
            jwt: prepareUserResponse.data.token,
        }
    }
});

function makeValidUserDetails() {
    const fakerUser = faker.helpers.userCard();
    return { 
        name: fakerUser.name, 
        username: fakerUser.username, 
        email: fakerUser.email, 
        password: faker.internet.password(10, true),
    };
}

