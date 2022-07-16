import { getSocketIO } from '../connection/socket.js';
import * as tweetRepository from '../data/data.js';

export async function getTweets(req, res) {
    const username = req.query.username;
    const data = await (username 
    ? tweetRepository.getByUsername(username)
    : tweetRepository.getAll());
    res.status(200).json(data);
}

export async function getTweetsById(req, res) {
    const id = req.params.id;
    const data = await tweetRepository.getById(id);
    data 
    ? res.status(200).json(data)
    : res.status(404).json({message: `Tweet id(${id}) not found`});
}

export async function createTweet(req, res) {
    const {text} = req.body;
    const newTweet = await tweetRepository.create(text, req.userId);
    res.status(201).json(newTweet);
    getSocketIO().emit('tweets', newTweet);
}

export async function updateTweet(req, res) {
    const id = req.params.id;
    const newText = req.body.text;
    const tweet = await tweetRepository.getById(id);
    if (!tweet) {
        res.sendStatus(404);
    }
    if (tweet.userId !== req.userId) {
        res.sendStatus(403);
    }

    const updated = await tweetRepository.update(newText, id)
    updated 
    ? res.status(200).json(updated)
    : res.status(404).json({message: `Tweet id(${id}) not found`});
}

export async function removeTweet(req, res) {
    const id = req.params.id;
    const tweet = await tweetRepository.getById(id);
    if (!tweet) {
        res.sendStatus(404);
    }
    if (tweet.userId !== req.userId) {
        res.sendStatus(403);
    }

    await tweetRepository.remove(id);
    res.sendStatus(204);
}