const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  //productList,
  // productDetails,
  addToWishlist,
  rating,
  headerData,
} = require("../controller/productCtrl");
const router = express.Router();

router.post("/",createProduct);
router.get("/:id",getaProduct);
router.put("/:id",updateProduct);
router.delete("/:id",deleteProduct);
router.get("/",getAllProduct);
// router.get("/category",productList);
router.get("/productDetail",getaProduct);
router.get("/headerData",headerData)




module.exports = router;