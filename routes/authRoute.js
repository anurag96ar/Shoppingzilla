const express=require('express');
const {checkBlockedUser,returnRequest,applyCouponPage,yourWallet,userWallet,newsUpdateEmail,deleteWishItem,addWishlist,getWishlist,placeOrderCard,paymentGateway,sendContactMail,contact,deleteAddress,updateAddress,editAddress,downloadInvoice,changePassword,updateMob,cancelOrder,orderDetails,yourOrders,success,placeAnOrder,addNewAddressDB,orderReview,addAddress, paymentMethod,checkout,productList,createUser,otp,verifyOtp,loadLogin,profile, addCart,loginUserCtrl,updateQuantity,homePage,deleteCartItem,getUserCart,emptyCart,getallUser,getaUser, deleteaUser,updatedUser, blockUser, unblockUser,handleRefreshToken, logout, sendMail } = require('../controller/userCtrl');

// const {isAdmin} = require('../middlewares/authMiddleware');
const router=express.Router();
router.post("/register",createUser)
router.get("/returnRequest",returnRequest)
router.get("/otp",otp)
router.get("/profile",checkBlockedUser,profile)
router.post("/otp",verifyOtp)
router.get("/loginpage",loadLogin)
// router.post("/usercart", userCart);
router.post("/login",loginUserCtrl)
router.get("/homepage",homePage) 
router.get("/all-users", getallUser);
router.get("/refresh",handleRefreshToken)
router.get("/logout",logout)
router.post("/updateCart",updateQuantity)
// router.get("/:id", getaUser);
// router.delete("/:id", deleteaUser);
router.put("/edit-user",updatedUser);
router.put("/block-user/:id",blockUser);
router.put("/unblock-user/:id",unblockUser);
router.get("/cart", getUserCart);
router.get("/addtoCart", addCart);
router.delete("/deleteCartItem",deleteCartItem)
router.delete("/empty-cart", emptyCart);
router.get("/category",productList);
router.get("/checkout",checkout);
router.post("/paymentMethod",paymentMethod);
router.post("/orderReview",orderReview);
router.get("/addAddress",addAddress);
router.post("/addNewAddressDB",addNewAddressDB);
router.post("/placeAnOrder",placeAnOrder);
router.get("/success",success);
router.get('/yourOrders',yourOrders);
router.get('/orderDetails',orderDetails);
router.get('/cancelOrder',cancelOrder);
router .post('/updateMob',updateMob);
router.post('/changePassword',changePassword)
router.get('/downloadInvoice',downloadInvoice)
router.get('/editAddress',editAddress)
router.post('/updateAddress',updateAddress)
router.get('/deleteAddress',deleteAddress)
router.get('/contact',contact)
router.post('/sendMail',sendContactMail)
router.post('/paymentGateway',paymentGateway)
router.post('/placeOrderCard',placeOrderCard)
router.get('/wishlist',getWishlist) 
router.get('/addWishlist',addWishlist)
router.delete("/deleteWishlistItem",deleteWishItem) 
router.post('/newsEmail',newsUpdateEmail)
router.post('/userWallet',userWallet)
router.get('/yourWallet',yourWallet)
router.get('/applyCouponPage',applyCouponPage)





module.exports=router   