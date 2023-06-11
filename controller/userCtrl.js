const User = require("../models/userModel");
const express = require("express");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const addToCart = require("../models/addToCart");
const wishlist = require("../models/wishlist");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { headerData } = require("./productCtrl");
const notifier = require("node-notifier");
const { ObjectId } = require("mongodb");
const Category = require("../models/category");
const SubCategory = require("../models/sub_category");
const { log } = require("handlebars/runtime");
const async = require("hbs/lib/async");
const { render } = require("ejs");
const cartModel = require("../models/cartModel");
const { getAllProduct, getaProduct } = require("./productCtrl");
const AddAddress = require("../models/addNewAddress");
const Order = require("../models/order");
const news = require("../models/newsModel");
const bcrypt = require("bcrypt");
const path = require("path");
const Razorpay = require("razorpay");
const pdf = require("html-pdf");
const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");
const axios = require('axios');
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //create new user

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    //   // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      // Configure your email provider settings here
      // For example, for Gmail:
      service: "gmail",
      auth: {
        user: "anu.ragar0818@gmail.com",
        pass: "yllupvotekirihap",
      },
    });

    //   // Prepare the email message
    const mailOptions = {
      from: "anu.ragar0818@gmail.com",
      to: email,
      subject: "Email Verification",
      text: `Your OTP is: ${otp}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.send("Error occurred while sending OTP");
      } else {
        res.send("OTP sent to your email");
      }
    });

    let userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      otp: otp,
    };
    const newUser = await User.create(userData);

    res.redirect("otp?email=" + email);
    // res.json(newUser)
  } else {
    throw new Error("User Already Exists");
  }
});

//Load login
const loadLogin = async (req, res) => {
  try {
    var data = await nestedHeaderData();
    res.render("user/login", { header: data });
  } catch (error) {
    console.log(error.message);
  }
};

//Load homepage
const homePage = async (req, res) => {
  try {
    const isAuthenticated = req.user ? true : false;
    var data = await nestedHeaderData();
    var isLoggedIn= await isUserLoggedIn(req.cookies.email);
    var cartCount=await addToCart.count();
    res.render("user/index", { header: data, isLoggedIn: isLoggedIn,cartCount:cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

//load OTP
const otp = async (req, res) => {
  try {
    res.render("user/otp", { email: req.query.email });
  } catch (error) {
    console.log(error.message);
  }
};

//verify otp
const verifyOtp = async (req, res) => {
  try {
    const filter = { email: req.query.email }; // Replace with the document ID you want to update
    const update = { $set: { isVerified: true } }; // Specify the field and its new value
    const options = { returnOriginal: false }; // Return the updated document
    const data = await User.findOne(filter);

    let otp = req.body.otp;
    if (otp == data.otp) {
      const result = await User.findOneAndUpdate(filter, update, options);
      // const model1Doc = await Category.findOne({});
      // const model2Docs = await SubCategory.find({});
      headerData(req, res);
      //  res.redirect('homepage')
    } else {
      console.log("Incorrect otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({
      email: email,
      isDeleted: false,
      isBlocked: false,
    });
    console.log(findUser);
    if (findUser && (await findUser.isPasswordMatched(password))) {
      // const refreshToken = await generateRefreshToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          // refreshToken: refreshToken,
        },
        { new: true }
      );

      res.cookie("email", req.body.email);
      headerData(req, res);
    } else {
      // throw new Error("Invalid Credentials");
      notifier.notify({
        title: "Alert!",
        message: "Invalid Credentials",
        sound: true,
        wait: true,
      });
    }
  } catch (error) {
    notifier.notify({
      title: "Alert!",
      message: "Something went wrong",
      sound: true,
      wait: true,
    });
  }
});

// const loginUserCtrl = asyncHandler(async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     // check if user exists or not
//     const findUser = await User.findOne({ email: email, isDeleted: false, isBlocked: false });
//     console.log(findUser);
//     if (findUser && (await findUser.isPasswordMatched(password))) {
//       const refreshToken = await generateRefreshToken(findUser?._id);
//       const updateuser = await User.findByIdAndUpdate(
//         findUser.id,
//         {
//           refreshToken: refreshToken,
//         },
//         { new: true }
//       );

//       req.session.email = req.body.email; // Store email in the session
//       headerData(req, res);
//     } else {
//       notifier.notify({
//         title: 'Alert!',
//         message: 'Invalid Credentials',
//         sound: true,
//         wait: true
//       });
//     }
//   } catch (error) {
//     notifier.notify({
//       title: 'Alert!',
//       message: 'Something went wrong',
//       sound: true,
//       wait: true
//     });
//   }
// });

//Load profile
const profile = async (req, res) => {
  try {
    const email = req.cookies.email;
    var data = await User.findOne({ email: email });
    console.log(data);
    res.render("user/userAccount", { user: data });
  } catch (error) {
    console.log(error.message);
  }
};

const userProfile = async();
//update user details
const updateMob = async (req, res) => {
  const email = req.cookies.email;
  const { firstName, lastName, mobileNumber } = req.body;
  if (!firstName || !lastName || !mobileNumber) {
    return res.render("user/userAccount", {
      error: "Please fill in all fields.",
    });
  }
  try {
    // Find the user in the database based on email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("user/userAccount", { error: "User not found." });
    }

    // Update the user's information in the database
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { firstName, lastName, mobile: mobileNumber },
      { new: true }
    );

    // Redirect to the profile page with a success message
    res.render("user/userAccount", {
      success: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.render("user/userAccount", {
      error: "Error updating profile. Please try again.",
    });
  }
};

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.email) throw new Error("No Refresh Token in Cookies");
  const email = cookie.email;
  const user = await User.findOne({ email });

  if (!user) {
    res.clearCookie("email", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(
    { email },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("email", {
    httpOnly: true,
    secure: true,
  });

  res.redirect("loginpage");
  // res.sendStatus(204); // forbidden x
});
// user change password
const changePassword = async (req, res) => {
  try {
    console.log("yhan pr aay1a");
    const email = req.cookies.email;
    const { oldPassword, newPassword, retypePassword } = req.body;

    // Validate input data
    if (!oldPassword || !newPassword || !retypePassword) {
      return res.render("user/userAccount", {
        error: "Please fill in all fields.",
      });
    }

    if (newPassword != retypePassword) {
      return res.render("user/userAccount", {
        error: "New passwords do not match.",
      });
    }

    // Find the user in the database
    const user = await User.findOne({ email: email });
    console.log(user);

    if (!user) {
      return res.render("user/userAccount", { error: "User not found." });
    }

    // Update the user's password in the database

    const salt = await bcrypt.genSaltSync(10);
    let password = await bcrypt.hash(newPassword, salt);
    const filter = { email: email }; // Replace with the document ID you want to update
    const update = { $set: { password: password } }; // Specify the field and its new value
    const options = { returnOriginal: false };
    const updatedUser = await User.findOneAndUpdate(filter, update, options);

    // Redirect to the user account page with a success message
    res.render("user/login", { success: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating user password:", error);
    res.render("user/userAccount", {
      error: "Error updating password. Please try again.",
    });
  }
};
// Get all users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({ isDeleted: false });
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a single user
const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update a user
const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

//block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({ message: "User blocked" });
  } catch (error) {
    throw new Error(error);
  }
});

//unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

//add to cart
const addCart = asyncHandler(async (req, res) => {
  try {
    let userCartData = {
      email: req.cookies.email,
      product_id: req.query.productId,
    };
    const newAddCart = await addToCart.create(userCartData);

    // this will be responsible for header
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

    notifier.notify({
      title: "Alert!",
      message: "Item successfully added",
      sound: true,
      wait: true,
    });
  } catch (error) {
    console.log(error);

    notifier.notify({
      title: "Alert!",
      message: "Item already added",
      sound: true,
      wait: true,
    });
  }
  res.redirect('cart')
});

//get user cart
const getUserCart = asyncHandler(async (req, res) => {
  try {
    var cartData = await getCartData(req.cookies.email);
    /////
    var data = await nestedHeaderData();
    var isLoggedIn= await isUserLoggedIn(req.cookies.email);
    res.render("user/cart", { cart: cartData, header: data,isLoggedIn:isLoggedIn });
  } catch (error) {
    throw new Error(error);
  }
});

async function getCartData(emailAddress) {
  const email = emailAddress;
  const cart = await addToCart.find({ email: email });

  let productModel = [];

  let totalAmount = 0;
  for (i = 0; i < cart.length; i++) {
    let data = await Product.findOne({ _id: cart[i].product_id });
    totalAmount += data.price * cart[i].quantity;
    let totalItemPrice = data.price * cart[i].quantity;

    productModel.push({
      data: data,
      price: totalItemPrice,
      quantity: cart[i].quantity,
      product_id: cart[i].product_id,
    });
  }
  var dataToBeAdded = {
    email: emailAddress,
    products: productModel,
    totalAmount: totalAmount,
  };
  return dataToBeAdded;
}

async function nestedHeaderData() {
  // this will be responsible for header
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
  }); ////
  return nestedData;
}
//Delete items from cart
const deleteCartItem = async (req, res) => {
  try {
    const data = req.query.dataId;

    const cartItem = await addToCart.findOneAndDelete({ product_id: data });

    // getUserCart();
  } catch (error) {
    console.log(error.message);
  }
};

//Update cart quantity
const updateQuantity = async (req, res) => {
  try {
    const data = req.query.dataId;
    const quantity = req.query.quantity;
    const filter = { product_id: data };
    const update = { $set: { quantity: quantity } }; // Specify the field and its new value
    const options = { returnOriginal: false }; // Return the updated document
    const result = await addToCart.findOneAndUpdate(filter, update, options);

    // getUserCart();
  } catch (error) {
    console.log(error.message);
  }
};

//empty cart
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

//Product list
const productList = async (req, res) => {
  try {
    var type = req.query.type;
    var id = req.query.id;
    var categoryId = req.query.categoryId;

    getAllProduct(req, res, type, id, categoryId);
  } catch (error) {
    console.log(error.message);
  }
};
const checkout = async (req, res) => {
  try {
    var data = await getAddress(req.cookies.email);

    res.render("user/checkout_address", { address: data });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentMethod = async (req, res) => {
  try {
    let selectedAddress = req.body.selectedaddress;

    res.render("user/checkout_paymentmode", { address: selectedAddress });
  } catch (error) {
    console.log(error.message);
  }
};
const orderReview = async (req, res) => {
  try {
    let selectedAddress = req.query.id;
    let paymentMode = req.body.payment;
    let cardPayment = false;
    if (paymentMode.trim() == "CARD") {
      cardPayment = true;
    }
    var cartData = await getCartData(req.cookies.email);
    var address = await AddAddress.find({ _id: new ObjectId(selectedAddress) });

    res.render("user/checkout_review", {
      cart: cartData,
      address: address[0],
      paymentMode: paymentMode,
      cardPayment: cardPayment,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    res.render("user/addAddress");
  } catch (error) {
    console.log(error.message);
  }
};
const addNewAddressDB = async (req, res) => {
  try {
    const receiverName = req.body.receiver_name;
    const completeAddress = req.body.complete_address;
    const landMark = req.body.landmark;
    const email = req.cookies.email;

    var data = {
      receiverName: receiverName,
      completeAddress: completeAddress,
      landMark: landMark,
      email: email,
    };

    AddAddress.create(data).then(async (data, err) => {
      if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
      else {
        // session.isLoggedIn = true;

        var data = await getAddress(req.cookies.email);
        res.render("user/checkout_address", { address: data });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

async function getAddress(email) {
  let returnAddress;
  try {
    returnAddress = await AddAddress.find({ email: email });
  } catch (error) {}
  return returnAddress;
}
async function getAddressById(id) {
  let returnAddress;
  try {
    returnAddress = await AddAddress.find({ _id: new ObjectId(id) });
  } catch (error) {}
  return returnAddress;
}

const placeAnOrder = async (req, res) => {
  try {
    let address = await getAddressById(req.body.address);
    let getCustomerCart = await getCartData(req.cookies.email);
    const orderId = "order_" + crypto.randomBytes(8).toString("hex");
    var placeOrderData = {
      address: address[0],
      paymentMode: req.body.mode,
      cart: getCustomerCart,
      email: req.cookies.email,
      orderId: orderId,
    };
    var placeOrder = await Order.create(placeOrderData);
    const data = req.query.dataId;
    const cartItem = await addToCart.findOneAndDelete({ product_id: data });
    let deleteCartData = await addToCart.deleteMany({
      email: req.cookies.email,
    });
    return res.send(placeOrder);
  } catch (error) {
    console.log(error.message);
  }
};
const success = async (req, res) => {
  try {
    res.render("user/success");
  } catch (error) {
    console.log(error.message);
  }
};
const yourOrders = async (req, res) => {
  try {
    var orderPlacedData = await Order.find({ email: req.cookies.email }).sort({
      placedDate: -1,
    });
    res.render("user/customer-orders", { data: orderPlacedData });
  } catch (error) {
    console.log(error.message);
  }
};
const orderDetails = async (req, res) => {
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
        " ) ---> Shipped on "+ orderPlacedData[0].shippedDate +")---> Out for Deliver  on ( " +
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

    res.render("user/customer-order-detail", {
      data: orderPlacedData[0],
      cancelled: cancelled,
      status: currentStatus,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const cancelOrder = async (req, res) => {
  try {
    var orderPlacedData = await Order.findOneAndUpdate(
      { _id: new ObjectId(req.query.id) },
      { $set: { paymentStatus: "Cancelled", cancelDate: Date.now() } }
    );
    if(orderPlacedData.paymentMode=="CARD" && orderPlacedData.paymentStatus!="Cancelled" ){
    initiateRefund(orderPlacedData.paymentId,orderPlacedData.totalAmount)
  }
    res.render("user/cancel-order");
  } catch (error) {
    console.log(error.message);
  }
};

function isUserLoggedIn(email) {
  if (email === undefined || email === "") {
    return false;
  }
  return true;
}

const downloadInvoice = async (req, res) => {
  // Get the necessary data for the invoice (e.g., from a database)
  var orderPlacedData = await Order.findOne({
    _id: new ObjectId(req.query.id),
  });

  console.log(orderPlacedData);

  // Render the invoice template with the data
  res.render("user/invoice", { data: orderPlacedData }, (err, html) => {
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
};
const editAddress = async (req, res) => {
  try {
    var address = await AddAddress.findOne({
      _id: new ObjectId(req.query.addressId),
    });
    res.render("user/edit-address", { address: address });
  } catch (error) {
    console.log(error.message);
  }
};

const updateAddress = async (req, res) => {
  try {
    const receiverName = req.body.receiver_name;
    const completeAddress = req.body.complete_address;
    const landMark = req.body.landmark;

    var data = {
      receiverName: receiverName,
      completeAddress: completeAddress,
      landMark: landMark,
      email: req.cookies.email,
    };
    console.log(data);
    console.log(req.query.addressId);
    var address = await AddAddress.findOneAndUpdate(
      { _id: new ObjectId(req.query.addressId) },
      { $set: data }
    );
    console.log(address);

    var data = await getAddress(req.cookies.email);

    res.render("user/checkout_address", { address: data });
  } catch (error) {
    console.log(error.message);
  }
};
const deleteAddress = asyncHandler(async (req, res) => {
  try {
    const deleteaAddress = await AddAddress.findByIdAndDelete(
      req.query.addressId
    );
    var data = await getAddress(req.cookies.email);

    res.render("user/checkout_address", { address: data });
  } catch (error) {
    throw new Error(error);
  }
});
const contact = asyncHandler(async (req, res) => {
  try {
    var isLoggedIn= await isUserLoggedIn(req.cookies.email);
    res.render("user/contact",{isLoggedIn:isLoggedIn});
  } catch (error) {
    throw new Error(error);
  }
});

//Send mail

const sendContactMail = asyncHandler(async (req, res) => {
  let message =
    "Hi, \n Contact details" +
    req.body.firstName +
    " " +
    req.body.lastName +
    "\n User E-mail" +
    req.body.email +
    "\n Subject" +
    req.body.subject +
    "\n Message" +
    req.body.message +
    "\n Registered E-mail" +
    req.cookies.email;

  const transporter = nodemailer.createTransport({
    // Configure your email provider settings here
    // For example, for Gmail:
    service: "gmail",
    auth: {
      user: "anu.ragar0818@gmail.com",
      pass: "yllupvotekirihap",
    },
  });

  //   // Prepare the email message
  const mailOptions = {
    from: "anu.ragar0818@gmail.com",
    to: "anu.ragar0818@gmail.com",
    subject: "ShoppingZilla Contact",
    text: message,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.send("Error occurred while sending OTP");
    } else {
      notifier.notify({
        title: "ShoppingZilla",
        message: "Sent Successfully",
        sound: true,
        wait: true,
      });
      res.redirect("homepage");
    }
  });
});

//razopay payment

const razorpay = new Razorpay({
  key_id: "rzp_test_TmlmyXmr8AmCLC",
  key_secret: "pNNHoS4NOwkUhQYzVGNwnMJX",
});

const paymentGateway = asyncHandler(async (req, res) => {
  const amount = req.body.amount;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_receipt",
      payment_capture: 1, // Auto-capture payment
    });

    // res.json({
    //   orderId: order.id,
    //   amount: order.amount,
    //   currency: order.currency
    // });

    return res.send(order);
  } catch (error) {
    throw new Error(error);
  }
});

//Place an order by card
const placeOrderCard = async (req, res) => {
  try {
    let address = await getAddressById(req.body.address);
    let getCustomerCart = await getCartData(req.cookies.email);
    let paymentId = req.body.paymentId;
    let orderId = req.body.orderId;
    console.log(paymentId);
    console.log(orderId);
    //  console.log(getCustomerCart)

    // console.log({ address: address[0], paymentMode: req.body.mode, cart: getCustomerCart })

    var placeOrderData = {
      address: address[0],
      paymentMode: req.body.mode,
      cart: getCustomerCart,
      email: req.cookies.email,
      paymentId: paymentId,
      orderId: orderId,
    };
    console.log(placeOrderData);
    var placeOrder = await Order.create(placeOrderData);
    const data = req.query.dataId;
    const cartItem = await addToCart.findOneAndDelete({ product_id: data });
    let deleteCartData = await addToCart.deleteMany({
      email: req.cookies.email,
    });
    return res.send(placeOrder);
  } catch (error) {
    console.log(error.message);
  }
};

async function getWishlistData(emailAddress) {
  const email = emailAddress;
  console.log("butterfly butterfly");
  const wishlistData = await wishlist.find({ email: email });

  let productModel = [];
  for (i = 0; i < wishlistData.length; i++) {
    let data = await Product.findOne({ _id: wishlistData[i].product_id });

    productModel.push({ data: data, product_id: wishlistData[i].product_id });
  }
  var dataToBeAdded = { email: emailAddress, products: productModel };
  return dataToBeAdded;
}

const getWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlistData = await getWishlistData(req.cookies.email);
    const data = await nestedHeaderData();

    res.render("user/wishlist", { wishlist: wishlistData, header: data });
  } catch (error) {
    throw new Error(error);
  }
});

//add to wishlist
const addWishlist = asyncHandler(async (req, res) => {
  try {
    let userWislistData = {
      email: req.cookies.email,
      product_id: req.query.id,
    };
    const newAddWishlist = await wishlist.create(userWislistData);

    // this will be responsible for header
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
  } catch {
    notifier.notify({
      title: "Alert!",
      message: "Item already added",
      sound: true,
      wait: true,
    });
  }
});

//delete item from wishlist
const deleteWishItem = async (req, res) => {
  try {
    const data = req.query.dataId;

    const wishItem = await wishlist.findOneAndDelete({ product_id: data });

    // getUserCart();
  } catch (error) {
    console.log(error.message);
  }
};



  // // Create a new email document
  const newsUpdateEmail = async (req, res) => {
    const { newEmail } = req.body;

  try {
    // Create a new Email instance
    const email = new news({ newsEmail: newEmail });

    // Save the email to the database
    await email.save();

    res.redirect("homepage");
  } catch (error) {
    res.redirect("homepage");
    notifier.notify({
      title: "Alert!",
      message: "Your have already subscribed",
      sound: true,
      wait: true,
    });
    
  }
  notifier.notify({
    title: "Alert!",
    message: "Your have successfully subscribed",
    sound: true,
    wait: true,
  });
  };

  async function initiateRefund(PAYMENT_ID,REFUND_AMOUNT){
    try {
      razorpay.payments.refund(PAYMENT_ID, { amount: REFUND_AMOUNT })
      .then((response) => {
        console.log('Refund initiated successfully:', response);
      })
      .catch((error) => {
        console.error('Error initiating refund:', error);
      });
  
  } catch (error) {
   
  }
  }

module.exports = {
  newsUpdateEmail,
  deleteWishItem,
  addWishlist,
  getWishlist,
  placeOrderCard,
  paymentGateway,
  contact,
  deleteAddress,
  updateAddress,
  editAddress,
  downloadInvoice,
  changePassword,
  updateMob,
  cancelOrder,
  orderDetails,
  yourOrders,
  success,
  placeAnOrder,
  orderReview,
  addNewAddressDB,
  addAddress,
  paymentMethod,
  checkout,
  productList,
  createUser,
  otp,
  verifyOtp,
  loadLogin,
  profile,
  loginUserCtrl,
  updateQuantity,
  homePage,
  deleteCartItem,
  emptyCart,
  addCart,
  getallUser,
  getUserCart,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  sendContactMail,
};
