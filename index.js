import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { configDotenv } from "dotenv";
import bodyParser from "body-parser";
configDotenv()

import {createPostValidation} from "./validations/posts.js";
import { UserController, PostController } from "./controllers/index.js";
import {login} from "./controllers/user-controller.js";
import handleValidationErrors from "./utils/handle-validation-errors.js";
import checkAuth from "./utils/check-auth.js";
import {loginValidation, signUpValidation} from "./validations/auth.js";
import nodemailer from "nodemailer";

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('DB is connected')
})
    .catch((e) => {
    console.log('DB error', e)
})

const app = express()

app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

app.get("/", (req, res) => res.send("Express on Vercel"));

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

app.post('/send-email', (req, res) => {
    const { name, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        pull: true,
        auth: {
            user: process.env.EMAIL, // ваш email на mail.ru
            pass: process.env.PASS // ваш пароль от email
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: subject,
        html: `
            <p>From ${name}</p>
            <p>Subject: ${subject}</p>
            <p>Message: ${message}</p>
        `
};

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending Email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent successfully');
        }
    });
    console.log('Check status')
});
app.listen(process.env.PORT || 4444, (e) => {
    if(e){
        return console.log(e)
    }
    console.log('Server is OK')
})