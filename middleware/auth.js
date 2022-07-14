import jwt from 'jsonwebtoken';
import * as userRepository from '../data/auth.js';

const AUTH_ERROR = { message: 'Authentication Error'};

export const isAuth = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!(authHeader && authHeader.startsWith('Bearer '))) {
        return res.status(401).json(AUTH_ERROR);
    }
    // const webUserId = req.params.id;
    // console.log(webUserId);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        'wKmLs4jpEO3H5KDMzX@7dAK7geBeEC#r',
        async (error, decoded) => {
            if (error) {
                return res.status(401).json(AUTH_ERROR);
            }
            const user = await userRepository.findById(decoded.id);
            if (!user) {
                return res.status(401).json(AUTH_ERROR);
            }
            // if (webUserId) {
            //     const webUser = await userRepository.findById(webUserId);
            //     if (user.id !== webUser.id) return res.status(401).json(AUTH_ERROR);
            // }
            req.userId = user.id // req.customdata
            next();
        }
    )
}
