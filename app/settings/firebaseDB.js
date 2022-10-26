const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { getAuth  } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyBjd97df1SS_zgjEQGSZAdIyBZw-Bc9HeM",
  authDomain: "tastingclub-2ce4b.firebaseapp.com",
  projectId: "tastingclub-2ce4b",
  storageBucket: "tastingclub-2ce4b.appspot.com",
  messagingSenderId: "192042035774",
  appId: "1:192042035774:web:c98c77ffadc1f2b55a7f6f",
  measurementId: "G-X6YPSEBF02",
  databaseURL: "https://tastingclub-2ce4b-default-rtdb.firebaseio.com"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
module.exports.auth = auth;
module.exports.database = database;
