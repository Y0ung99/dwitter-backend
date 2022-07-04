import * as tweetRepository from '../data/data.js';

export function getTweets(req, res) {
    const username = req.query.username;
    const data = username 
    ? tweetRepository.getByUsername(username)
    : tweetRepository.getAll();
    res.status(200).json(data);
}

export function getTweetsById(req, res) {
    const id = req.params.id;
    const data = tweetRepository.getById(id);
    data 
    ? res.status(200).json(data)
    : res.status(404).json({message: `Tweet id(${id}) not found`});
}

export function createTweet(req, res) {
    const {text, name, username} = req.body;
    const newTweet = tweetRepository.create(text, name, username);
    res.status(201).json(newTweet);
}

export function updateTweet(req, res) {
    const id = req.params.id;
    const newText = req.body.text;
    const tweet = tweetRepository.update(newText, id);
    tweet 
    ? res.status(200).json(tweet)
    : res.status(404).json({message: `Tweet id(${id}) not found`});
}

export function removeTweet(req, res) {
    const id = req.params.id;
    tweetRepository.remove(id);
    res.sendStatus(204);
}