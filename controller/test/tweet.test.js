import faker from 'faker';
import { TweetController } from '../tweet.js';
import httpMocks from 'node-mocks-http';

describe('TweetController', () => {
    let tweetController;
    let tweetRepository;
    let mockedSocket;
    beforeEach(() => {
        tweetRepository = {};
        mockedSocket = { emit: jest.fn()};
        tweetController = new TweetController(tweetRepository, () => mockedSocket);
    });

    describe('getTweets', () => {
        it('return all tweets when username is not provided', async () => {
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const allTweets = [{text: faker.random.words(3)},{text: faker.random.words(3)}];
            tweetRepository.getAll = () => allTweets;

            await tweetController.getTweets(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual(allTweets);
        });

        it('return specified user tweets when username is provided', async () => {
            const username = faker.internet.userName();
            const userTweets = [{text: faker.random.words(3)}, {text: faker.random.words(3)}];
            const request = httpMocks.createRequest({
                query: {username},
            });
            const response = httpMocks.createResponse();
            tweetRepository.getByUsername = () => userTweets;
            
            await tweetController.getTweets(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual(userTweets);
        });
    });

    describe('getTweetsById', () => {
        let tweetId, request, response;
        beforeEach(() => {
            tweetId = faker.random.alphaNumeric(16);
            request = httpMocks.createRequest({
                params: {id: tweetId}
            });
            response = httpMocks.createResponse();
        });

        it('return 404 for response when id is incorrect', async () => {
            tweetRepository.getById = jest.fn(() => undefined);

            await tweetController.getTweetsById(request, response);

            expect(response.statusCode).toBe(404);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(response._getJSONData()).toMatchObject({message: `Tweet id(${tweetId}) not found`});
        });

        it('return specified ids tweets when id is provided', async () => {
            const idTweets = [{text: faker.random.words(3)}, {text: faker.random.words(3)}];
            tweetRepository.getById = jest.fn(() => idTweets);

            await tweetController.getTweetsById(request, response);

            expect(response.statusCode).toBe(200);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(response._getJSONData()).toEqual(idTweets);
        });
    });

    describe('createTweet', () => {
        let newTweet, authorId, request, response;
        beforeEach(() => {
            newTweet = faker.random.words(3);
            authorId = faker.random.alphaNumeric(16);
            request = httpMocks.createRequest({
                body: {text: newTweet},
                userId: authorId,
            });
            response = httpMocks.createResponse();
        });

        it('returns 201 with created tweet object including userId', async () => {
            tweetRepository.create = jest.fn((text, userId) => ({text, userId}));

            await tweetController.createTweet(request, response);

            expect(response.statusCode).toBe(201);
            expect(response._getJSONData()).toMatchObject({text: newTweet, userId: authorId});
            expect(tweetRepository.create).toHaveBeenCalledWith(newTweet, authorId);
        });

        it('should send a event to a websocket channel', async () => {
            tweetRepository.create = jest.fn((text, userId) => ({text, userId}));

            await tweetController.createTweet(request, response);

            expect(mockedSocket.emit).toHaveBeenCalledWith('tweets', {
                text: newTweet,
                userId: authorId,
            });
        });
    });

    describe('updateTweet', () => {
        let tweetId, updatedText, request, response, authorId;
        beforeEach(() => {
            tweetId = faker.random.alphaNumeric(16);
            authorId = faker.random.alphaNumeric(16);
            updatedText = faker.random.words(3);
            request = httpMocks.createRequest({
                params: {id: tweetId},
                body: {text: updatedText},
                userId: authorId,
            });
            response = httpMocks.createResponse();
        });

        it('returuns 404 for request when a tweet not provided', async () => {
            tweetRepository.getById = jest.fn(() => undefined);
            
            await tweetController.updateTweet(request, response);

            expect(response.statusCode).toBe(404);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
        });

        it('returuns 403 for request when a cant matching tweet userid, request userid each other', async () => {
            const tweet = {userId: faker.random.alphaNumeric(16), text: faker.random.words(3)};
            tweetRepository.getById = jest.fn(() => tweet);
            
            await tweetController.updateTweet(request, response);

            expect(response.statusCode).toBe(403);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
        });

        it('returuns 404 and message for request when tweet id cant found', async () => {
            const tweet = {userId: authorId, text: faker.random.words(3)};
            tweetRepository.getById = jest.fn(() => tweet);
            tweetRepository.update = jest.fn((newText, tweetId) => undefined);

            await tweetController.updateTweet(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toMatchObject({message: `Tweet id(${tweetId}) not found`});
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(tweetRepository.update).toHaveBeenCalledWith(updatedText, tweetId);
        });

        it('returuns 200 and updated tweet for request when tweet id is provided', async () => {
            const tweet = {userId: authorId, text: faker.random.words(3)};
            tweetRepository.getById = jest.fn(() => tweet);
            tweetRepository.update = jest.fn((newText, tweetId) => ({text: updatedText}));

            await tweetController.updateTweet(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toMatchObject({
                text: updatedText,
            });
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(tweetRepository.update).toHaveBeenCalledWith(updatedText, tweetId);
        });
    });
    
    describe('removeTweet', () => {
        let tweetId, authorId, request, response;
        beforeEach(() => {
            tweetId = faker.random.alphaNumeric(16);
            authorId = faker.random.alphaNumeric(16);
            request = httpMocks.createRequest({
                params: {id: tweetId},
                userId: authorId,
            });
            response = httpMocks.createResponse();
        });

        it('return 404 for request when a tweet cant found', async () => {
            tweetRepository.getById = jest.fn(() => undefined);
            tweetRepository.remove = jest.fn();

            await tweetController.removeTweet(request, response);

            expect(response.statusCode).toBe(404);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(tweetRepository.remove).not.toHaveBeenCalled();
        });

        it('returns 403 for request when cant matching tweet userid, request userid each other', async () => {
            const tweet = {userId: faker.random.alphaNumeric(16), text: faker.random.words(3)};
            tweetRepository.getById = jest.fn(() => tweet);
            tweetRepository.remove = jest.fn();

            await tweetController.removeTweet(request, response);
            
            expect(response.statusCode).toBe(403);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(tweetRepository.remove).not.toHaveBeenCalled();
        });

        it('returns 204 for request and remove tweet', async () => {
            const tweet = {userId: authorId, text: faker.random.words(3)};
            tweetRepository.getById = jest.fn(() => tweet);
            tweetRepository.remove = jest.fn();
            
            await tweetController.removeTweet(request, response);

            expect(response.statusCode).toBe(204);
            expect(tweetRepository.getById).toHaveBeenCalledWith(tweetId);
            expect(tweetRepository.remove).toHaveBeenCalledWith(tweetId);
        });
    });
});




// jest.mock('../../data/data.js');
// jest.mock('../../connection/socket.js');
// jest.mock('socket.io');

// describe('Tweet Controller', () => {
//     let controller;
//     let mockedSocket;
//     beforeEach(() => {
//         controller = new TweetController(tweetRepository, socket.getSocketIO);
//         mockedSocket = {emit: jest.fn()};
//     });

//     describe('getTweets', () => {
//         it('return 200 for response and get tweets using getByUsername when username exist', async () => {
//             const username = faker.name.firstName();
//             const url = `/tweets?username=${username}`;
//             const request = httpMocks.createRequest({
//                 method: 'GET',
//                 url,
//             });
//             const response = httpMocks.createResponse();
//             tweetRepository.getByUsername = jest.fn(username => Promise.resolve(username));

//             await controller.getTweets(request, response);

//             expect(response.statusCode).toBe(200);
//             expect(response._getJSONData()).toBe(username);
//         });

//         it('return 200 for response and get tweets using getAll when username doesnt exist', async () => {
//             const request = httpMocks.createRequest({
//                 method: 'GET',
//                 url: '/tweets'
//             });
//             const response = httpMocks.createResponse();
//             tweetRepository.getAll = jest.fn(() => Promise.resolve('getAll'));

//             await controller.getTweets(request, response);

//             expect(response.statusCode).toBe(200);
//             expect(response._getJSONData()).toBe('getAll');
//         });
//     });

//     describe('getTweetsById', () => {
//         it('return 200 for response and get tweets using getTweetsById when tweet id exist', async () => {
//             const id = faker.random.alphaNumeric(32);
//             const url = `/tweets/${id}`;
//             const request = httpMocks.createRequest({
//                 method: 'GET',
//                 url,
//             });
//             const response = httpMocks.createResponse();
//             tweetRepository.getById = jest.fn(() => Promise.resolve(id));

//             await controller.getTweetsById(request, response);

//             expect(response.statusCode).toBe(200);
//             expect(response._getJSONData()).toBe(id);
//         });

//         it('return 404 for response and get error message when tweet id doesnt exist', async () => {
//             const tweetId = faker.random.alphaNumeric(32);
//             const url = `/tweets/${tweetId}`;
//             const request = httpMocks.createRequest({
//                 method: 'GET',
//                 url,
//             });
//             const response = httpMocks.createResponse();
//             tweetRepository.getById = jest.fn(() => Promise.resolve(undefined));

//             await controller.getTweetsById(request, response);

//             expect(response.statusCode).toBe(404);
//             expect(response._getJSONData()).toEqual({message: `Tweet id(${undefined}) not found`});
//         });

//         describe('createTweet', () => {
//             it('return 201 for response and create tweet using create', async () => {
//                 const url = '/tweets';
//                 const text = faker.lorem.lines(1);
//                 const userId = faker.random.alphaNumeric(32);
//                 const request = httpMocks.createRequest({
//                     method: 'POST',
//                     url,
//                     body: JSON.stringify({text}),
//                     headers: {userId},
//                 });
//                 const response = httpMocks.createResponse();
//                 tweetRepository.create = jest.fn((text, userId) => {return {text, userId}});

//                 await controller.createTweet(request, response);

//                 expect(response.statusCode).toBe(201);
//                 expect(response._getJSONData()).toEqual({text, userId});
//                 expect(socket.getSocketIO.emit).toBeCalledTimes(1);
//             });
//         });
//     });
// });