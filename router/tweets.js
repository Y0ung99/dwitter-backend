import express, { Router } from 'express';
import 'express-async-errors';
import * as tweetController from '../controller/logic.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();
const validateTweet = [
    body('text').isString().trim().isLength({min: 3}).withMessage('트윗의 최소길이는 3자 이상입니다.'),
    validate,
]

router.get('/', tweetController.getTweets)

router.get('/:id', tweetController.getTweetsById)

router.post('/', validateTweet, tweetController.createTweet)

router.put('/:id', validateTweet, tweetController.updateTweet) 

router.delete('/:id', tweetController.removeTweet)

export default router;

/**  express-validaotr libarary
 * validation 
 * 서버에서 빠르게 유효성검사를 해야하는 중요한 포인트는 
 * 데이터베이스에 접근해서 읽고 쓰기전에 유효성검사를 하는것
 * Beacause 다른 클라우드에 데이터베이스가 있을경우 네트워크 비용 발생
 * 시간과 비용을 절약하기위해서 데이터가 유효한지 validation 해야함
 * 
 * sanitization
 * 서버에 데이터를 일관성있게 저장하기위해서 데이터를 nomalization
 * 
 * Contract Testring: Client - Server
 * 
 * Proto-
*/