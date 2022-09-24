export class AuthController {
    constructor(userRepository, jwt, bcrypt, config) {
        this.userRepository = userRepository;
        this.jwt = jwt;
        this.bcrypt = bcrypt;
        this.config = config;
    }
    signUp = async (req, res) => {
        const { username, password, name, email, url } = req.body;
        const found = await this.userRepository.findByUsername(username);
        if (found) {
            return res.status(409).json({message: `${username} already exists`});
        }
        const hashed = await this.bcrypt.hash(password, this.config.bcrypt.saltRounds);
        const user = await this.userRepository.createUser({
            username,
            password: hashed,
            name,
            email,
            url
        })
        const token = this.createJwtToken(user);
        res.status(201).json({token, username});
    }
    
    logIn = async (req, res) => {
        const {username, password} = req.body;
        const user = await this.userRepository.findByUsername(username);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid user or password'});
        }
        const isValidPassword = await this.bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid user or password'});
        }
        const token = this.createJwtToken(user.id);
        res.status(200).json( {token, username});
    }
    
    me = async (req, res) => {
        const user = await this.userRepository.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found'});
        }
        res.status(200).json({ token: req.token, username: user.username})
    }
    
    createJwtToken = (id) => {
        return this.jwt.sign({id}, this.config.jwt.secretKey, {expiresIn: this.config.jwt.expiresInSec});
    }
}