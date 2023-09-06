const express = require('express');
const dotenv=require('dotenv');
const bodyparser = require('body-parser');
const port = process.env.PORT||8111;
const cors = require('cors');
const path=require('path');
const app = express();

app.use(cors())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname)));
app.use(cors())
const route = require('./Route/route');
app.use('/', route);
app.listen(port, (err) => {
    if (err) {
        console.log("Server Error");
    }
    console.log(`Server started at port ${port}.....`);
})