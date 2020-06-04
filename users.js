module.exports = function (app, database, upload, fs, uniqeId) {
    app.get('/users', (request, respose) => {
        database.all('SELECT * FROM users')
            .then(users => {
                let usersArr = []
                respose.send(usersArr)
            })
    })

    app.post('/users', (request, respose) => {
        console.log('hejhej')
        database.run('INSERT INTO users (userId, userName, userPassword, userAdmin, userImage, userDescription, userTags, userPins) VALUES (?,?,?,?,?,?,?,?)'
        [
            JSON.stringify(uniqeId),
            request.body.userName,
            request.body.passWord,
            request.body.Email,
            "No",
            "https://news.google.se/nwshp?hl=sv&tab=in",
            "No description",
            "[]",
            "[]"


        ])
            .then(() => {
                respose.send('user created')
            })
    })
}