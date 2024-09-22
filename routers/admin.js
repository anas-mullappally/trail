const express =require('express');
// const { body } = require('express-validator');

 
const {  adminLoginPage, adminSubmitlogin, adminLogout, dashboard, orderList, orderDetails, orderStatus, dashboardData, couponsList, addCoupon, addCouponController, deleteCouponController, showCouponEditPage, updateCoupon, generateReportDownload } = require('../controllers/admin');
 
 
const router = express.Router()


router.get('/admin',adminLoginPage);
router.get('admin/logout',adminLogout);

router.get('/dashboard',dashboard)
router.get('/dashboard-data',dashboardData)

router.post('/dashboard',adminSubmitlogin)

router.get("/orderList",orderList)
// router.get("/orderDetails/:id",orderDetails)
router.get("/orderDetails",orderDetails)


router.post("/orderStatus",orderStatus)
router.get("/couponsList",couponsList)
router.get("/addCoupon",addCoupon)


router.post("/addCoupon",addCouponController);
router.get("/deleteCoupon/:id",deleteCouponController)
router.get("/editCoupon/:id",showCouponEditPage)
router.post("/editCoupon/:id",updateCoupon)

// router.get('/generateReportDownload',generateReportDownload);
router.get('/generateReportDownload/:startDate/:endDate',generateReportDownload);// router.get('/categorie',categorieListShow)

// router.get('/sales', getSalesData);
 

module.exports = router;
