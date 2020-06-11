const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const nodemailer = require('nodemailer');
require('dotenv').config()
const mail = process.env['MAIL_USER'];
const pass = process.env['MAIL_PASS']

const multer = require('multer')
const upload = multer({
    dest: 'uploads/',
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
})
const fs = require('fs')

const app = express()

const pins = require('./pins.js')
const users = require('./users.js')

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))



app.listen(12001, () => {
    console.log('Server running on port 12001')
})

var database

const authenticate = function (token) {
    return new Promise((resolve, reject) => {
        if (token) {

            database.all('SELECT * FROM sessions WHERE sessionToken=?', [token])
                .then((sessions) => {
                    if (!sessions[0]) {
                        resolve(-1)
                    } else {
                        resolve(sessions[0].sessionUserId)
                    }
                })

        } else {

            resolve(-1)
        }
    })
}
const sendConfirmation = function(mailAddress) {
    const transporter = nodemailer.createTransport({
        //service: 'gmail'
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: mail,
            pass: pass
        }
    })
    const mailOptions = {
        from: mail,
        to: [mailAddress],
        subject: 'Welcome to TipTop!',
        text: 'Hello! This is a confirmation e-mail :)'
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            response.send(error);
        } else {
            response.send('Email sent: ' + info.response)
        }
    })
}

sqlite
    .open({ driver: sqlite3.Database, filename: 'database.sqlite' })
    .then((database_) => {

        database = database_
        pins(app, database, upload, fs, authenticate)
        users(app, database, { v4: uuidv4 }, upload, fs, authenticate, sendConfirmation)
    })
