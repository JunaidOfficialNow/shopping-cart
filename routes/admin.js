const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const { response } = require('express');
var express = require('express');
const { getAllProducts } = require('../helpers/product-helpers.js');
var router = express.Router();
var productHelper = require("../helpers/product-helpers.js")


/* GET users listing. */
router.get('/', function (req, res, next) {

  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
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
    console.log(product)
  })
  
 

router.post('/edit-product/:id',(req,res)=>{
  productHelper.editProduct(req.body,req.params.id).then((response)=>{
    res.redirect('/admin')
  })
})

module.exports = router;
