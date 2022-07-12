import * as userRepository from '../data/auth.js';

let tweets = [
    {
        id: '1',
        text: '드림코딩 화이팅!',
        createdAt: new Date().toString(),
        userId: '1'
    }
    ,
    {
        id: '2',
        text: '동영이 화이팅',
        createdAt: new Date().toString(),
        userId: '2'
    }
]

export async function getAll() {
    return Promise.all(
        tweets.map(async tweet => {
            const { username, name, url } = await userRepository.findById(
                tweet.userId
            )
            return {...tweet, username, name, url};
        })
    )
}

export async function getByUsername(username) {
    return getAll().then(tweets => 
        tweets.filter(tweet => tweet.username === username))
}

export async function getById(id) {
    const found = tweets.find(tweet => tweet.id === id);
    if (!found) {
        return null;
    }
    const { username, name, url } = await userRepository.findById(found.userId);
    return {...found, username, name, url};
}

export async function create(text, userId) {
    const newTweet = {
        id: tweets.length + 1,
        text,
        createdAt: new Date(),
        userId,
    }
    tweets = [newTweet, ...tweets];
    return getById(newTweet.id);
}

export async function update(text, id) {
    const tweet = tweets.find(tweet => tweet.id === id);
    if (tweet) {
        tweet.text = text; 
    } 
    return getById(tweet.id);
}

export async function remove(id) {
    tweets = tweets.filter(tweet => tweet.id !== id);
}