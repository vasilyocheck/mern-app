import { body } from 'express-validator'

export const createPostValidation = [
    body('title', 'Title of the post is required').isLength({min: 3}).isString(),
    body('text', 'Text of the post is required').isLength({min: 10}).isString(),
    body('tags', 'Incorrect format of tags ()').optional().isString(),
    body('imageURL', 'Incorrect link for the image').optional().isString()
]