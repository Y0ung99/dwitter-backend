import httpMocks from 'node-mocks-http';
import * as validator from 'express-validator';
import { validate } from '../validator.js';
import faker from 'faker';

jest.mock('express-validator');

describe('Validator Middleware', () => {
    it('returns 400 for the request when exist error message', () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const next = jest.fn();
        const errorMsg = faker.random.words(3);
        validator.validationResult = jest.fn(() => ({isEmpty: () => false, array: () => [{msg: errorMsg}]}));
        
        validate(request, response, next);

        expect(response.statusCode).toBe(400);
        expect(response._getJSONData().message).toBe(errorMsg);
        expect(next).not.toBeCalled();
    });

    it('returns next doesnt exist error message', () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const next = jest.fn();
        validator.validationResult = jest.fn(() => ({isEmpty: () => true}));
        
        validate(request, response, next);

        expect(next).toBeCalled();
    });
})