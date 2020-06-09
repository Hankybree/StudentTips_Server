module.exports = function (app, database, uniqeId) {
    let usersArr = []
    app.get('/users', (request, response) => {
        if (request.query.userUuid) {
            database.all('SELECT * FROM users WHERE userUuid = ?', request.query.userUuid)
                .then(() => {
                    for (let i = 0; i < usersArr.length; i++) {
                        if (usersArr[i].userUuid === request.query.userUuid) {
                            response.send('Hello ' + usersArr[i].userName)
                            //Signd in
                        }
                    }

                })
        }
        else {
            database.all('SELECT * FROM users')
                .then(response.send(usersArr))
                .catch(error => {

                    response.send(error)
                })
        }

    })

    app.post('/users', (request, response) => {
        database.run('INSERT INTO users (userUuid,userName, userPassword, userEmail, userAdmin, userImage, userDescription, userTags, userPins) VALUES (?,?,?,?,?,?,?,?,?)',
            [
                request.body.userUuid = uniqeId.v4(),
                request.body.userName,
                request.body.userPassword,
                request.body.userEmail,
                request.body.userAdmin,
                request.body.userImage,
                request.body.userDescription,
                request.body.userTags,
                request.body.userPins
            ])
            .then(() => {
                response.status(201).send('User created')
                usersArr.push(request.body)
            })
            .catch(error => {
                response.send({ stat: error, message: error.message })
            })
    })
}