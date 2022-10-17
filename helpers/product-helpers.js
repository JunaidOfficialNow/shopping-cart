var db = require("../config/connection")
var collections=require("../config/collections")
var objectId = require('mongodb').ObjectID
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
     }
}