import express, { Router } from 'express';
import 'express-async-errors';
import * as tweetController from '../controller/logic.js';


const router = express.Router();

router.get('/', tweetController.getTweets)

router.get('/:id', tweetController.getTweetsById)

router.post('/', tweetController.createTweet)

router.put('/:id', tweetController.updateTweet) 

router.delete('/:id', tweetController.removeTweet)

export default router;