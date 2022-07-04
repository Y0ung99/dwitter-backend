import express, { Router } from 'express';
import 'express-async-errors';

let tweets = [
    {
        id: '1',
        text: '드림코딩 화이팅!',
        createdAt: Date.now().toString(),
        name: 'Bob',
        username: 'bob',
        url: 'asd'
    }
    ,
    {
        id: '2',
        text: '동영이 화이팅',
        createdAt: Date.now().toString(),
        name: 'Dy',
        username: 'dy',
        url: 'fgad'
    }
]

const router = express.Router();

router.get('/', (req, res, next) => {
    const username = req.query.username;
    console.log(username);
    const data = username 
    ? tweets.filter(tweet => tweet.username === username)
    : tweets;
    console.log(data);
    res.status(200).json(data);
})

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    const data = tweets.find(tweet => tweet.id === id);
    if(data) {
        res.status(200).json(data);
    } else {
        res.status(404).json({message: `Tweet id(${id}) not found`});
    }
})

router.post('/', (req, res, next) => {
    const {text, name, username} = req.body;
    const newTweet = {
        id: tweets.length + 1,
        text: text,
        createdAt: Date.now().toString(),
        name: name,
        username: username,
    }
    tweets = [newTweet, ...tweets];
    res.status(201).json(newTweet);
})

router.put('/:id', (req, res, next) => {
    const id = req.params.id;
    const newText = req.body.text;
    const tweet = tweets.find(tweet => tweet.id === id);
    if (tweet) {
        tweet.text = newText;
        res.status(200).json(tweet);
    } else {
        res.status(404).json({message: `Tweet id(${id}) not found`});
    }
}) 

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    tweets = tweets.filter(tweet => tweet.id !== id);
    res.sendStatus(204);
})

export default router;