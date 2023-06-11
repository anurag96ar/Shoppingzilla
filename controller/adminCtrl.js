const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const async = require("hbs/lib/async");
const Category = require("../models/category");
const SubCategory = require("../models/sub_category");
const User = require("../models/userModel");
const multer = require('multer');
const Order = require("../models/order");
const { ObjectId } = require('mongodb');
const axios = require('axios');
const Razorpay = require("razorpay");
// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/'); // Specify the directory to save the uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename for each uploaded image
    }
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
            quantity
        };


        const filter = { _id: id, deleted: false }; // Replace with the document ID you want to update
        const update = { $set: { title: title, description: description, price: price, brand: brand, category: category, quantity: quantity } }; // Specify the field and its new value
        const options = { returnOriginal: false };
        Product.findOneAndUpdate(filter, update, options).then((data, err) => {
            if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
            else {
                //session.isLoggedIn = true;
                res.redirect('productList');
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

        res.render('admin/product_edit', { data: data[0] });

    } catch (error) {

    }
}

const customerList = async (req, res) => {
    try {


        var page;
        if (req.query.pre == "true") {
            page = parseInt(req.query.page) - 1 || 1;
        }
        else {
            page = parseInt(req.query.page) + 1 || 1;

        }

        // Get the requested page number
        const perPage = 10;
        // Query the total count of users
        const totalUsers = await User.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / perPage);
        User.find({ isDeleted: false }).skip((page - 1) * perPage)
            .limit(perPage)
            .then(users => res.render('admin/customers', {
                users: users, currentPage: page,
                totalPages,
            }))
            .catch(err => console.error(err));
        // const users = await User.find({ isDeleted: false });
        // res.render('admin/customers', { users: users });

    } catch (error) {

    }
}
const createProductPage = async (req, res) => {
    try {
        const data = await Category.find();
        res.render('/admin/product_create', { category: data[0].category });

    } catch (error) {

    }
}
const productListPage = async (req, res) => {
    try {

        const data = await Product.find({ deleted: false });

        res.render('admin/product_list', { list: data });
    } catch (error) {

    }
}
const createSubCategory = async (req, res) => {
    try {

        const data = await Category.find();


        res.render('admin/create_subcategory', { category: data[0].category });
    } catch (error) {

    }
}
const createSubCategoryAPI = async (req, res) => {
    try {

        var data = req.body.category;
        var sub_category = req.body.subcategory;


        let myobj = [
            { name: 'John', address: 'Highway 71' },
            { name: 'Peter', address: 'Lowstreet 4' },
            { name: 'Amy', address: 'Apple st 652' },
            { name: 'Hannah', address: 'Mountain 21' },
            { name: 'Michael', address: 'Valley 345' },
            { name: 'Sandy', address: 'Ocean blvd 2' },
            { name: 'Betty', address: 'Green Grass 1' },
            { name: 'Richard', address: 'Sky st 331' },
            { name: 'Susan', address: 'One way 98' },
            { name: 'Vicky', address: 'Yellow Garden 2' },
            { name: 'Ben', address: 'Park Lane 38' },
            { name: 'William', address: 'Central st 954' },
            { name: 'Chuck', address: 'Main Road 989' },
            { name: 'Viola', address: 'Sideway 1633' }
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
    } catch (error) {

    }
}
const productSearch = async (req, res) => {
    try {


        Product.find({ title: { $regex: req.query.search, $options: 'i' } })
            .then(users => res.render('admin/product_list', { list: users }))
            .catch(err => console.error(err));
    } catch (error) {

    }
}

const subCategories = async (req, res) => {
    try {

        const subcategoryId = req.query.categoryId;

        // Retrieve subcategories based on the selected subcategory ID
        const result = await SubCategory.findOne({ 'subcategory.subcategoryId': subcategoryId });

        if (result) {
            const subcategory = result.subcategory.find((subcategory) => subcategory.subcategoryId === subcategoryId);

            res.json(subcategory.data);
        } else {
            return null; // Return null if subcategoryId is not found
        }
    } catch (error) {

    }
}
const adminLoginPage = async (req, res) => {
    try {

        res.render('admin/login', { message: "" });
    } catch (error) {

    }
}
const adminLoginAPI = async (req, res) => {
    try {

        if (req.body.email == "admin@gmail.com" && req.body.password == "1234") {
            res.redirect('index');
        }
        else {
            res.render('admin/login', { message: "Invalid Credentails" });
        }
    } catch (error) {

    }
}

const adminIndexPage = async (req, res) => {
    try {
        const data = await dashbaordData();

        const weatherData = await getWeatherData();

        const blockUser = await User.count({
            $or: [
                { isBlocked: true, },
                { isDeleted: true }
            ]
        }
        )
        const activeUser = await User.count({
            $and: [
                { isBlocked: false, },
                { isDeleted: false }
            ]
        })



        // Calculate the start and end dates of the target year
        var cancelledData = await drawLineChartCancelled("Cancelled");
        var delivered = await drawLineChartCancelled("Delivered");
        var placed = await drawLineChartCancelled("Order Placed");

        const userPieData = [blockUser, activeUser];
        res.render('admin/index', { temp: weatherData.temp, userPieData,delivered, placed,cancelledData, todayBooking: data.todayBooking, totalBooking: data.totalBooking, cancelled: data.cancelled, totalCustomer: data.totalCustomer });
        // res.render('admin/index', { location: weatherData.location, temperature: weatherData.temperature });
    } catch (error) {
        console.log(error)
    }
}


async function drawLineChartCancelled(status) {

    const startDate1 = new Date(2021, 0, 1); // January 1st
    const endDate1 = new Date(2021 + 1, 0, 1);
    var data2021 = await Order.count({ placedDate: { $gte: startDate1, $lt: endDate1 }, paymentStatus: status }).sort({ placedDate: -1 });

    const startDate = new Date(2022, 0, 1); // January 1st
    const endDate = new Date(2022 + 1, 0, 1);
    var data2022 = await Order.count({ placedDate: { $gte: startDate, $lt: endDate }, paymentStatus: status }).sort({ placedDate: -1 });


    const startDate2 = new Date(2023, 0, 1); // January 1st
    const endDate2 = new Date(2023 + 1, 0, 1);
    var data2023 = await Order.count({ placedDate: { $gte: startDate2, $lt: endDate2 }, paymentStatus: status }).sort({ placedDate: -1 });
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
        User.find({ email: req.query.search, isDeleted: false }).skip((page - 1) * perPage)
            .limit(perPage)
            .then(users => res.render('admin/customers', {
                users: users, currentPage: page,
                totalPages,
            }))
            .catch(err => console.error(err));
    } catch (error) {

    }
}

const deleteCustomer = async (req, res) => {
    try {
        const data = req.query.dataId


        const users = await User.findOneAndUpdate({ email: data }, { $set: { isDeleted: true } });
        const usersData = await User.find({ isDeleted: false });

        res.render('admin/customers', { users: usersData });
    } catch (error) {

    }
}

const deleteProduct = async (req, res) => {
    try {
        var dataId = req.query.dataId;
        const filter = { _id: dataId }; // Replace with the document ID you want to update
        const update = { $set: { deleted: true } }; // Specify the field and its new value
        const options = { returnOriginal: false };
        const users = await Product.findOneAndUpdate(filter, update, options);
        const data = await Product.find({ deleted: false });

        res.render('admin/product_list', { list: data });
    } catch (error) {

    }
}
const blockCustomer = async (req, res) => {
    var data = req.query.dataId;
    var blockedValue = req.query.blockedValue;

    if (blockedValue == 'Active') {
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

        res.render('admin/customers', { users: users });


    } catch (error) {

    }
}

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
    } catch (error) {

    }
}
const orderList = async (req, res) => {

    try {
        var data = await Order.find();

        res.render("admin/order_list", { orderList: data, dropdownText: "Last 7 days" });

    } catch (error) {

    }
}
const changeOrderStatus = async (req, res) => {

    try {

        if (req.query.status == "Shipped") {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, shippedDate: Date.now() } });
        }
        else if (req.query.status == "Delivered") {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, DeliveredDate: Date.now() } });
        } else if (req.query.status == "Out for Delivery") {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, OutDeliveryDate: Date.now() } });
        } else {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, CancelDate: Date.now() } });

            if (changeStatus.paymentMode == "CARD") {
                initiateRefund(changeStatus.paymentId, changeStatus.totalAmount)
            }
        }


        var data = await Order.find();

        res.render("admin/order_list", { orderList: data, dropdownText: "Last 7 days" });

    } catch (error) {

    }
}
const razorpay = new Razorpay({
    key_id: "rzp_test_TmlmyXmr8AmCLC",
    key_secret: "pNNHoS4NOwkUhQYzVGNwnMJX",
});

async function initiateRefund(PAYMENT_ID, REFUND_AMOUNT) {
    try {
        razorpay.payments.refund(PAYMENT_ID, { amount: REFUND_AMOUNT })
            .then((response) => {

            })
            .catch((error) => {
                console.error('Error initiating refund:', error);
            });

    } catch (error) {

    }
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
            currentStatus = "Order Placed on (" + orderPlacedData[0].placedDate + " ) ---> Shipped on ( " + orderPlacedData[0].shippedDate + ") ---> Out For Delivery  ";
        }
        else if ((orderPlacedData[0].paymentStatus == "Order Placed")) {
            currentStatus = "Order Placed on ( " + orderPlacedData[0].placedDate + ") ---> Ready to ship";


        } else if (orderPlacedData[0].paymentStatus == "Out for Delivery") {
            currentStatus = "Order Placed on ( " + orderPlacedData[0].placedDate + " ) ---> Shipped on ( ${orderPlacedData[0].shippedDate} )---> Out for Deliver  on ( " + orderPlacedData[0].OutDeliveryDate + " ) ---> Deliver soon.. ";

        }
        else if (orderPlacedData[0].paymentStatus == "Delivered") {
            currentStatus = "Order Placed on ( " + orderPlacedData[0].placedDate + " ) ---> Shipped on ( " + orderPlacedData[0].shippedDate + " )---> Out for Deliver  on ( " + orderPlacedData[0].deliveryDate + " ) ---> Delivererd on ( " + orderPlacedData[0].DeliveredDate + " ) ";

        } else {
            currentStatus = "";
        }

        res.render('admin/order-detail', { data: orderPlacedData[0], cancelled: cancelled, status: currentStatus })


    } catch (error) {


    }
}
// Fetch weather data
async function getWeatherData() {
    const apiKey = '4d580cc975a64c5472b9b3b53c9b04db';
    const apiUrl = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=Bangalore&units=metric&appid=' + apiKey;

    try {
        const response = await axios.get(apiUrl);


        const temp = response.data.main.temp;

        return { temp };
    } catch (error) {

        throw new Error('Failed to fetch weather data.');
    }
}

async function dashbaordData() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    try {
        const todayBooking = await Order.count({ $expr: { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$placedDate' } }, today.toISOString().substring(0, 10)] } })
        const totalBooking = await Order.count()
        const cancelled = await Order.count({ paymentStatus: "Cancelled" })
        const totalCustomer = await User.count()

        return { todayBooking, totalBooking, totalBooking, cancelled, totalCustomer };
    } catch (error) {


    }
}

const last7Days = async (req, res) => {

    try {


        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 7);
        var orderList = await Order.find({ placedDate: { $gte: fifteenDaysAgo } }).sort({ placedDate: -1 });

        res.render("admin/order_list", { orderList: orderList, dropdownText: "Last 7 days" });

    } catch (error) {

    }
}
const last30days = async (req, res) => {

    try {


        const last30daysData = new Date();
        last30daysData.setDate(last30daysData.getDate() - 30);
        var orderList = await Order.find({ placedDate: { $gte: last30daysData } }).sort({ placedDate: -1 });

        res.render("admin/order_list", { orderList: orderList, dropdownText: "Last 30 days" });

    } catch (error) {

    }
}
const D2023 = async (req, res) => {

    try {


        const targetYear = 2023;

        // Calculate the start and end dates of the target year
        const startDate = new Date(targetYear, 0, 1); // January 1st
        const endDate = new Date(targetYear + 1, 0, 1);
        var orderList = await Order.find({ placedDate: { $gte: startDate, $lt: endDate } }).sort({ placedDate: -1 });

        res.render("admin/order_list", { orderList: orderList, dropdownText: "2023" });

    } catch (error) {

    }
}
const D2022 = async (req, res) => {

    try {

        const targetYear = 2022;
        // Calculate the start and end dates of the target year
        const startDate = new Date(targetYear, 0, 1); // January 1st
        const endDate = new Date(targetYear + 1, 0, 1);
        var orderList = await Order.find({ placedDate: { $gte: startDate, $lt: endDate } }).sort({ placedDate: -1 });

        res.render("admin/order_list", { orderList: orderList, dropdownText: "2022" });

    } catch (error) {

    }
}
const older = async (req, res) => {

    try {



        var orderList = await Order.find().sort({ placedDate: -1 });

        res.render("admin/order_list", { orderList: orderList, dropdownText: "Older" });

    } catch (error) {

    }
}
module.exports = {
    older, D2022, D2023, last30days, last7Days,
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

};