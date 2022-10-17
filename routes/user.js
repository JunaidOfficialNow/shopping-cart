var express = require('express');
var router = express.Router();
var productHelper = require("../helpers/product-helpers.js")
const userHelpers = require("../helpers/user-helpers")
const Handlebars = require('handlebars')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.render('user/user-login',{login:true,cart:false})
  }
}

// var ulala=false
/* GET home page. */
router.get('/', async function (req, res, next) {
 
  let cartCount = null
  if(req.session.user){
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  productHelper.getAllProducts().then((products) => {
    let user = req.session.user
    
    
    res.render("user/view-products", { customer: true, products, user,cartCount });
  })



});
router.get('/login', function (req, res, next) {
  // console.log(req.session)
  if (req.session.loggedIn) {
    res.redirect('/')


  } else {
    res.render("user/user-login", { login: true ,loginErr:req.session.loginErr,cart:true})
    req.session.loginErr=false
  }



});
router.get('/signup', function (req, res, next) {

  res.render("user/user-signup", { login: true })

});
router.post('/signup', function (req, res, next) {

  userHelpers.doSignup(req.body).then((response) => {
    req.session.loggedIn=true
    req.session.user=response
  
    
    res.redirect('/')

  })

});
router.post('/login', function (req, res, next) {

  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      // ulala=true
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect("/")
    } else {
      req.session.loginErr=true
      res.redirect('/login')
      // res.render("user/user-login", { login: true ,loggedIn:false})
    }
  })

});
router.get('/cart',verifyLogin,async(req,res)=>{
   let user = req.session.user
   let products = await userHelpers.getCartProducts(req.session.user._id)
   let cartCount = await userHelpers.getCartCount(req.session.user._id)
   let total = 0
   if (products.length>0){
    total = await userHelpers.getTotalAmount(req.session.user._id)
   }
   
    
   
   
  //  var quantity = products[0].quantity

  //  var MinBtn = true
  //  if ( quantity===1){
  //       MinBtn = false
  //  }else{
  //   MinBtn = true
  //  }

  //  Handlebars.registerHelper('MinusBtn',function(quantity){
  //   if(quantity===1){
  //     return false
  //   }else{
  //     return true
  //   } 

  //  })

  res.render('user/cart',{customer:true,user,products,cartCount,total})
})
router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  // ulala=false 
  res.redirect('/')
})
router.post('/remove-product',(req,res)=>{
  userHelpers.removeProduct(req.body).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  
  userHelpers.changeProductQuantity(req.body).then(async(result)=>{
     result.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(result)
    

  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async (req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId)
  let total = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
    
    if(req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,total).then((response)=>{
        res.json(response)


      })
    }
     

  })  
  
  
}) 
router.get('/order-success',(req,res)=>{
  
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  

  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id)
  
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})

  })
  
})

module.exports = router;    
  