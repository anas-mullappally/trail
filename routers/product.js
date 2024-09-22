const express = require("express");
const {  productAdding, listProduct, deleteProduct, editProduct, updateProduct, singleProductDetails, ShowAddProduct } = require("../controllers/product");
const upload = require("../config/multer");
const router = express.Router()

router.get("/addProduct",ShowAddProduct)

router.get("/listProduct",listProduct)

router.get("/editProduct/:id" ,editProduct)

router.post("/editProduct/:id",upload.single("image"),updateProduct)
 
router.post("/addProduct",upload.single("image"),productAdding)


router.get("/deleteProduct/:id",deleteProduct)

router.get("/singleProduct/:id",singleProductDetails)



module.exports = router;