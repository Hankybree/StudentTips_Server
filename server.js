const express = require('express')

const app = express()

app.use(express.json())

app.listen(12001, () => {
    console.log('Server running on port 12001')
})

app.get('/pins', (response, request) => {

})

app.post('/pins', (response, request) => {

})

app.patch('/pins/:pin', (response, request) => {

})

app.delete('/pins/:pin', (response, request) => {
    
})