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
        console.log(productData);

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
        console.log(data);
        res.render('admin/product_edit', { data: data[0] });

    } catch (error) {
        console.log(error.message);
    }
}

const customerList = async (req, res) => {
    try {

        console.log(req.query.page);
        console.log(req.query.pre)
        var page;
        if (req.query.pre == "true") {
            page = parseInt(req.query.page) - 1 || 1;
        }
        else {
            page = parseInt(req.query.page) + 1 || 1;
            console.log(page);
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
        console.log(error.message);
    }
}
const createProductPage = async (req, res) => {
    try {
        const data = await Category.find();
        res.render('/admin/product_create', { category: data[0].category });

    } catch (error) {
        console.log(error.message);
    }
}
const productListPage = async (req, res) => {
    try {

        const data = await Product.find({ deleted: false });
        console.log(data);
        res.render('admin/product_list', { list: data });
    } catch (error) {
        console.log(error.message);
    }
}
const createSubCategory = async (req, res) => {
    try {

        const data = await Category.find();
        console.log(data[0].category);

        res.render('admin/create_subcategory', { category: data[0].category });
    } catch (error) {
        console.log(error.message);
    }
}
const createSubCategoryAPI = async (req, res) => {
    try {

        var data = req.body.category;
        var sub_category = req.body.subcategory;
        console.log("data+sub_category");
        console.log(data + sub_category);
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
        //         console.log('Error adding data to MongoDB:', err);
        //       } else {
        //         console.log('Data added successfully!');
        //       }
        //     });

        // res.render('admin/product_create', { category: data[0].category });
    } catch (error) {
        console.log(error.message);
    }
}
const productSearch = async (req, res) => {
    try {

        console.log(req.query.search);
        Product.find({ title: { $regex: req.query.search, $options: 'i' } })
            .then(users => res.render('admin/product_list', { list: users }))
            .catch(err => console.error(err));
    } catch (error) {
        console.log(error.message);
    }
}

const subCategories = async (req, res) => {
    try {

        const subcategoryId = req.query.categoryId;
        console.log(subcategoryId);
        // Retrieve subcategories based on the selected subcategory ID
        const result = await SubCategory.findOne({ 'subcategory.subcategoryId': subcategoryId });
        console.log(result);
        if (result) {
            const subcategory = result.subcategory.find((subcategory) => subcategory.subcategoryId === subcategoryId);
            console.log(subcategory.data);
            res.json(subcategory.data);
        } else {
            return null; // Return null if subcategoryId is not found
        }
    } catch (error) {
        console.log(error.message);
    }
}
const adminLoginPage = async (req, res) => {
    try {

        res.render('admin/login', { message: "" });
    } catch (error) {
        console.log(error.message);
    }
}
const adminLoginAPI = async (req, res) => {
    try {

        if (req.body.email == "admin@gmail.com" && req.body.password == "1234") {
            res.render('admin/index');
        }
        else {
            res.render('admin/login', { message: "Invalid Credentails" });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const adminIndexPage = async (req, res) => {
    try {

        res.render('admin/index');
    } catch (error) {
        console.log(error.message);
    }
}

const customerSearch = async (req, res) => {
    try {
        console.log(req.query.search);
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
        console.log(error.message);
    }
}

const deleteCustomer = async (req, res) => {
    try {
        const data = req.query.dataId
        console.log(data)
        console.log("Delete a user");
        const users = await User.findOneAndUpdate({ email: data }, { $set: { isDeleted: true } });
        const usersData = await User.find({ isDeleted: false });
        console.log(users);
        res.render('admin/customers', { users: usersData });
    } catch (error) {
        console.log(error.message);
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
        console.log(data);
        res.render('admin/product_list', { list: data });
    } catch (error) {
        console.log(error.message);
    }
}
const blockCustomer = async (req, res) => {
    var data = req.query.dataId;
    var blockedValue = req.query.blockedValue;
    console.log(blockedValue);
    if (blockedValue == 'Active') {
        blockedValue = true;
    } else {
        blockedValue = false;
    }
    console.log(blockedValue);
    try {
        // Update the document
        const filter = { email: data }; // Replace with the document ID you want to update
        const update = { $set: { isBlocked: blockedValue } }; // Specify the field and its new value
        const options = { returnOriginal: false }; // Return the updated document
        const result = await User.findOneAndUpdate(filter, update, options);
        const users = await User.find({ isDeleted: false });
        console.log(users);
        res.render('admin/customers', { users: users });


    } catch (error) {
        console.log(error.message);
    }
}

const logoutAdmin = async (req, res) => {

    try {
        res.redirect("adminLogin");
        // Update the document
        // req.session.destroy(function (err) {
        //     if (err) {
        //         console.log(err);
        //         res.send("Error")
        //     } else {
        //         //session.isLoggedIn = false;




        //     }
        // })
    } catch (error) {
        console.log(error.message);
    }
}
const orderList = async (req, res) => {

    try {
        var data = await Order.find();
        console.log(data);
        res.render("admin/order_list", { orderList: data });

    } catch (error) {
        console.log(error.message);
    }
}
const changeOrderStatus = async (req, res) => {

    try {

        if (req.query.status == "Shipped") {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, shippedDate: Date.now() } });
        }
        else if (req.query.status == "Delivered") {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, DeliveredDate: Date.now() } });
        } else {
            var changeStatus = await Order.findOneAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: req.query.status, OutDeliveryDate: Date.now() } });
        }


        var data = await Order.find();
        console.log(data);
        res.render("admin/order_list", { orderList: data });

    } catch (error) {
        console.log(error.message);
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

        console.log(error.message);
    }
}
module.exports = {
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
    createSubCategoryAPI
};