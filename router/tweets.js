import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();
const validateTweet = [
    body('text').isString().trim().isLength({min: 3}).withMessage('트윗의 최소길이는 3자 이상입니다.'),
    validate,
]
export default function tweetsRouter(tweetController) {
    router.get('/', isAuth, tweetController.getTweets)
    router.get('/:id', isAuth, tweetController.getTweetsById)
    router.post('/', isAuth, validateTweet, tweetController.createTweet)
    router.put('/:id', isAuth, validateTweet, tweetController.updateTweet) 
    router.delete('/:id', isAuth, tweetController.removeTweet)
    return router;
}