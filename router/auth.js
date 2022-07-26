import express, { Router } from 'express';
import 'express-async-errors';
import * as authController from '../controller/authlogic.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();


const validateCredential = [
    body('username')
    .trim()
    .notEmpty()
    .withMessage('username should be at least 5 characters'),
    body('password')
    .trim()
    .isLength({min:5})
    .withMessage('password should be at least 5 characters'),
    validate,
];
const validateSignup = [
    ...validateCredential,
    body('name').notEmpty().withMessage('name is missing'),
    body('email').isEmail().normalizeEmail().withMessage('invalid Email'),
    body('url')
    .isURL()
    .withMessage('invalid URL')
    .optional({nullable: true, checkFalsy: true}),
    validate,
];

router.post('/login', validateCredential, authController.logIn);
router.post('/signup', validateSignup, authController.signUp);
router.get('/me', isAuth, authController.me);

export default router;