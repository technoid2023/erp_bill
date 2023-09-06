const jwt = require("jsonwebtoken");
const sch = require('../Table/schema')
const mongoose = require('mongoose');
const axios = require('axios');
const { log } = require("console");
const spawn = require('child_process').spawn;
function connect() {
    const url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0";
    const connection = mongoose.createConnection(url,
        { useNewUrlParser: true, useUnifiedTopology: true })
    return connection;
}
let operation = {};


operation.ulogIn = async (data) => {
    // console.log(data);
    return new Promise(async (resolve, reject) => {

        let conn = connect();
        let coll = conn.useDb('RSEN');
        let userModel = coll.model("users", sch.userSchema());
        const user = await userModel.find({ emp_code: data.code, password: data.password }, { _id: 0, password: 0 });
        console.log(user);
        if (user.length != 0) {
            let coll1 = conn.useDb('RSEN');
            let jwtModel = coll1.model("jwts", sch.jwtSchema());
            let jwtData = {
                name: user[0].name,
                Built_Time: new Date()
            }
            let token = jwt.sign(jwtData, "SECRETKEY", { expiresIn: "1h" });
            await jwtModel.insertMany({ token: token, name: user[0].name, Built_Time: new Date(), logout: false })
            conn.close();

            resolve({ Success: true, Message: "Login Successfull", Token: token, Data: user })
        }
        reject({ Success: false, Message: "No User Found" })
    });
};
operation.ulogOut = async (token) => {
    // console.log(token);
    return new Promise(async (resolve, reject) => {
        let conn = connect()
        let coll = conn.useDb('RSEN')
        let jwtModel = coll.model("jwts", sch.jwtSchema())
        let updatedtoekn = await jwtModel.updateOne(
            { token: token },
            { $set: { logout: true } },
            { upsert: false }
        );
        if (updatedtoekn.modifiedCount != 0) {
            resolve({ Success: true, Message: "Logged Out Successfully" });
        } else {
            reject({ Success: false, Message: "Already Logged Out" });
        }
    });
};
operation.userRegistration = async (data) => {
    return new Promise(async (resolve, reject) => {
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let userModel = coll.model("users", sch.userSchema())
        try {
            let user = await userModel.insertMany(data);
            if (user.length != 0) {
                resolve({ Sccess: true, Message: "User Registered Succesfully", UserID: user[0].Email })
            }
        } catch (err) {
            reject({ Success: false, Message: "Registration Failed.", Error: "Employee Code Already Registered" })
        }


    })
}
operation.allitem = async (page, limit) => {
    // console.log('ooo');
    return new Promise(async (resolve, reject) => {
        let skipElements = page != undefined ? (page - 1) * limit : 0;
        let limitTo = limit != undefined ? limit : 20;
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());
        console.log(itemModel);
        let itemData = await itemModel.find({ deleted: false }, { deleted: 0, __v: 0 }, { skip: skipElements, limit: limitTo });
        // console.log(itemData);
        conn.close();
        if (itemData.length != 0) {
            resolve({
                Success: true, Data: itemData, pagination: {
                    page: page != undefined ? page : 1, limit: limit != undefined ? limit : 20
                }
            })
        }
        else {
            reject({ Success: false, Message: "DB operation failed" })
        }
    })
}
operation.itembyCat = async (page, limit, cat) => {
    console.log(cat)
    return new Promise(async (resolve, reject) => {
        let skipElements = page != undefined ? (page - 1) * limit : 0;
        let limitTo = limit != undefined ? limit : 20;
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());
        let itemData = await itemModel.find({ category: cat, deleted: false }, { deleted: 0, __v: 0 }, { skip: skipElements, limit: limitTo });
        if (itemData.length != 0) {
            resolve({
                Success: true, Data: itemData, pagination: {
                    page: page != undefined ? page : 1, limit: limit != undefined ? limit : 20
                }
            })
        }
        else {
            reject({ Success: false, Message: "DB operation failed" })
        }
    })
}
operation.importCsvtoStock = async (stock) => {
   
    return new Promise(async (resolve, reject) => {
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel1 = coll.model("stocks", sch.stockSchema());
        let existingItem=[];
        let newItem=[]

        for (i of stock){
            
            let previtemData=await itemModel1.find({ item_code: i.item_code}, { deleted: 0, __v: 0 })
            if(previtemData.length==0){
                newItem.push(i)
                 //
             }
            else{
             existingItem.push(i)
            }
        }
        
        for(i of newItem){
            i.purchase=+(i.purchase)
            i.stock=+(i.purchase),
            i.sale=0
            await itemModel1.insertMany(i)
        }
        for(i of existingItem){
            i.purchase=+(i.purchase)
            i.stock=0,
            i.sale=0
            // await itemModel1.insertMany(i)
        }
            
        for(i in existingItem){
            let oldData=await itemModel1.find({ item_code: existingItem[i].item_code}, { deleted: 0, __v: 0 })
            console.log(oldData);
            let p=(oldData[0].purchase)+(existingItem[i].purchase)
                let s=(oldData[0].sale)
                let st=p-s
                existingItem[i].purchase=p
                existingItem[i].sale=s
                existingItem[i].stock=st
        }
            console.log(newItem);
          
            for(i of existingItem){
               
              await  itemModel1.updateOne({ item_code: i.item_code }, { $set: i })
            }
            // await itemModel1.updateOne({ _id: previtemData[0].id }, { $set: stock })
        
        // let data = await userModel.insertMany(stock);

        conn.close();
        let f=1
        if (f==1) {
            resolve({ Success: true, Message: "Imported" })
        }
        else {
            reject({ Success: false, Message: "Failed" })
        }
    })
}
operation.importCsvtoItem = async (items) => {
    
    return new Promise(async (resolve, reject) => {
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());
        let existingItem=[];
        let newItem=[];
       
        for(i of items){
            i.sale_rate=+(i.sale_rate)
            i.buy_rate=+(i.buy_rate)
            i.serial_no=+(i.serial_no)
            i.status=i.status=='TRUE'?true:false
        }
        // console.log(items);
        for(i of items){
            let previtem=await itemModel.find({ serial_no: i.serial_no }, { deleted: 0, __v: 0 });
           
            if(previtem.length==0){
               newItem.push(i)
                //
            }
           else{
            existingItem.push(i)
           }
               
            //   await itemModel.updateOne({ _id: previtem[0].id }, { $set: items })
            
        }
    //     console.log(existingItem);
    //    console.log(newItem);
       await itemModel.insertMany(newItem)
    //    console.log(x);
 
    
    
        
        for(i of existingItem){
            // console.log(i);
          await  itemModel.updateOne({ serial_no: i.serial_no }, { $set: i })
        }
        
        // if(previtem.length==0){
        //     console.log("item insert");
        //     console.log(items);
        //     // await itemModel.insertMany(items);
        // }
        // else{
        //     console.log("item update");
        // //   await itemModel.updateOne({ _id: previtem[0].id }, { $set: items })
        // }
        // let data = await userModel.insertMany(items);

        conn.close();
       
    })
}
operation.createNewItem = async (data, decode) => {
    return new Promise(async (resolve, reject) => {
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());
        let previtem=await itemModel.find({ serial_no: data.serial_no }, { deleted: 0, __v: 0 });
        console.log( previtem.length);
        let itemData = {
            category: data.category,
            sub_category: data.sub_category,
            size: data.size,
            item_code: data.item_code,
            brand: data.brand,
            model_no: data.brand,
            serial_no: data.serial_no,
            sale_rate: data.sale_rate,
            buy_rate: data.buy_rate,
            issued_date: (new Date().toString()).slice(0, 15),
            issued_by: decode.name,
            status: data.status,
            supplier:data.supplier,
            bill_date:data.bill_date
        }
        if(previtem.length==0){
            await itemModel.insertMany(itemData);
        }
        else{
            
            await itemModel.updateOne({ _id: previtem[0].id }, { $set: itemData })
        }
    

        
        let conn1 = connect();
        let coll1 = conn1.useDb('RSEN');
        let itemModel1 = coll1.model("stocks", sch.stockSchema());
        let previtemData=await itemModel1.find({ item_code: data.item_code}, { deleted: 0, __v: 0 });
       
        let itemData1 = {
            item_code: data.item_code,
            category: data.category,
            sub_category: data.sub_category,
            purchase: data.purchase,
            sale: 0,
            stock: data.purchase
        }
        if(previtemData.length==0){
            await itemModel1.insertMany(itemData1);

        }
        else{
            let p=previtemData[0].purchase+data.purchase
            let s=previtemData[0].sale
            let st=p-s
            console.log('---------------');
            console.log(p);
            console.log(s);
            console.log(st);
            console.log('-----------------');
           
            let itemData2 = {
                item_code: data.item_code,
                category: data.category,
                sub_category: data.sub_category,
                purchase: p,
                sale:s,
                stock:st
            }
            await itemModel1.updateOne({ _id: previtemData[0].id }, { $set: itemData2 })
        }
        
        conn.close();
        conn1.close();
        f=1
        if (f==1) {
            resolve({ Success: true, Message: "Stock Added" })
        }
        else {
            reject({ Success: false, Message: "NO ORDERS" })
        }
    })
}
operation.updateItem = async (data, id) => {
    // console.log(ticket);

    return new Promise(async (resolve, reject) => {

        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());

        let update_response = await itemModel.updateOne({ _id: id }, { $set: data });

        conn.close();
        if (update_response.modifiedCount != 0) {
            resolve({ Success: true, Message: "Items Updated" })
        }
        else {
            reject({ Success: false, Message: "NO Items" })
        }
    })
}
operation.deleteItem = async (id) => {


    return new Promise(async (resolve, reject) => {

        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());

        let update_response = await itemModel.deleteOne({ _id: id });
        // console.log(update_response);
        conn.close();
        if (update_response.deletedCount != 0) {
            resolve({ Success: true, Message: "Item Deleted" })
        }
        else {
            reject({ Success: false, Message: "NO Items" })
        }
    })
}

// operation.createNewStock = async (data, decode) => {
//     return new Promise(async (resolve, reject) => {
//         let conn = connect();
//         let coll1 = conn.useDb('RSEN');
//         let itemModel1 = coll1.model("stocks", sch.stockSchema());
//         let itemData1 = {
//             item_code: data.item_code,
//             category: data.category,
//             sub_category: data.sub_category,
//             purchase: data.purchase,
//             sale: data.sale,
//             stock: purchase-sale

//         }
//         let newOrder1 = await itemModel1.insertMany(itemData1);

//         conn.close();
//         if (newOrder1.length != 0) {
//             resolve({ Success: true, Message: "Stock Added", ItemId: newOrder1[0]._id })
//         }
//         else {
//             reject({ Success: false, Message: "NO ORDERS" })
//         }
//     })
// }
operation.updateStock = async (data, id) => {
    // console.log(ticket);

    return new Promise(async (resolve, reject) => {

        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("stocks", sch.stockSchema());

        let update_response = await itemModel.updateOne({ _id: id }, { $set: data });

        conn.close();
        if (update_response.modifiedCount != 0) {
            resolve({ Success: true, Message: "Stock Updated" })
        }
        else {
            reject({ Success: false, Message: "NO Items" })
        }
    })
}
operation.deleteStock = async (id) => {


    return new Promise(async (resolve, reject) => {

        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("stocks", sch.stockSchema());

        let update_response = await itemModel.deleteOne({ _id: id });
        // console.log(update_response);
        conn.close();
        if (update_response.deletedCount != 0) {
            resolve({ Success: true, Message: "Stock Deleted" })
        }
        else {
            reject({ Success: false, Message: "NO Items" })
        }
    })
}
operation.allstock = async (page, limit) => {
    // console.log('ooo');
    return new Promise(async (resolve, reject) => {
        let skipElements = page != undefined ? (page - 1) * limit : 0;
        let limitTo = limit != undefined ? limit : 20;
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("stocks", sch.stockSchema());
        console.log(itemModel);
        let itemData = await itemModel.find({ deleted: false }, { deleted: 0, __v: 0 }, { skip: skipElements, limit: limitTo });
        // console.log(itemData);
        conn.close();
        if (itemData.length != 0) {
            resolve({
                Success: true, Data: itemData, pagination: {
                    page: page != undefined ? page : 1, limit: limit != undefined ? limit : 20
                }
            })
        }
        else {
            reject({ Success: false, Message: "DB operation failed" })
        }
    })
}
operation.stockbyCat = async (page, limit, cat) => {
    console.log(cat)
    return new Promise(async (resolve, reject) => {
        let skipElements = page != undefined ? (page - 1) * limit : 0;
        let limitTo = limit != undefined ? limit : 20;
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("stocks", sch.stockSchema());
        let itemData = await itemModel.find({ category: cat, deleted: false }, { deleted: 0, __v: 0 }, { skip: skipElements, limit: limitTo });
        if (itemData.length != 0) {
            resolve({
                Success: true, Data: itemData, pagination: {
                    page: page != undefined ? page : 1, limit: limit != undefined ? limit : 20
                }
            })
        }
        else {
            reject({ Success: false, Message: "DB operation failed" })
        }
    })
}
operation.createNewItem1 = async (data, decode) => {
    return new Promise(async (resolve, reject) => {
        let conn = connect();
        let coll = conn.useDb('RSEN');
        let itemModel = coll.model("items", sch.itemSchema());
        for(i of data){
            let previtem=await itemModel.find({ serial_no: i.serial_no }, { deleted: 0, __v: 0 });
            if(previtem.length==0){
                let itemData = {
                    category: i.category,
                    sub_category: i.sub_category,
                    size: i.size,
                    item_code: i.item_code,
                    brand: i.brand,
                    model_no: i.brand,
                    serial_no: i.serial_no,
                    sale_rate: i.sale_rate,
                    buy_rate: i.buy_rate,
                    issued_date: (new Date().toString()).slice(0, 15),
                    issued_by: decode.name,
                    status: i.status,
                    supplier:i.supplier,
                    bill_date:i.bill_date
                }
                await itemModel.insertMany(itemData);
            }
            else{
                let itemData = {
                    category: i.category,
                    sub_category: i.sub_category,
                    size: i.size,
                    item_code: i.item_code,
                    brand: i.brand,
                    model_no: i.brand,
                    serial_no: i.serial_no,
                    sale_rate: i.sale_rate,
                    buy_rate: i.buy_rate,
                    issued_date: (new Date().toString()).slice(0, 15),
                    issued_by: decode.name,
                    status: i.status,
                    supplier:i.supplier,
                    bill_date:i.bill_date
                }
                await itemModel.updateOne({ _id: previtem[0].id }, { $set: itemData })
            }
        }
       
    

        
        // let conn1 = connect();
        // let coll1 = conn1.useDb('RSEN');
        // let itemModel1 = coll1.model("stocks", sch.stockSchema());
        // let previtemData=await itemModel1.find({ item_code: data.item_code}, { deleted: 0, __v: 0 });
       
        // let itemData1 = {
        //     item_code: data.item_code,
        //     category: data.category,
        //     sub_category: data.sub_category,
        //     purchase: data.purchase,
        //     sale: 0,
        //     stock: data.purchase
        // }
        // if(previtemData.length==0){
        //     await itemModel1.insertMany(itemData1);

        // }
        // else{
        //     let p=previtemData[0].purchase+data.purchase
        //     let s=previtemData[0].sale
        //     let st=p-s
        //     console.log('---------------');
        //     console.log(p);
        //     console.log(s);
        //     console.log(st);
        //     console.log('-----------------');
           
        //     let itemData2 = {
        //         item_code: data.item_code,
        //         category: data.category,
        //         sub_category: data.sub_category,
        //         purchase: p,
        //         sale:s,
        //         stock:st
        //     }
        //     await itemModel1.updateOne({ _id: previtemData[0].id }, { $set: itemData2 })
        // }
        
        conn.close();
        // conn1.close();
        f=1
        if (f==1) {
            resolve({ Success: true, Message: "Stock Added" })
        }
        else {
            reject({ Success: false, Message: "NO ORDERS" })
        }
    })
}
module.exports = operation;

