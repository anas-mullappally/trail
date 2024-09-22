const express =require('express');
const { showList } = require('../controllers/customers');
  
const router = express.Router()

router.get("/customersList",showList)

module.exports = router;