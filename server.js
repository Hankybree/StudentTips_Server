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

app.get('/pins/:pin', (request, response) => {

    database.all('SELECT * FROM pins WHERE pinId = ?', [request.params.pin])
        .then((pins) => {
            
            pins[0].pinTags = JSON.parse(pins[0].pinTags)
            pins[0].pinCoordinates = JSON.parse(pins[0].pinCoordinates)

            response.send(pins[0])
        })
})

app.post('/pins', (request, response) => {

    database
        .run('INSERT INTO pins (pinTitle, pinDescription, pinImage, pinTags, pinCoordinates, pinUser) VALUES (?, ?, ?, ?, ?, ?)', 
        [
            request.body.pinTitle,
            request.body.pinDescription,
            request.body.pinImage,
            JSON.stringify(request.body.pinTags),
            JSON.stringify(request.body.pinCoordinates),
            request.body.pinUser
        ])
        .then(() => {

            response.status(201).send('Pin created')
        })
        .catch(error => {

            response.send(error)
        })
})

app.patch('/pins/:pin', (request, response) => {

    database.all('SELECT * FROM pins WHERE pinId = ?', [request.params.pin])
            .then((pins) => {

                let updatedPin = Object.assign(pins[0], request.body)

                database.run('UPDATE pins SET pinTitle = ?, pinDescription = ?, pinImage = ?, pinTags = ?, pinCoordinates = ? WHERE pinId = ?',
                    [
                        updatedPin.pinTitle, 
                        updatedPin.pinDescription,
                        updatedPin.pinImage,
                        JSON.stringify(updatedPin.pinTags),
                        JSON.stringify(updatedPin.pinCoordinates),
                        updatedPin.pinId
                    ])
                    .then(() => {
                        
                        response.send('Pin updated')
                    })
            })
})

app.delete('/pins/:pin', (request, response) => {

    database.run('DELETE FROM pins WHERE pinId=?', [request.params.pin])
        .then(() => {

            response.send('Pin deleted')
        })
})
