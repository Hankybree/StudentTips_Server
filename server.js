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

let database

sqlite
    .open({ driver: sqlite3.Database, filename: 'database.sqlite' })
    .then((database_) => {
        database = database_
    })

app.get('/pins', (request, response) => {
    database.all('SELECT * FROM pins;').then(pins => {

        let pinArray = []

        for(let i = 0; i < pins.length; i++) {
            
            let pinObject = {
                pinId: pins[i].pinId,
                pinTitle: pins[i].pinTitle,
                pinDescription: pins[i].pinDescription,
                pinImage: pins[i].pinImage,
                pinTags: JSON.parse(pins[i].pinTags),
                pinCoordinates: JSON.parse(pins[i].pinCoordinates),
                pinUser: pins[i].pinUser
            }

            pinArray.push(pinObject)
        }
        
        response.send(pinArray)
    })
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
    database.run('DELETE FROM pins WHERE pinId=?', [request.params.pin])
        .then(() => {
            response.send('Delete request executed')
        })
})
