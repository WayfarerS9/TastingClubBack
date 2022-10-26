const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


const route = require('./routes');
route(app);

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening on port ${port}`)
})

