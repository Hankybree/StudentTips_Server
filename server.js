const express = require('express')
const { v4: uuidv4 } = require('uuid')


const app = express()


app.use(express.json())

app.listen(12001, () => {
    console.log('Server running on port 12001')
})

let pins = []

app.get('/pins', (request, response) => {
    response.send(pins)
})

app.post('/pins', (request, response) => {

    request.body.pinId = uuidv4()
    pins.push(request.body)
    response.send('object created')
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