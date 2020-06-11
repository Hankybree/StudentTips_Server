module.exports = function (app, database, accessToken, upload, fs) {

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

                                database.run('INSERT INTO sessions (sessionUserId, sessionToken) VALUES (?, ?)',
                                    [
                                        users[0].userId,
                                        token
                                    ]).then(() => {
                                        response.send(JSON.stringify({ token: token, message: 'Logged in', status: 1 }))
                                    })
                            } else {
                                response.send(JSON.stringify({ message:'Already logged in', status: 3 }))
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

    app.get('/sessions', (request, response) => {
        database.all('SELECT * FROM sessions')
            .then((sessions) => {
                response.send(sessions)
            })
    })
}