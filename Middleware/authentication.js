const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const sch = require('../Table/schema');
function connect() {
    const url = "mongodb+srv://technoidkolkata:technoid123@cluster0.iivynkd.mongodb.net/";
    const connection = mongoose.createConnection(url,
        { useNewUrlParser: true, useUnifiedTopology: true })
    return connection;
}
async function verify(req, res, next) {
    let token = req.headers.token;
    // console.log("auth token",token);
    try {
        let decode = jwt.verify(token, "SECRETKEY");
        req.decode = decode;
        let conn = connect();
        let coll = conn.useDb('RSEN')
        let jwtModel = coll.model("jwts", sch.jwtSchema())
        let validtoken = await jwtModel.find({ token: token });
        // console.log(validtoken);
        conn.close();
        if (decode.name === validtoken[0].name) {
            if (validtoken[0].logout == false) {
                // console.log("to next");
                next();
            }
            else {
                res.json({ Success: false, Message: "Already Logout" })
            }
        }
    } catch (err) {
        // console.log(token);
        res.json({ Success: false, Message: err })
    }
}
module.exports = verify;