module.exports = function (app, database, accessToken, upload, fs, authenticate, sendConfirmation) {

    app.post('/signup', upload.single('userImage'), (request, response) => {

        let userImagePath

        if (request.file !== undefined) {
            userImagePath = 'http://116.203.125.0:12001/' + request.file.path
        }

        database.all('SELECT * FROM users WHERE userName=?', [request.body.userName])
            .then((users) => {

                if (users[0] === undefined) {

                    database.run('INSERT INTO users (userName, userPassword, userAdmin, userImage, userDescription, userTags, userPins, userEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            request.body.userName,
                            request.body.userPassword,
                            'false',
                            userImagePath,
                            '',
                            '[]',
                            '[]',
                            request.body.userEmail
                        ]).then(() => {
                            sendConfirmation(request.body.userEmail)
                            response.status(201).send(JSON.stringify({ message: 'Created', status: 1 }))
                        })
                } else {
                    response.send(JSON.stringify({ message: 'Username is already in use', status: 2 }))
                }
            })
    })

    app.post('/login', (request, response) => {

        database.all('SELECT * FROM users WHERE userName=?', [request.body.userName])
            .then((users) => {

                if (users[0] === undefined) {
                    response.send(JSON.stringify({ message: 'Incorrect username or password', status: 2 }))
                    return
                }

                if (users[0].userPassword === request.body.userPassword) {

                    database.all('SELECT * FROM sessions WHERE sessionUserId=?', [users[0].userId])
                        .then((sessions) => {
                            if (sessions[0] === undefined) {

                                const token = accessToken.v4()
                                const userId = users[0].userId

                                database.run('INSERT INTO sessions (sessionUserId, sessionToken) VALUES (?, ?)',
                                    [
                                        userId,
                                        token
                                    ]).then(() => {
                                        response.send(JSON.stringify({ user: userId, token: token, message: 'Logged in', status: 1 }))
                                    })
                            } else {
                                response.send(JSON.stringify({ message: 'Already logged in', status: 3 }))
                            }
                        })
                } else {
                    response.send(JSON.stringify({ message: 'Incorrect username or password', status: 2 }))
                }
            })
    })

    app.delete('/logout', (request, response) => {

        if (request.get('Token')) {

            database.run('DELETE FROM sessions WHERE sessionToken=?', [request.get('Token')])
                .then(() => {
                    response.send(JSON.stringify({ message: 'Logged out', status: 1 }))
                })

        } else {
            response.send(JSON.stringify({ message: 'You are not logged in', status: 2 }))
        }
    })

    app.get('/session', (request, response) => {
        database.all('SELECT * FROM sessions WHERE sessionToken=?', [request.get('Token')])
            .then((sessions) => {
                response.send(sessions[0])
            })
    })

    // Only for testing

    app.get('/users', (request, response) => {

        database.all('SELECT * FROM users')
            .then((users) => {

                for (let i = 0; i < users.length; i++) {
                    users[i].userAdmin = JSON.parse(users[i].userAdmin)
                    users[i].userTags = JSON.parse(users[i].userTags)
                    users[i].userPins = JSON.parse(users[i].userPins)
                }

                response.send(users)
            })
    })

    app.get('/users/:user', (request, response) => {

        database.all('SELECT * FROM users WHERE userId=?', [request.params.user])
            .then((users) => {
                let user = {}

                user.userName = users[0].userName
                user.userImage = users[0].userImage

                response.send(user)
            })

    })

    app.get('/sessions', (request, response) => {
        database.all('SELECT * FROM sessions')
            .then((sessions) => {
                response.send(sessions)
            })
    })

    app.delete('/users', (request, response) => {

        authenticate(request.get('Token'))
            .then((user) => {
                if (user !== -1) {
                    database.all('SELECT * FROM users WHERE userId=?', [user])
                        .then((users) => {

                            database.run('DELETE FROM users WHERE userId=?', [user])
                                .then(() => {

                                    if (users[0].pinImage !== undefined && users[0].pinImage !== null) {

                                        const imgUrl = users[0].userImage.replace('http://116.203.125.0:12001/', '')

                                        fs.unlink(imgUrl, () => {
                                            console.log('file deleted')
                                        })
                                    }

                                    database.run('DELETE FROM sessions WHERE sessionToken=?', [request.get('Token')])
                                        .then(() => {
                                            response.send(JSON.stringify({ message: 'User deleted', status: 1 }))
                                        })
                                }).catch(error => {

                                    response.send(error)
                                })
                        })
                } else {
                    response.send(JSON.stringify({ message: 'Unauthorized', status: 2 }))
                }
            })
    })
}