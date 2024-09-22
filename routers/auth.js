const express =require('express');
const { loginPage, otpReg, verifyOTP, sendOTP, submitRegister, submitLogin } = require('../controllers/auth');
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/auth');
const verifyToken = require('../middleware/jwtmiddleware');
 
require('../helper/passport')


router.use(passport.initialize());
router.use(passport.session())

 
router.get('/login-register',loginPage );
router.get('/auth/register',otpReg);


router.post('/send-otp', sendOTP);
router.post('/verify-otp',verifyOTP);
router.post('/auth/register',submitRegister)
router.post("/login",submitLogin)



// Login with Google
// Auth
router.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))


//Auth callback
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/success",
      failureRedirect: "/failure",
    })
  );
  
  
  router.get("/success",userController.successGoogleLogin);
  router.get("/failure",userController.failureGooglelogin);


 
module.exports = router;

