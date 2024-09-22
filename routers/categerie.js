const express =require('express');

const { categorieListShow, categorieAddShow, submitAddCategory, categoryEdit, categoryUpdate , categoryDelete, filterByCategory, searchProducts, getSortedProducts} = require('../controllers/categorie');

const router = express.Router()

router.get('/categorie',categorieListShow)
router.get('/addCategorie',categorieAddShow)

router.post("/addCategorie",submitAddCategory)

router.get("/categorieEdit/:id",categoryEdit)
// router.post("/categorieEdit/:id",categoryEdit)

 
router.get('/categoryFiltration',filterByCategory);

router.post("/categorieEdit/:id",categoryUpdate)

router.post("/categorieDelete/:id",categoryDelete)



// Route definition
router.get('/search', searchProducts);
router.get('/products',getSortedProducts);


module.exports = router;