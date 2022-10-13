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
   console.log(products)
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

  res.render('user/cart',{customer:true,user,products,cartCount})
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
  
  userHelpers.changeProductQuantity(req.body).then((result)=>{
    res.json({status:true,result
    })

  })
})



module.exports = router;
