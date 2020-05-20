const express = require('express')

const app = express()

app.use(express.json())

app.listen(12001, () => {
    console.log('Server running on port 12001')
})