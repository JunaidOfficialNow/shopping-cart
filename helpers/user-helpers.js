var db = require("../config/connection")
var collections = require("../config/collections")
const bcrypt = require('bcrypt')
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
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { products: objectId(proId) }
                    })
                    .then((response) => {
                        resolve()

                    })

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [objectId(proId)]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: function (userId) {
        return new Promise(async (resolve, reject) => {
            let CartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        let: { proList: '$products' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$proList']
                                    }
                                }
                            }
                        ],
                        as: 'CartItems'
                    }
                }
            ]).toArray()
            resolve(CartItems[0].CartItems)
        })
    },
    getCartCount:function(userId){
        return new Promise(async(resolve,reject)=>{
            let count =0
            let cart =await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count = cart.products.length

            }
            resolve(count)

        })

    },
    removeProduct:function(userId,proId){
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId)},
            {
                $pull:{products:objectId(proId)}
            })
            resolve()
        })
        
    }
}