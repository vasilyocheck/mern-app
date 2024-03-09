import { body } from 'express-validator'

export const signUpValidation = [
    body('email', 'Incorrect email format').isEmail(),
    body('password', 'Password must be at least 5 characters long').isLength({min: 5}),
    body('fullName', 'Full name must be at least 3 characters long').isLength({min: 3}),
    body('avatarURL', 'Incorrect avatar URL').isURL().optional(),
]

export const loginValidation = [
    body('email', 'Incorrect email format').isEmail(),
    body('password', 'Password must be at least 5 characters long').isLength({min: 5}),
]