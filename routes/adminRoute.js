const express = require('express');
const {requestList,
    rejectApproved,
    deleteProductImage,
    dayWiseReport,
    getCouponList,
    getCoupon,
    deleteBanner,
    bannerListPage,
    bannerList,
    orderDetail,
    changeOrderStatus,
    orderList,
    insertCoupon,
    createSubCategoryAPI,
    createSubCategory,
    updateProduct,
    editProduct,
    customerList,
    createProductPage,
    productListPage,
    productSearch,
    subCategories,
    adminLoginAPI,
    adminLoginPage,
    adminIndexPage,
    customerSearch,
    deleteCustomer,
    deleteProduct,
    blockCustomer,
    logoutAdmin, last7Days, last30days, D2023, D2022, older } = require('../controller/adminCtrl');

const router = express.Router();
//router.post("/uploadProducts", uploadProductsOnServer)
router.post("/updateProduct", updateProduct)
router.get("/editProduct", editProduct)
router.get("/requestList", requestList)
router.get("/customer", customerList)
router.get("/productList", productListPage)
router.get("/rejectApproved", rejectApproved)
router.get("/productSearch", productSearch)
router.get("/subcategories", subCategories)
router.get("/adminLogin", adminLoginPage)
router.post("/loginAdmin", adminLoginAPI)
router.get("/bannerList", bannerList)
router.get("/banner", bannerListPage)
router.get("/createCoupon", getCoupon)
router.get("/CouponList", getCouponList)
router.post("/insertCoupon", insertCoupon)
router.get("/index", adminIndexPage)
router.get("/search", customerSearch)
router.delete("/deleteUser", deleteCustomer)
router.delete("/deleteProduct", deleteProduct)
router.delete("/deleteBanner", deleteBanner)
router.get("/deleteProductImage", deleteProductImage)
router.post("/blockUser", blockCustomer)
router.get("/logout", logoutAdmin)
router.get("/createSubCategory", createSubCategory)
router.post("/createSubCategoryAPI", createSubCategoryAPI)
router.get("/orderList", orderList)
router.get('/changeOrderStatus', changeOrderStatus);
router.get('/orderDetail', orderDetail);

router.get('/last7Days', last7Days);
router.get('/last30days', last30days);
router.get('/2023', D2023);
router.get('/2022', D2022);
router.get('/older', older);
router.post('/dayWiseReport', dayWiseReport)



//router.get('/createProduct',createProductPage)

module.exports = router;
