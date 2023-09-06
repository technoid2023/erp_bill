const express = require('express');

const db = require('../../Serivce/dboperation');
const csv=require('csvtojson');

let service = {};
service.ulogin = async (req, res) => {
    let data = req.body;
    try {
        let response = await db.ulogIn(data);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.ulogout = async (req, res) => {

    try {
        let response = await db.ulogOut(token);
        if (response) {
            res.json({ response });
        }
    } catch (err) {
        res.json(err)
    }
}
service.uReg = async (req, res) => {
    let data = req.body;
    try {
        let response = await db.userRegistration(data);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.getItem = async (req, res) => {
    let page = req.query.page;
    let limit = req.query.limit;
    try {
        let response = await db.allitem(page, limit);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.getItembyCat = async (req, res) => {
 
    let page = req.query.page;
    let limit = req.query.limit;
    
    let cat = req.params.cat;

    try {
        let response = await db.itembyCat(page, limit,cat);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
// service.importStock = async (req, res) => {
   
//     try {
//         let users=[];
//         csv().fromFile(req.file.path).then(async(response)=>{
//             // console.log(response);
//             for(var x=0;x<response.length;x++){
//                 users.push({
//                     item_code:response[x].Code,
//                     category:response[x].Category,
//                     sub_category:response[x].Sub_Category,
//                     purchase:response[x].Purchase,
//                     sale:response[x].Sale,
//                     stock:response[x].Purchase-response[x].Sale
//                 })
                
//             }
//             console.log(users);
//         let responsemsg = await db.importCsvtoStock(users);
//         if (responsemsg) {
//             res.json(responsemsg);
//         }
//         })
        
//     } catch (err) {
//         res.json(err)
//     }
// }
service.importItem = async (req, res) => {
   
    try {
        let decode=req.decode
        
        let items=[];
        let stock=[];
        csv().fromFile(req.file.path).then(async(response)=>{
            // console.log(response);
            for(var x=0;x<response.length;x++){
                items.push({
                    item_code:response[x].Code,
                    category:response[x].Category,
                    sub_category:response[x].Sub_Category,
                    model_no:response[x].Model_No,
                    serial_no:response[x].Serial_No,
                    brand:response[x].Brand,
                    sale_rate:response[x].Sale_Rate,
                    buy_rate:response[x].Buy_Rate,
                    status:response[x].Status,
                    size:response[x].Size,
                    supplier:response[x].Supplier,
                    bill_date:response[x].Bill_Date,
                    // issued_by:decode.name,
                    // issued_date:(new Date().toString()).slice(0, 15)
                 
                })
                
            }
            for(var x=0;x<response.length;x++){
                stock.push({
                    item_code:response[x].Code,
                    category:response[x].Category,
                    sub_category:response[x].Sub_Category,
                    purchase:response[x].Purchase,
                    sale:response[x].Sale,
                    stock:response[x].Purchase-response[x].Sale,
                  
                })
                
            }
            // console.log(users);
            
             let first=await db.importCsvtoStock(stock);
             if(first.length!=0){
                db.importCsvtoItem(items);
             }
            
        let responsemsg =1;
        if (responsemsg==1) {
            res.json({ Success: true, Message: "Imported" });
        }
        })
        
    } catch (err) {
        res.json({ Success: false, Message: "Failed" })
    }
}
service.addToItem = async (req, res) => {
    let data=req.body;
    let decode=req.decode

    try {
        let response = await db.createNewItem(data,decode);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.updateSingleItem = async (req, res) => {
    let data=req.body;
    let id = req.params.id;
    // console.log(ticket);

    try {
        let response = await db.updateItem(data, id);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.deleteSingleItem = async (req, res) => {
    // let data=req.body;
    let id = req.params.id;
    // console.log(ticket);

    try {
        let response = await db.deleteItem(id);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.addToStock = async (req, res) => {
    let data=req.body;
    let decode=req.decode

    try {
        let response = await db.createNewStock(data,decode);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.updateSingleStock = async (req, res) => {
    let data=req.body;
    let id = req.params.id;
    // console.log(ticket);

    try {
        let response = await db.updateStock(data, id);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.deleteSingleStock = async (req, res) => {
    // let data=req.body;
    let id = req.params.id;
    // console.log(ticket);

    try {
        let response = await db.deleteStock(id);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.getStock = async (req, res) => {
    let page = req.query.page;
    let limit = req.query.limit;
    try {
        let response = await db.allstock(page, limit);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
service.getStockbyCat = async (req, res) => {
 
    let page = req.query.page;
    let limit = req.query.limit;
    
    let cat = req.params.cat;

    try {
        let response = await db.stockbyCat(page, limit,cat);
        if (response) {
            res.json(response);
        }
    } catch (err) {
        res.json(err)
    }
}
module.exports = service;