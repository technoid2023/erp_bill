const mongoose = require('mongoose');
const dict = require('./dictionary.json');
let schemas = {};
let schema = mongoose.Schema;

schemas.userSchema = () => {
    let userschema = new schema(dict.user)
    return userschema;
}
schemas.jwtSchema = () => {
    let jwtschema = new schema(dict.jwt)
    return jwtschema;
}
schemas.itemSchema = () => {
    let itemschema = new schema(dict.item)
    return itemschema;
}
schemas.billSchema = () => {
    let billschema = new schema(dict.bill)
    return billschema;
},
schemas.stockSchema = () => {
    let stockschema = new schema(dict.stock)
    return stockschema;
}

module.exports = schemas;