const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())
app.use(cors())

app.listen(12001, () => {
    console.log('Server running on port 12001')
})

let pins = []
let database

sqlite
    .open({ driver: sqlite3.Database, filename: 'database.sqlite'})
    .then((database_) =>{
        database = database_
    })

app.get('/pins', (request, response) => {
    response.send(pins)
})

app.post('/pins', (request, response) => {

    database
      .run('INSERT INTO pins (pinTitle, pinDescription, pinImage, pinTags, pinCoordinates, pinUser) VALUES (?, ?, ?, ?, ?, ?)', [
          request.body.pinTitle,
          request.body.pinDescription,
          request.body.pinImage,
          JSON.stringify(request.body.pinTags),
          JSON.stringify(request.body.pinCoordinates),
          request.body.pinUser
    ])
      .then(() => {
        response.status(201).send(request.body)
      })
      .catch(error => {
          response.send(error)
      })
})

app.patch('/pins/:pin', (request, response) => {
    for (let i = 0; i < pins.length; i++) {
        if (request.params.pin === pins[i].pinId) {
            if (request.body.title !== undefined) {
                pins[i].title = request.body.title
            }
            if (request.body.description !== undefined) {
                pins[i].description = request.body.description
            }
            if (request.body.image !== undefined) {
                pins[i].image = request.body.image
            }
            if (request.body.tags !== undefined) {
                pins[i].tags = request.body.tags
            }
            if (request.body.coordinates !== undefined) {
                pins[i].coordinates = request.body.coordinates
            }
            if (request.body.distance !== undefined) {
                pins[i].distance = request.body.distance
            }
        }
    }
    response.send('Update complete')
})

app.delete('/pins/:pin', (request, response) => {
    for (let i = 0; i < pins.length; i++) {
        if (request.params.pin === pins[i].pinId) {
            pins.splice(i, 1)
        }
    }
    response.send('Pin deleted')
})