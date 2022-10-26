const mysql = require('mysql2');
const config = require('./../config/mysqlConfig');

const connection = mysql.createConnection({
    host: config.HOST,
    user: config.DBUSER,
    password: config.DBPASSWORD,
    database: config.DBNAME
})

module.exports = connection;