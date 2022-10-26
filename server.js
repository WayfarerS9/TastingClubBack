const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;
const mysqlConnection = require('./settings/mysqlDb');


import { initializeApp } from "firebase/app";
// const createUser = require('./models/user');

app.use(cors());

mysqlConnection.connect((error) => {
    if (error) {
        return console.log('Ошибка подключения к БД');
    } else {
        return console.log('Подключение к БД успешно...')
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const route = require('./settings/routes');
route(app);

















const firebaseConfig = {
    apiKey: "AIzaSyBjd97df1SS_zgjEQGSZAdIyBZw-Bc9HeM",
    authDomain: "tastingclub-2ce4b.firebaseapp.com",
    projectId: "tastingclub-2ce4b",
    storageBucket: "tastingclub-2ce4b.appspot.com",
    messagingSenderId: "192042035774",
    appId: "1:192042035774:web:c98c77ffadc1f2b55a7f6f",
    measurementId: "G-X6YPSEBF02"
  };
  
  // Initialize Firebase
  const appp = initializeApp(firebaseConfig);









app.listen(port, '0.0.0.0', () => {
    console.log(`App listening on port ${port}`)
})
