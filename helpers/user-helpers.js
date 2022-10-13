var db = require("../config/connection")
var collections = require("../config/collections")
const bcrypt = require('bcrypt')
const { response } = require("express")
var objectId = require('mongodb').ObjectID


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                db.get().collection(collections.USER_COLLECTION).findOne({ _id: data.insertedId }).then((details) => {

                    resolve(details)
                })

            })

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed')
                        resolve({ status: false })
                    }

                })

            } else {
                console.log("user do not exist")
                resolve({ status: false })
            }

        })
    },
    addToCart: function (proId, userId) {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                // console.log(proExist)
                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId), "products.item": objectId(proId) },
                        {
                            $inc: { "products.$.quantity": 1 }
                        }
                    ).then(() => {
                        resolve()
                    })

                    // db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                    //     {
                    //         $push: { products: objectId(proId) }
                    //     })
                    //     .then((response) => {
                    //         resolve()

                    //     })
                } else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
            //     } else {
            //         let cartObj = {
            //             user: objectId(userId),
            //             products: [objectId(proId)]
            //         }
            //         db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
            //             resolve()
            //         })
            //     }
            // })
        })
},
    getCartProducts: function (userId) {
        return new Promise(async (resolve, reject) => {
            let CartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                // {
                //     $lookup: {
                //         from: collections.PRODUCT_COLLECTION,
                //         let: { proList: '$products' },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in: ['$_id', '$$proList']
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'CartItems'
                //     }
                // }
            ]).toArray()
            resolve(CartItems)
        })
    },
    getCartCount: function (userId) {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length

            }
            resolve(count)

        })

    },
    removeProduct: function (details) {
        
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.CART_COLLECTION).updateOne({_id: objectId(details.cart) },
                {
                    $pull: { 'products':{item:objectId(details.product)}}
                })
            resolve()
        }) 

    },
    changeProductQuantity:(details)=>{

            let Count = parseInt(details.count)
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CART_COLLECTION).updateOne({_id:objectId(details.cart), "products.item": objectId(details.product) },
                        {
                            $inc: { "products.$.quantity": Count}
                        }
                    ).then(async() => {
                        let result = await db.get().collection(collections.CART_COLLECTION).findOne({_id:objectId(details.cart)})
                        console.log(result.products[0].quantity)
                        resolve(result.products[0].quantity)
                    })
        })
    }
}