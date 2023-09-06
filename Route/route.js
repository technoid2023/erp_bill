const spawn = require('child_process').spawn;
const axios = require('axios')
const express = require('express');
const route = express.Router();
const home = require('../API/routes/api_route');
const { request } = require('http');
route.use('/v1', home);

route.get('/',(req,res)=>{
    res.send('hello');
})
module.exports = route;
