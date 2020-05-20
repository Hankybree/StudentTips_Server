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

    request.body.id = uuidv4()
    pins.push(request.body)
    response.send('object created')
})

app.patch('/pins/:pin', (request, response) => {

})

app.delete('/pins/:pin', (request, response) => {
    console.log(request.params.pin)
    response.send('Pin deleted')
})