const express =require('express');
const { showCart,addCart, updateQuantity, removeProductCart, clearCart, buyNow} = require('../controllers/cart');
const router = express.Router()
const verifyToken = require('../middleware/jwtmiddleware');
 
router.get("/cart" ,verifyToken,showCart)

router.get('/addCart/:id',verifyToken ,addCart)
router.get('/buyNow/:id',verifyToken ,buyNow)
// router.get('/singleCart/:id',verifyToken ,singleCart) 
router.post('/updateQuantity',verifyToken,updateQuantity)

router.get('/deleteProductCart/:id',verifyToken,removeProductCart)
router.get('/clearToCart',verifyToken,clearCart)

module.exports = router;
