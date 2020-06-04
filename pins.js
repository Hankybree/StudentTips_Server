module.exports = function (app, database, upload, fs) {
    app.get('/pins', (request, response) => {

        database.all('SELECT * FROM pins;').then(pins => {

            let pinArray = []

            for (let i = 0; i < pins.length; i++) {

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

    app.post('/pins', upload.single('pinImage'), (request, response) => {

        let pinImagePath

        if (request.file !== undefined) {
            pinImagePath = 'http://116.203.125.0:12001/' + request.file.path
        }

        database
            .run('INSERT INTO pins (pinTitle, pinDescription, pinImage, pinTags, pinCoordinates, pinUser) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    request.body.pinTitle,
                    request.body.pinDescription,
                    pinImagePath,
                    request.body.pinTags,
                    request.body.pinCoordinates,
                    request.body.pinUser
                ])
            .then(() => {

                response.status(201).send('Pin created')
            })
            .catch(error => {

                response.send(error)
            })
    })

    app.patch('/pins/:pin', upload.single('pinImage'), (request, response) => {

        database.all('SELECT * FROM pins WHERE pinId = ?', [request.params.pin])
            .then((pins) => {

                if (request.file !== undefined) {

                    if (pins[0].pinImage !== null) {
                        const imgUrl = pins[0].pinImage.replace('http://116.203.125.0:12001/', '')

                        fs.unlink(imgUrl, () => {
                            console.log('file deleted')
                        })
                    }
                    const pinImagePath = 'http://116.203.125.0:12001/' + request.file.path
                    pins[0].pinImage = pinImagePath
                    
                } else {
                    
                    // request.body.pinImage === 'null' is a string because client can't send null as a value
                    if (request.body.pinImage === 'null' && pins[0].pinImage !== null) {
    
                        const imgUrl = pins[0].pinImage.replace('http://116.203.125.0:12001/', '')
    
                        fs.unlink(imgUrl, () => {
                            console.log('file deleted')
                        })

                        request.body.pinImage = null
                    }
                }

                pins[0].pinTags = JSON.parse(pins[0].pinTags)
                pins[0].pinCoordinates = JSON.parse(pins[0].pinCoordinates)

                let updatedPin = Object.assign(pins[0], request.body)

                database.run('UPDATE pins SET pinTitle = ?, pinDescription = ?, pinImage = ?, pinTags = ?, pinCoordinates = ? WHERE pinId = ?',
                    [
                        updatedPin.pinTitle,
                        updatedPin.pinDescription,
                        updatedPin.pinImage,
                        updatedPin.pinTags,
                        updatedPin.pinCoordinates,
                        updatedPin.pinId
                    ])
                    .then(() => {

                        response.send('Pin updated')
                    })
            })
    })

    app.delete('/pins/:pin', (request, response) => {

        database.all('SELECT * FROM pins WHERE pinId=?', [request.params.pin])
            .then((pins) => {

                database.run('DELETE FROM pins WHERE pinId=?', [request.params.pin])
                    .then(() => {

                        if (pins[0].pinImage !== undefined && pins[0].pinImage !== null) {

                            const imgUrl = pins[0].pinImage.replace('http://116.203.125.0:12001/', '')

                            fs.unlink(imgUrl, () => {
                                console.log('file deleted')
                            })
                        }

                        response.send('Pin deleted')
                    }).catch(error => {

                        response.send(error)
                    })
            })
    })
}  