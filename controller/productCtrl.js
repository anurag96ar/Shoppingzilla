const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const async = require("hbs/lib/async");
const Category = require("../models/category");
const SubCategory = require("../models/sub_category");

const addToCart = require("../models/addToCart");
const { log } = require("handlebars/runtime");
//create product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//update product
const updateProduct = asyncHandler(async  (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    let bodyValue = req.body;
    const updateProduct = await Product.findOneAndUpdate(
      { _id: id },
      { bodyValue },
      {
        new: true,
      }
    );
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//Get a product
const getaProduct = asyncHandler(async (req, res) => {
  try {
    const id = req;

    validateMongoDbId(id);

    const model1Doc = await Category.findOne({});
    const model2Docs = await SubCategory.find({});

    console.log(model1Doc);
    const nestedData = {
      _id: model1Doc._id,
      category: [],
    };

    model1Doc.category.forEach((category) => {
      model2Docs.forEach((data) => {
        data.subcategory.forEach((sub) => {
          if (sub.subcategoryId == category.id) {
            const categoryData = {
              type: category.type,
              categoryId: category.id,
              data: sub.data,
            };
            nestedData.category.push(categoryData);
          }
        });
      });
    });

    const findProduct = await Product.findById(id);

    res.render("user/productDetail", {
      product: findProduct,
      header: nestedData,
    });
    // res.json(findProduct);
    // headerData(req,res);
  } catch (error) {
    throw new Error(error);
  }
});

// const productDetails = async (req, res) => {
//   try {

//     res.render('user/productDetail')

//   } catch (error) {

//     console.log(error.message);
//   }

// }

//Get all products
const getAllProduct = asyncHandler(
  async (req, res, type, id, categoryId, sort,search) => {
    try {
      // Filtering
      const queryObj = { ...req.query };
      const excludeFields = ["page", "sort", "limit", "fields"];
      excludeFields.forEach((el) => delete queryObj[el]);
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      let query;
      let page;
      let filter;
      let totalProducts;
      

      if (req.query.pre === "true") {
        page = parseInt(req.query.page) - 1 || 1;
      } else {
        page = parseInt(req.query.page) + 1 || 1;
      }
      const perPage = 10;
    if(type=="All"){
       totalProducts = await Product.countDocuments({ deleted: false, });
    }else{
       totalProducts = await Product.countDocuments({ deleted: false,category:type });
    }
     
      const totalPages = Math.ceil(totalProducts / perPage);
     
      const disableNext = totalProducts - perPage * page <= 0;
      const hasMinimumData = totalProducts >= perPage;
      console.log(disableNext + "Next Next");
      console.log(totalProducts + "Pro Pro");
      if (type == "All") {
        
        query = Product.find({ deleted: false })
          .sort({ price: sort })
          .skip((page - 1) * perPage)
          .limit(perPage);
      } 
      else if(search!= undefined){
        
        query = Product.find({ deleted: false,title: { $regex: req.query.search, $options: 'i' } } )
        .sort({ price: sort })
        .skip((page - 1) * perPage)
        .limit(perPage); 
      }
      else if(req.query.filter=="true"){
      
        query = Product.find({
          category: type,
          deleted: false,
        })
          .sort({ price: sort })
          .skip((page - 1) * perPage)
          .limit(perPage);
      }
      else {
        
        query = Product.find({
          category: type,
          product_sub_category: id,
          sub_category: categoryId,
          deleted: false,
        })
          .sort({ price: sort })
          .skip((page - 1) * perPage)
          .limit(perPage);
      }

      // const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      // query = query.skip(skip).limit(limit);
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This Page does not exists");
      }
      const product = await query;

      const model1Doc = await Category.findOne({});
      const model2Docs = await SubCategory.find({});

      const nestedData = {
        _id: model1Doc._id,
        category: [],
      };

      model1Doc.category.forEach((category) => {
        model2Docs.forEach((data) => {
          data.subcategory.forEach((sub) => {
            if (sub.subcategoryId == category.id) {
              const categoryData = {
                type: category.type,
                categoryId: category.id,
                data: sub.data,
              };
              nestedData.category.push(categoryData);
            }
          });
        });
      });
      console.log(nestedData);
      var isLoggedIn = await isUserLoggedIn(req.cookies.email);
      var cartCount = await addToCart.count({email:req.cookies.email});
      // res.json(product);
      res.render("user/category", {
        product: product,
        header: nestedData,
        category: type,
        isLoggedIn: isLoggedIn,
        
        cartCount,
        id,
        categoryId,
        currentPage: page,
        totalPages: totalPages,
        disableNext: disableNext,
        hasMinimumData: hasMinimumData,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
);

function isUserLoggedIn(email) {
  console.log(email);
  if (email === undefined || email === "") {
    return false;
  }
  return true;
}
const headerData = asyncHandler(async (req, res) => {
  try {
    const model1Doc = await Category.findOne({});
    const model2Docs = await SubCategory.find({});

    const nestedData = {
      _id: model1Doc._id,
      category: [],
    };

    model1Doc.category.forEach((category) => {
      model2Docs.forEach((data) => {
        data.subcategory.forEach((sub) => {
          if (sub.subcategoryId == category.id) {
            const categoryData = {
              type: category.type,
              categoryId: category.id,
              data: sub.data,
            };
            nestedData.category.push(categoryData);
          }
        });
      });
    });
     
    // Redirect to another URL with the encoded data as a query parameter
    //res.redirect(`/homepage?data=${nestedData}`);
    
      res.redirect("homepage");
    console.log(nestedData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  //productList,
  // productDetails,
  headerData,
};
