import axios from 'axios';
import faker from 'faker';
import { sequelize } from '../../db/database.js';
import { startServer, stopServer } from '../../server.js';
import { createNewUserAccount } from './auth_utils.js';

describe('Tweet APIs', () => {
    let server;
    let request;

    beforeAll( async () => {
        server = await startServer();
        request = axios.create({
            baseURL: `http://localhost:${server.address().port}`,
            validateStatus: null,
        });
    });
    
    afterAll(async () => {
        await stopServer(server);
    });
    describe('POST to /tweets', () => {
        it('returns 201 and created tweet when a tweet has 3 characters or more', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.word(3);
            const res = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});
            
            expect(res.status).toBe(201);
            expect(res.data.text).toBe(text);
        });

        it('returns 400 and created tweet when a tweet has 2 characters or less', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.alpha({count: 2});
            const res = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});
            
            expect(res.status).toBe(400);
            expect(res.data.message).toBe('트윗의 최소길이는 3자 이상입니다.');
        })
    });

    describe('GET to /tweets', () => {
        it('returns 200 and tweets when request has username query', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.word(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            const res = await request.get(`/tweets?username=${user.username}`, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(200);
            expect(res.data.filter(tweet => tweet.text === text).length).toBeGreaterThan(0);
        });

        it('returns 200 and all tweets when request hasnt username query', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.word(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            const res = await request.get(`/tweets`, {headers: {Authorization: `Bearer ${user.jwt}`},});
            
            expect(res.status).toBe(200);
            expect(res.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET to /tweets/:id', () => {
        it('returns 200 and ids tweet when ids tweet exist', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.word(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            const res = await request.get(`/tweets/${newTweet.data.id}`, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(200);
            expect(res.data.id).toBe(newTweet.data.id);
        });

        it('returns 404 when ids tweet doesnt exist', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.word(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});
            const nullId = newTweet.data.id + 1;

            const res = await request.get(`/tweets/${nullId}`, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(404);
            expect(res.data.message).toBe(`Tweet id(${nullId}) not found`);
        });
    });

    describe('PUT to /tweets/:id', () => {
        it('returns 200 and updated tweet', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.words(3);
            const newText = faker.random.words(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});
            const res = await request.put(`/tweets/${newTweet.data.id}`, {text: newText}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(200);
            expect(res.data.text).toBe(newText);
        });

        it('returns 404 when tweet cant found', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.words(3);
            const newText = faker.random.words(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});
            
            const res = await request.put(`/tweets/${newTweet.data.id + 1}`, {text: newText}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE to /tweets/:id', () => {
        it('returns 204', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.words(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            const res = await request.delete(`/tweets/${newTweet.data.id}`, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(204);
        });

        it('returns 404 when tweet cant found', async () => {
            const user = await createNewUserAccount(request);
            const text = faker.random.words(3);
            const newTweet = await request.post('/tweets', {text}, {headers: {Authorization: `Bearer ${user.jwt}`},});

            const res = await request.delete(`/tweets/${newTweet.data.id + 1}`, {headers: {Authorization: `Bearer ${user.jwt}`},});

            expect(res.status).toBe(404);
        })
    })
});
