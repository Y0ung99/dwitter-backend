export class TweetController {
    constructor(tweetRepository, getSocket) {
        this.tweets = tweetRepository;
        this.getSocket = getSocket;
    }

    getTweets = async (req, res) => {
        const username = req.query.username;
        const data = await (username 
        ? this.tweets.getByUsername(username)
        : this.tweets.getAll());
        res.status(200).json(data);
    }
    
    getTweetsById = async (req, res) => {
        const id = req.params.id;
        const data = await this.tweets.getById(id);
        data 
        ? res.status(200).json(data)
        : res.status(404).json({message: `Tweet id(${id}) not found`});
    }
    
    createTweet = async (req, res) => {
        const {text} = req.body;
        const newTweet = await this.tweets.create(text, req.userId);
        res.status(201).json(newTweet);
        this.getSocket().emit('tweets', newTweet);
    }
    
    updateTweet = async (req, res) => {
        const id = req.params.id;
        const newText = req.body.text;
        const tweet = await this.tweets.getById(id);
        if (!tweet) {
            return res.sendStatus(404);
        }
        if (tweet.userId !== req.userId) {
            return res.sendStatus(403);
        }
    
        const updated = await this.tweets.update(newText, id);
        updated 
        ? res.status(200).json(updated)
        : res.status(404).json({message: `Tweet id(${id}) not found`});
    }
    
    removeTweet = async (req, res) => {
        const id = req.params.id;
        const tweet = await this.tweets.getById(id);
        if (!tweet) {
            return res.sendStatus(404);
        }
        if (tweet.userId !== req.userId) {
            return res.sendStatus(403);
        }
    
        await this.tweets.remove(id);
        res.sendStatus(204);
    }
}