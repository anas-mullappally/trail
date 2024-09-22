const express = require("express");
const { homePage, showShop, logout, account, blockUnblock, getOrderDetails, cancelOrder, deleteAddress, priceFiltration, forgotPasswordRendring, checkEmail, verifyOTP, passwordChange, optRendring, updateUser, contact,  } = require("../controllers/user");
const router = express.Router();
const verifyToken = require("../middleware/jwtmiddleware");
// const { otpReg } = require("../controllers/auth");
 

router.get("/",  homePage);

// router.get('/account',account)

router.get("/profile",verifyToken,account);

router.get("/logout", logout);

router.get("/shop", showShop);

router.post("/userBlock",blockUnblock)

router.get("/getOrderDetails",getOrderDetails)

router.post("/cancelOrder",cancelOrder)

router.delete("/deleteAddress/:id",verifyToken,deleteAddress)

router.post("/priceFilter",priceFiltration)

router.get("/forgotPassword",forgotPasswordRendring)

router.post('/checkEmail', checkEmail);

// .get("/otpCheck",verifyOTPRendring)
router.get("/otpPage",optRendring)
router.post("/otpCheck",verifyOTP)

// router.get("/passwordChange",passwordChangeRendring)
router.post("/passwordChange", passwordChange);

router.post("/updateUserInfo",verifyToken,updateUser)

// router.get("/search",searching)

// router.get('/auth/register',otpReg);

router.get('/contact',contact)

// router.post('/send-message',sendMessage);


module.exports = router;
