import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { configDotenv } from "dotenv";
configDotenv()

import {createPostValidation} from "./validations/posts.js";
import { UserController, PostController } from "./controllers/index.js";
import {login} from "./controllers/user-controller.js";
import handleValidationErrors from "./utils/handle-validation-errors.js";
import checkAuth from "./utils/check-auth.js";
import {loginValidation, signUpValidation} from "./validations/auth.js";

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('DB is connected')
})
    .catch((e) => {
    console.log('DB error')
})

const app = express()

app.use(express.json())
app.use('/uploads', express.static('uploads'))

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})


app.post('/auth/login', loginValidation, handleValidationErrors, login)
app.post('/auth/signup', signUpValidation, handleValidationErrors, UserController.signUp)
app.get('/auth/me', checkAuth ,UserController.authMe)

app.get('/posts', PostController.getAllPosts)
app.get('/posts/:id', PostController.getPostById)
app.post('/posts', checkAuth, createPostValidation, handleValidationErrors, PostController.createPost)
app.delete('/posts/:id', checkAuth, PostController.removePost)
app.patch ('/posts/:id', checkAuth, handleValidationErrors, PostController.updatePost)

app.listen(process.env.PORT || 4444, (e) => {
    if(e){
        return console.log(e)
    }
    console.log('Server is OK')
})