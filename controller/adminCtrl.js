const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const async = require("hbs/lib/async");
const Category = require("../models/category");
const Coupon = require("../models/coupon");
const SubCategory = require("../models/sub_category");
const ReturnRequest = require("../models/return");
const User = require("../models/userModel");
const Banner = require("../models/banner");
const multer = require("multer");
const Order = require("../models/order");
const { ObjectId, ReturnDocument } = require("mongodb");
const axios = require("axios");
const Razorpay = require("razorpay");
const { render } = require("ejs");
const path = require("path");
const pdf = require("html-pdf");
const fs = require("fs");
const { search } = require("../routes/adminRoute");

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/"); // Specify the directory to save the uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename for each uploaded image
  },
});

const upload = multer({ storage: storage });

//empty cart
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.about;
    const price = req.body.price;
    const brand = req.body.brand;
    const category = req.body.category;
    const quantity = req.body.quantity;
    const id = req.query.id;

    const productData = {
      title,
      description,
      price,
      brand,
      category,
      quantity,
    };

    const filter = { _id: id, deleted: false }; // Replace with the document ID you want to update
    const update = {
      $set: {
        title: title,
        description: description,
        price: price,
        brand: brand,
        category: category,
        quantity: quantity,
      },
    }; // Specify the field and its new value
    const options = { returnOriginal: false };
    Product.findOneAndUpdate(filter, update, options).then((data, err) => {
      if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
      else {
        //session.isLoggedIn = true;
        res.redirect("productList");
      }
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Load homepage
const editProduct = async (req, res) => {
  try {
    let productId = req.query.productId;
    const data = await Product.find({ _id: productId });

    res.render("admin/product_edit", { data: data[0] });
  } catch (error) {}
};

// const customerList = async (req, res) => {
//     try {
//         var page;
//         if (req.query.pre == "true") {
//             page = parseInt(req.query.page) - 1 || 1;
//         }
//         else {
//             page = parseInt(req.query.page) + 1 || 1;

//         }

//         // Get the requested page number
//         const perPage = 10;
//         // Query the total count of users
//         const totalUsers = await User.countDocuments();

//         // Calculate the total number of pages
//         const totalPages = Math.ceil(totalUsers / perPage);
//         User.find({ isDeleted: false }).skip((page - 1) * perPage)
//             .limit(perPage)
//             .then(users => res.render('admin/customers', {
//                 users: users, currentPage: page,
//                 totalPages,
//             }))
//             .catch(err => console.error(err));
//         // const users = await User.find({ isDeleted: false });
//         // res.render('admin/customers', { users: users });

//     } catch (error) {

//     }
// }

const customerList = async (req, res) => {
  try {
    let page;
    if (req.query.pre === "true") {
      page = parseInt(req.query.page) - 1 || 1;
    } else {
      page = parseInt(req.query.page) + 1 || 1;
    }

    // Get the requested page number
    const perPage = 10;
    // Query the total count of users
    const totalUsers = await User.countDocuments({ isDeleted: false });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalUsers / perPage);

    // Query the users for the requested page
    const users = await User.find({ isDeleted: false })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const disableNext = totalUsers - perPage * page <= 0;

    // Determine if there are at least 10 data entries
    const hasMinimumData = totalUsers >= perPage;

    res.render("admin/customers", {
      users: users,
      currentPage: page,
      totalPages: totalPages,
      disableNext: disableNext,
      hasMinimumData: hasMinimumData,
    });
  } catch (error) {
    console.error(error);
  }
};

const createProductPage = async (req, res) => {
  try {
    const data = await Category.find();
    res.render("/admin/product_create", { category: data[0].category });
  } catch (error) {}
};
// const productListPage = async (req, res) => {
//     try {

//         const data = await Product.find({ deleted: false });

//         res.render('admin/product_list', { list: data });
//     } catch (error) {

//     }
// }

const productListPage = async (req, res) => {
  try {
    let data;
    let page;
    let category="";
    let totalProducts;
    if (req.query.pre === "true") {
      page = parseInt(req.query.page) - 1 || 1;
    } else {
      page = parseInt(req.query.page) + 1 || 1;
    }
    const perPage = 10;
    if(req.query.category!=undefined&&req.query.category!=""){
     totalProducts = await Product.countDocuments({ deleted: false,category:req.query.category });
    }else{
       totalProducts = await Product.countDocuments({ deleted: false });
    }
    const totalPages = Math.ceil(totalProducts / perPage);

   
if(req.query.category!=undefined&&req.query.category!=""){
   category = req.query.category
     data = await Product.find({ deleted: false,category:req.query.category })
      .skip((page - 1) * perPage)
      .limit(perPage);
}
else{
   data = await Product.find({ deleted: false })
      .skip((page - 1) * perPage)
      .limit(perPage);
}

const disableNext = totalProducts - perPage * page <= 0;
const hasMinimumData = totalProducts >= perPage;
    res.render("admin/product_list", {
      list: data,
      category:category,
      currentPage: page,
      totalPages: totalPages,
      disableNext: disableNext,
      hasMinimumData: hasMinimumData,
    });
  } catch (error) {
    console.error(error);
  }
};

const bannerListPage = async (req, res) => {
  try {
    let page;
    if (req.query.pre === "true") {
      page = parseInt(req.query.page) - 1 || 1;
    } else {
      page = parseInt(req.query.page) + 1 || 1;
    }
    const perPage = 10;
    const totalProducts = await Banner.countDocuments({ deleted: false });
    const totalPages = Math.ceil(totalProducts / perPage);

    const data = await Banner.find({ deleted: false })
      .skip((page - 1) * perPage)
      .limit(perPage);
    const disableNext = totalProducts - perPage * page <= 0;
    const hasMinimumData = totalProducts >= perPage;
    res.render("admin/banner_list", {
      list: data,
      currentPage: page,
      totalPages: totalPages,
      disableNext: disableNext,
      hasMinimumData: hasMinimumData,
    });
  } catch (error) {
    console.error(error);
  }
};

const createSubCategory = async (req, res) => {
  try {
    const data = await Category.find();

    res.render("admin/create_subcategory", { category: data[0].category });
  } catch (error) {}
};
const createSubCategoryAPI = async (req, res) => {
  try {
    var data = req.body.category;
    var sub_category = req.body.subcategory;

    let myobj = [
      { name: "John", address: "Highway 71" },
      { name: "Peter", address: "Lowstreet 4" },
      { name: "Amy", address: "Apple st 652" },
      { name: "Hannah", address: "Mountain 21" },
      { name: "Michael", address: "Valley 345" },
      { name: "Sandy", address: "Ocean blvd 2" },
      { name: "Betty", address: "Green Grass 1" },
      { name: "Richard", address: "Sky st 331" },
      { name: "Susan", address: "One way 98" },
      { name: "Vicky", address: "Yellow Garden 2" },
      { name: "Ben", address: "Park Lane 38" },
      { name: "William", address: "Central st 954" },
      { name: "Chuck", address: "Main Road 989" },
      { name: "Viola", address: "Sideway 1633" },
    ];
    // SubCategory.insertMany(
    //     myobj,
    //     (err, result) => {
    //       if (err) {
    //         'Error adding data to MongoDB:', err);
    //       } else {
    //         'Data added successfully!');
    //       }
    //     });

    // res.render('admin/product_create', { category: data[0].category });
  } catch (error) {}
};
const productSearch = async (req, res) => {
  try {
    Product.find({ title: { $regex: req.query.search, $options: "i" } })
      .then((users) => res.render("admin/product_list", { list: users }))
      .catch((err) => console.error(err));
  } catch (error) {}
};

const subCategories = async (req, res) => {
  try {
    const subcategoryId = req.query.categoryId;

    // Retrieve subcategories based on the selected subcategory ID
    const result = await SubCategory.findOne({
      "subcategory.subcategoryId": subcategoryId,
    });

    if (result) {
      const subcategory = result.subcategory.find(
        (subcategory) => subcategory.subcategoryId === subcategoryId
      );

      res.json(subcategory.data);
    } else {
      return null; // Return null if subcategoryId is not found
    }
  } catch (error) {}
};
const adminLoginPage = async (req, res) => {
  try {
    res.render("admin/login", { message: "" });
  } catch (error) {}
};
const adminLoginAPI = async (req, res) => {
  try {
    if (req.body.email == "admin@gmail.com" && req.body.password == "1234") {
      res.redirect("index");
    } else {
      res.render("admin/login", { message: "Invalid Credentails" });
    }
  } catch (error) {}
};

const adminIndexPage = async (req, res) => {
  try {
    const data = await dashbaordData();

    const weatherData = await getWeatherData();

    const blockUser = await User.count({
      $or: [{ isBlocked: true }, { isDeleted: true }],
    });
    const activeUser = await User.count({
      $and: [{ isBlocked: false }, { isDeleted: false }],
    });

    // Calculate the start and end dates of the target year
    var cancelledData = await drawLineChartCancelled("Cancelled");
    var delivered = await drawLineChartCancelled("Delivered");
    var placed = await drawLineChartCancelled("Order Placed");

    const userPieData = [blockUser, activeUser];
    res.render("admin/index", {
      temp: weatherData.temp,
      userPieData,
      delivered,
      placed,
      cancelledData,
      todayBooking: data.todayBooking,
      totalBooking: data.totalBooking,
      cancelled: data.cancelled,
      totalCustomer: data.totalCustomer,
    });
    // res.render('admin/index', { location: weatherData.location, temperature: weatherData.temperature });
  } catch (error) {
    console.log(error);
  }
};

async function drawLineChartCancelled(status) {
  const startDate1 = new Date(2021, 0, 1); // January 1st
  const endDate1 = new Date(2021 + 1, 0, 1);
  var data2021 = await Order.count({
    placedDate: { $gte: startDate1, $lt: endDate1 },
    paymentStatus: status,
  }).sort({ placedDate: -1 });

  const startDate = new Date(2022, 0, 1); // January 1st
  const endDate = new Date(2022 + 1, 0, 1);
  var data2022 = await Order.count({
    placedDate: { $gte: startDate, $lt: endDate },
    paymentStatus: status,
  }).sort({ placedDate: -1 });

  const startDate2 = new Date(2023, 0, 1); // January 1st
  const endDate2 = new Date(2023 + 1, 0, 1);
  var data2023 = await Order.count({
    placedDate: { $gte: startDate2, $lt: endDate2 },
    paymentStatus: status,
  }).sort({ placedDate: -1 });
  return [data2021, data2022, data2023];
}
const customerSearch = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number
    const perPage = 10;
    // Query the total count of users
    const totalUsers = await User.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalUsers / perPage);
    User.find({ email: req.query.search, isDeleted: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .then((users) =>
        res.render("admin/customers", {
          users: users,
          currentPage: page,
          totalPages,
        })
      )
      .catch((err) => console.error(err));
  } catch (error) {}
};

const deleteCustomer = async (req, res) => {
  try {
    const data = req.query.dataId;

    const users = await User.findOneAndUpdate(
      { email: data },
      { $set: { isDeleted: true } }
    );
    const usersData = await User.find({ isDeleted: false });

    res.render("admin/customers", { users: usersData });
  } catch (error) {}
};

const deleteProduct = async (req, res) => {
  try {
    var dataId = req.query.dataId;
    const filter = { _id: dataId }; // Replace with the document ID you want to update
    const update = { $set: { deleted: true } }; // Specify the field and its new value
    const options = { returnOriginal: false };
    const users = await Product.findOneAndUpdate(filter, update, options);
    const data = await Product.find({ deleted: false });

    res.render("admin/product_list", { list: data });
  } catch (error) {}
};
const deleteBanner = async (req, res) => {
  try {
    var dataId = req.query.dataId;
    const filter = { _id: dataId }; // Replace with the document ID you want to update
    const update = { $set: { deleted: true } }; // Specify the field and its new value
    const options = { returnOriginal: false };
    const users = await Banner.findOneAndUpdate(filter, update, options);
    const data = await Banner.find({ deleted: false });

    res.render("admin/banner_list", { list: data });
  } catch (error) {}
};

const blockCustomer = async (req, res) => {
  var data = req.query.dataId;
  var blockedValue = req.query.blockedValue;

  if (blockedValue == "Active") {
    blockedValue = true;
  } else {
    blockedValue = false;
  }

  try {
    // Update the document
    const filter = { email: data }; // Replace with the document ID you want to update
    const update = { $set: { isBlocked: blockedValue } }; // Specify the field and its new value
    const options = { returnOriginal: false }; // Return the updated document
    const result = await User.findOneAndUpdate(filter, update, options);
    const users = await User.find({ isDeleted: false });

    res.render("admin/customers", { users: users });
  } catch (error) {}
};

const logoutAdmin = async (req, res) => {
  try {
    res.redirect("adminLogin");
    // Update the document
    // req.session.destroy(function (err) {
    //     if (err) {
    //         err);
    //         res.send("Error")
    //     } else {
    //         //session.isLoggedIn = false;

    //     }
    // })
  } catch (error) {}
};
const orderList = async (req, res) => {
  try {
    let page;
    if (req.query.pre === "true") {
      page = parseInt(req.query.page) - 1 || 1;
    } else {
      page = parseInt(req.query.page) + 1 || 1;
    }
    const perPage = 10;
    const totalOrders = await Order.countDocuments();

    const totalPages = Math.ceil(totalOrders / perPage);

    var data = await Order.find()
      .skip((page - 1) * perPage)
      .limit(perPage).sort({_id:-1});
    const disableNext = totalOrders - perPage * page <= 0;
    const hasMinimumData = totalOrders >= perPage;

    res.render("admin/order_list", {
      orderList: data,
      currentPage: page,
      totalPages: totalPages,
      disableNext: disableNext,
      hasMinimumData: hasMinimumData,
    });
  } catch (error) {}
};

const bannerList = async (req, res) => {
  try {
    res.render("admin/banner");
  } catch (error) {}
};
//load coupon
const getCoupon = async (req, res) => {
  try {
    res.render("admin/coupon_create");
  } catch (error) {}
};

const getCouponList = async (req, res) => {
  try {
    var couponList = await Coupon.find();
    res.render("admin/coupon_list", { couponList });
  } catch (error) {}
};

const changeOrderStatus = async (req, res) => {
  try {
    if (req.query.status == "Shipped") {
      var changeStatus = await Order.findOneAndUpdate(
        { _id: req.query.id },
        { $set: { paymentStatus: req.query.status, shippedDate: Date.now() } }
      );
    } else if (req.query.status == "Delivered") {
      var changeStatus = await Order.findOneAndUpdate(
        { _id: req.query.id },
        { $set: { paymentStatus: req.query.status, DeliveredDate: Date.now() } }
      );
    } else if (req.query.status == "Out for Delivery") {
      var changeStatus = await Order.findOneAndUpdate(
        { _id: req.query.id },
        {
          $set: {
            paymentStatus: req.query.status,
            OutDeliveryDate: Date.now(),
          },
        }
      );
    } else {
      var changeStatus = await Order.findOneAndUpdate(
        { _id: req.query.id },
        { $set: { paymentStatus: req.query.status, CancelDate: Date.now() } }
      );

      if (changeStatus.paymentMode == "CARD") {
        initiateRefund(changeStatus.paymentId, changeStatus.totalAmount);
      }
    }

    var data = await Order.find().sort({_id:-1});

    res.render("admin/order_list", {
      orderList: data,
      dropdownText: "2023",
    });
  } catch (error) {}
};
const razorpay = new Razorpay({
  key_id: "rzp_test_GfUZRS4num8yZT",
  key_secret: "WmJx6VuRiedpsENmbPk9rOMP",
});

async function initiateRefund(PAYMENT_ID, REFUND_AMOUNT) {
  try {
    razorpay.payments
      .refund(PAYMENT_ID, { amount: REFUND_AMOUNT })
      .then((response) => {})
      .catch((error) => {
        console.error("Error initiating refund:", error);
      });
  } catch (error) {}
}

const orderDetail = async (req, res) => {
  try {
    var orderPlacedData = await Order.find({ _id: new ObjectId(req.query.id) });
    let cancelled = false;
    if (orderPlacedData[0].paymentStatus == "Cancelled") {
      cancelled = true;
    }
    var currentStatus;

    if (orderPlacedData[0].paymentStatus == "Shipped") {
      currentStatus =
        "Order Placed on (" +
        orderPlacedData[0].placedDate +
        " ) ---> Shipped on ( " +
        orderPlacedData[0].shippedDate +
        ") ---> Out For Delivery  ";
    } else if (orderPlacedData[0].paymentStatus == "Order Placed") {
      currentStatus =
        "Order Placed on ( " +
        orderPlacedData[0].placedDate +
        ") ---> Ready to ship";
    } else if (orderPlacedData[0].paymentStatus == "Out for Delivery") {
      currentStatus =
        "Order Placed on ( " +
        orderPlacedData[0].placedDate +
        " ) ---> Shipped on ( ${orderPlacedData[0].shippedDate} )---> Out for Deliver  on ( " +
        orderPlacedData[0].OutDeliveryDate +
        " ) ---> Deliver soon.. ";
    } else if (orderPlacedData[0].paymentStatus == "Delivered") {
      currentStatus =
        "Order Placed on ( " +
        orderPlacedData[0].placedDate +
        " ) ---> Shipped on ( " +
        orderPlacedData[0].shippedDate +
        " )---> Out for Deliver  on ( " +
        orderPlacedData[0].deliveryDate +
        " ) ---> Delivererd on ( " +
        orderPlacedData[0].DeliveredDate +
        " ) ";
    } else {
      currentStatus = "";
    }

    res.render("admin/order-detail", {
      data: orderPlacedData[0],
      cancelled: cancelled,
      status: currentStatus,
    });
  } catch (error) {}
};
// Fetch weather data
async function getWeatherData() {
  const apiKey = "4d580cc975a64c5472b9b3b53c9b04db";
  const apiUrl =
    "http://api.openweathermap.org/data/2.5/weather?units=metric&q=Bangalore&units=metric&appid=" +
    apiKey;

  try {
    const response = await axios.get(apiUrl);

    const temp = response.data.main.temp;

    return { temp };
  } catch (error) {
    throw new Error("Failed to fetch weather data.");
  }
}

async function dashbaordData() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  try {
    const todayBooking = await Order.count({
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$placedDate" } },
          today.toISOString().substring(0, 10),
        ],
      },
    });
    const totalBooking = await Order.count();
    const cancelled = await Order.count({ paymentStatus: "Cancelled" });
    const totalCustomer = await User.count();

    return {
      todayBooking,
      totalBooking,
      totalBooking,
      cancelled,
      totalCustomer,
    };
  } catch (error) {}
}

const last7Days = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 7);
    var orderList = await Order.find({
      placedDate: { $gte: fifteenDaysAgo },
    }).sort({ placedDate: -1 });

    res.render("admin/order_list", {
      orderList: orderList,
      dropdownText: "Last 7 days",
    });
  } catch (error) {}
};
const last30days = async (req, res) => {
  try {
    const last30daysData = new Date();
    last30daysData.setDate(last30daysData.getDate() - 30);
    var orderList = await Order.find({
      placedDate: { $gte: last30daysData },
    }).sort({ placedDate: -1 });

    res.render("admin/order_list", {
      orderList: orderList,
      dropdownText: "Last 30 days",
    });
  } catch (error) {}
};
const D2023 = async (req, res) => {
  try {
    const targetYear = 2023;

    // Calculate the start and end dates of the target year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1);
    var orderList = await Order.find({
      placedDate: { $gte: startDate, $lt: endDate },
    }).sort({ placedDate: -1 });

    res.render("admin/order_list", {
      orderList: orderList,
      dropdownText: "2023",
    });
  } catch (error) {}
};
const D2022 = async (req, res) => {
  try {
    const targetYear = 2022;
    // Calculate the start and end dates of the target year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1);
    var orderList = await Order.find({
      placedDate: { $gte: startDate, $lt: endDate },
    }).sort({ placedDate: -1 });

    res.render("admin/order_list", {
      orderList: orderList,
      dropdownText: "2022",
    });
  } catch (error) {}
};
const older = async (req, res) => {
  try {
    var orderList = await Order.find().sort({ placedDate: -1 });

    res.render("admin/order_list", {
      orderList: orderList,
      dropdownText: "Older",
    });
  } catch (error) {}
};

const deleteProductImage = async (req, res) => {
  try {
    console.error("call here");
    console.error(req.query.id);
    console.error(req.query.name);
    // Find the object by its ObjectId
    var objectId = req.query.id;
    var imageName = req.query.name;
    var res = await Product.updateOne(
      { _id: new ObjectId(objectId) }, // Match the document
      { $pull: { images: { _id: new ObjectId(imageName) } } } // Remove the image from the "images" array
    );
    console.error(res);
  } catch (error) {
    console.error(error);
  }
};

//load coupon list

//create coupon
const insertCoupon = async (req, res) => {
  try {
    console.log("new new new new new");
    console.log(req.body);
    const coupon = new Coupon({
      code: req.body.code,
      expiryDate: req.body.expiryDate,
      discount: req.body.discount,
      amount: req.body.amount,
    });

    // Check if the coupon already exists.
    const existingCoupon = await Coupon.findOne({ code: coupon.code });
    if (existingCoupon) {
      req.flash(
        "error",
        "Coupon already exists. Please enter a different coupon name."
      );
      res.redirect("CouponList");
      return;
    }
    await coupon.save();
    req.flash("success", "Coupon added successfully!");
    res.redirect("CouponList");
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occurred while adding the coupon.");
    res.redirect("createCoupon");
  }
};

const dayWiseReport = async (req, res) => {
  try {
    var orderPlacedData = [];
    var reportDate = req.body.reportDate;
    var reportMonth = req.body.reportMonth;
    var reportYear = req.body.reportYear;
    const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    console.log(reportDate);
    console.log(reportMonth);
    console.log(reportYear);

    if (reportDate != undefined && reportDate != "") {
      const targetDate = new Date(reportDate);
      orderPlacedData = await Order.find({
        placedDate: {
          $gte: targetDate,
          $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Add one day to the target date
        },
      });
    }
    if (reportMonth != undefined && reportMonth != "") {
      orderPlacedData = await Order.find({
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $month: "$placedDate",
                },
                reportMonth.split("-")[1],
              ],
            },
            {
              $eq: [
                {
                  $year: "$placedDate",
                },
                reportMonth.split("-")[0],
              ],
            },
          ],
        },
      });
    }
    if (reportYear != undefined && reportYear != "") {
      orderPlacedData = await Order.find({
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $year: "$placedDate",
                },
                reportYear,
              ],
            },
          ],
        },
      });
    }
    console.log(orderPlacedData);
    // Render the invoice template with the data
    res.render("admin/sale_invoice", { data: orderPlacedData,date:formattedDate}, (err, html) => {
      if (err) {
        console.error("Error rendering invoice template:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Generate and serve the PDF for download
      const pdfFilePath = path.join(__dirname, "invoice.pdf");
      const options = {
        format: "A4",
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      };

      pdf.create(html, options).toFile(pdfFilePath, (err, result) => {
        if (err) {
          console.error("Error generating PDF:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        // Set the appropriate headers for downloading the file
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${orderPlacedData.email}.pdf`
        );

        // Stream the PDF file to the response
        const stream = fs.createReadStream(pdfFilePath);
        stream.pipe(res);
      });
    });
  } catch (e) {
    console.log(e);
  }
};

const requestList = async (req, res) => {
  try {
   let data = await ReturnRequest.find({status:"Return Requested"}) 

    res.render("admin/return_request", { data:data
     
    });
  } catch (error){

  }
};

const rejectApproved = async(req,res)=>{
  try{
    var changeStatus = await Order.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { paymentStatus: req.query.status, returnDate: Date.now() } }
    );
let updateStatus = await ReturnRequest.findOneAndUpdate({ orderId: req.query.id },
  { $set: { status: req.query.status } })
    if (changeStatus.paymentMode == "CARD") {
      initiateRefund(changeStatus.paymentId, changeStatus.totalAmount);
    }
  }
  catch{

  }
}

module.exports = {
  rejectApproved,
  requestList,
  dayWiseReport,
  getCouponList,
  insertCoupon,
  getCoupon,
  deleteBanner,
  bannerListPage,
  deleteProductImage,
  older,
  D2022,
  D2023,
  last30days,
  last7Days,
  orderDetail,
  changeOrderStatus,
  orderList,
  //uploadProductsOnServer,
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
  logoutAdmin,
  createSubCategory,
  createSubCategoryAPI,
  bannerList,
};
