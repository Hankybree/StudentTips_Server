const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs')

const app = express()

const pins = require('./pins.js')

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
        pins(app, database, upload,fs)
    })