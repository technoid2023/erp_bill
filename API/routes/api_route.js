const { request } = require('express');
const express = require('express');
const route = express.Router();
const path=require('path');
const multer=require('multer');


var stockStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/stock');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Corrected the typo here
    }
});


var uploadstock=multer({storage:stockStorage});
const verify = require('../../Middleware/authentication');
const control = require('../controller/controller');

//users
route.post('/login', control.ulogin)
route.post('/logout', verify, control.ulogout);
route.post('/register', control.uReg);

//Items

route.get('/item', verify, control.getItem);
route.post('/item/search/:cat', verify, control.getItembyCat);
route.put('/item/:id', verify, control.updateSingleItem);
route.delete('/item/:id', verify, control.deleteSingleItem);

//Stock


route.get('/stock', verify, control.getStock);
route.post('/stock/search/:cat', verify, control.getStockbyCat);
route.put('/stock/:id', verify, control.updateSingleStock);
route.delete('/stock/:id', verify, control.deleteSingleStock);


//add
route.post('/item/add', verify, control.addToItem);
route.post('/item/add/csv',uploadstock.single('file'),verify, control.importItem);

module.exports = route;

