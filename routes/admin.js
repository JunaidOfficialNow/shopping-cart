const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const { response } = require('express');
var express = require('express');
const { getAllProducts } = require('../helpers/product-helpers.js');
var router = express.Router();
var productHelper = require("../helpers/product-helpers.js")
const verifyLogin=(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.render('admin/admin-login',{login:true})
  }
}


/* GET users listing. */
router.get('/', verifyLogin,function (req, res, next) {

  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products ,admin:req.session.admin});
  })


});

router.get('/add-product', function (req, res) {
  res.render("admin/add-product")
})
router.post('/add-product', function (req, res) {
  
  productHelper.addProduct(req.body, (id) => {
    res.render("admin/add-product")
    let image = req.files.image
    image.mv("./public/product-images/" + id + ".jpg", (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('done')
      }
    })

  })
})
router.get('/delete-product/:id',(req,res)=>{
  // let proId=req.query.id
  // console.log(proId)
  // console.log(req.query.name)
  let proId=req.params.id
  productHelper.deleteProduct(proId).then((response)=>{
     res.redirect("/admin")
  })

})
router.get('/edit-product/:id',async(req,res)=>{
    
    let product =await productHelper.getProductDetails(req.params.id)
    res.render('admin/edit-product',{admin:true,product})
  })
  
 

router.post('/edit-product/:id',(req,res)=>{
  productHelper.editProduct(req.body,req.params.id).then((response)=>{
    res.redirect('/admin')
    if(req.files.image){
      let image = req.files.image
      let id=req.params.id 
      image.mv("./public/product-images/" + id + ".jpg")
  

    }
  })
})
router.get('/login', function (req, res, next) {
  // console.log(req.session)
  if (req.session.admin) {
    res.redirect('/')


  } else {
    res.render("admin/admin-login", { loginErr:req.session.adminLoginErr,adminLoginHead:true})
    req.session.adminLoginErr=false
  }



});
router.post('/login', function (req, res, next) {

  productHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      // ulala=true
      
      req.session.admin = response.admin
      req.session.admin.loggedIn = true
      res.redirect("/admin")
    } else {
      req.session.adminLoginErr=true
      res.redirect('/admin/login')
      // res.render("user/user-login", { login: true ,loggedIn:false})
    }
  })
  router.get('/logout', (req, res) => {
    req.session.admin= null
    // ulala=false 
    res.redirect('/admin')
  })

});
router.get('/all-orders', (req,res)=>{
  productHelper.getAllOrders().then((orders)=>{
    res.render('admin/all-orders',{orders})

  })
})
router.get('/view-order-customer/:id',(req,res)=>{
  productHelper.getCustomerDetails(req.params.id).then((user)=>{
    res.render('admin/view-user',{user})
  })
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products = await productHelper.getOrderProducts(req.params.id)
  
  res.render('admin/view-order-products',{products})
})
router.post('/ship-order',(req,res)=>{
  productHelper.shipOrder(req.body.orderId).then(()=>{

    res.json({status:true})
  })
})
router.get('/all-users',(req,res)=>{
  productHelper.getAllUsers().then((users)=>{
    res.render("admin/all-users",{users})
  })
})
module.exports = router;  
