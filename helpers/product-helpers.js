var db = require("../config/connection")
var collections=require("../config/collections")
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
module.exports={
    addProduct:(product,callback)=>{
        product.price = parseInt(product.price)
        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            var objectId=product._id
            callback(objectId)

        })
        
    },
    getAllProducts:function(){
        return new Promise(async(resolve,reject)=>{
            let products =await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve (products)
        })
    },
    deleteProduct:function(proId){
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((data)=>{
                resolve(data)
            })
        })

    },
     getProductDetails:function(ProId){
        return new Promise((resolve,reject)=>{
             db.get().collection(collections.PRODUCT_COLLECTION).find({_id:objectId(ProId)}).toArray().then((product)=>{
                resolve(product)
             })
                
            })
        },
     
     editProduct:function(data,id){
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).update({_id:objectId(id)},{$set:{Name:data.Name,
            category:data.category,price:data.price,description:data.description}}).then((data)=>{
                resolve(data)
            })
        })
     },
     doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log("Admin login success")
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed')
                        resolve({ status: false })
                    }

                })

            } else {
                console.log("Admin do not exist")
                resolve({ status: false })
            }

        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
                console.log(orders)
                resolve(orders)
            
            

        })
    },
    getCustomerDetails:(userId)=>{
        return new Promise( async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)})
            resolve(user)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            resolve(orderItems)
        })
    },
    shipOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'shipped'
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    }
    
    
     
}