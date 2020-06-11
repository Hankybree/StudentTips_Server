const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

var multer = require('multer')
var upload = multer({
    dest: 'uploads/',
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
})
var fs = require('fs')
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

sqlite
    .open({ driver: sqlite3.Database, filename: 'database.sqlite' })
    .then((database_) => {

        database = database_

        pins(app, database, upload, fs)
        users(app, database, { v4: uuidv4 }, upload, fs)
    })
