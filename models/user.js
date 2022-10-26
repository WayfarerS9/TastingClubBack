const db = require('./../settings/mysqlDb');

module.exports = db.connect((error) => {
    if (error) {
        console.log(error)
    }

    // let createUser = `CREATE TABLE IF NOT EXISTS users(id int primary key auto_increment, 
    //     email VARCHAR(255) NOT NULL, firstName VARCHAR(255) NOT NULL,
    //     lastName VARCHAR(255) NOT NULL, birthday VARCHAR(255) NOT NULL, createAt DATETIME(6) NULL)`

    // db.query(createUser, (error, result) => {
    //     if (error) {
    //         console.log(error)
    //     } else {
    //         console.log('table created')
    //     }
    // })
})

