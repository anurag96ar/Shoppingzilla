const express = require('express')
const path = require('path')
const nodemailer = require('nodemailer')
const flash = require('express-flash')
const Razorpay = require('razorpay');
// const dbConnect = require('./config/dbConnect')
const connectDB = require("./config/dbConnect");
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 4000
const authRouter = require('./routes/authRoute')
const productRouter = require("./routes/productRoute");
const adminRouter = require("./routes/adminRoute");
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser')
// const morgan = require('morgan');
const { getAllProduct, getaProduct } = require('./controller/productCtrl');
const Category = require("./models/category");

const Banner = require("./models/banner");
const SubCategory = require("./models/sub_category");
const User = require("./models/userModel");
const Product = require("./models/productModel");
const addToCart = require("./models/addToCart");
const session = require('express-session')
const { ObjectId } = require('mongodb');
const fs = require('fs')
const sharp = require('sharp')


connectDB();

// app.use(morgan())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// load static assets
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public/userHome/css')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/fonts/Manrope')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/fonts/Nunito')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/fonts/Roboto')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/auth')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/carousel')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/dashboard')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/demo')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/faces')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/file-icons/64')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/file-icons/128')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/file-icons/256')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/file-icons/512')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/lightbox')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/samples/300x300')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/samples/1280x768')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/images/sprites')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark/components')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark/components/loaders')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark/components/mail-components')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark/components/plugin-overrides')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark/landing-screens')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/dark/mixins')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light')))

app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light/components')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light/components/loaders')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light/components/mail-components')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light/components/plugin-overrides')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light/landing-screens')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/common/light/mixins')))
app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/fonts/Manrope')))

app.use('/', express.static(path.join(__dirname, 'public/admin-styles/scss/vertical-layout-light')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'public')))



const Handlebars = require('handlebars');


const hbs = require('hbs');
app.set('view engine', 'hbs')
hbs.registerHelper('if_equal', function (a, b, opts) {
  if (a == b) {
    return opts.fn(this)
  } else {
    return opts.inverse(this)
  }
});


hbs.registerHelper('isNegative', function(value, options) {
  if (value < 0) {
    return options.fn(this);  // Render the content within the {{#isNegative}} block
  } else {
    return options.inverse(this);  // Render the content within the {{else}} block
  }
});

hbs.registerHelper('gt', function (a, b, opts) {
  if (a > b) {
    return opts.fn(this);
  }
  else {

  }
});

hbs.registerHelper('if_lt', function (a, b, opts) {
  if (a < b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});


app.use('/api/user/',authRouter)
app.use("/api/product", productRouter);
app.use('/admin', adminRouter);

app.get('/productDetails', (req, res) => {

  getaProduct(req.query.id, res)

});

app.get('/otp', (req, res) => {

  res.render('otp');
});



app.get('/admin/createProduct', async (re, res) => {
  try {
    const data = await Category.find();
    console.log(data[0].category);
    res.render('admin/product_create', { category: data[0].category });

  } catch (error) {
    console.log(error.message);
  }
});

const multer = require('multer');
const { randomInt } = require('crypto');

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/'); // Specify the directory to save the uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename for each uploaded image
  }
});
const upload = multer({ storage: storage });

const sharpImage = (req, res, next) => {
  req.files.forEach((file) => {
    const inputBuffer = fs.readFileSync(file.path);
    sharp(inputBuffer)
      .resize({ width: 350, height: 450, fit: "fill" })
      .toFile(file.path, (err) => {
        if (err) throw err;
      });
  });

  next();
};


app.post('/uploadProduct', upload.array('files', 5),sharpImage, (req, res) => {

  // Access the form fields via req.body and the uploaded files via req.files array
  const title = req.body.title;
  const description = req.body.about;
  const price = req.body.price;
  const brand = req.body.brand;
  const category = req.body.category;
  const sub_category = req.body.sub_category;
  const product_sub_category = req.body.product_sub_category;
  const slug = '';
  const quantity = req.body.quantity;
  let images = [];
  //  console.log(JSON.stringify(req.files))

  var fileData = JSON.stringify(req.files)
  fileData = JSON.parse(fileData);

  // console.log(fileData)
  for (let i = 0; i < fileData.length; i++) {
    // console.log(files[i]['path'])
    // console.log(files[i].fieldname);
    var data = { type: i == 0 ? "back" : "front", image: fileData[i].filename };

    images.push(data);

  }

  const productData = {
    slug,
    title,
    description,
    price,
    brand,
    category,
    sub_category,
    product_sub_category,
    images,
    quantity
  };
  //  console.log(productData);
  Product.create(productData).then((data, err) => {
    if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
    else {
      // session.isLoggedIn = true;
      res.redirect('admin/productList');
    }
  });

  // Process the form data and uploaded files as needed
  // Save file information to database, associate with name and email, etc.


});

app.post('/uploadBanner', upload.array('files', 3), (req, res) => {

  // Access the form fields via req.body and the uploaded files via req.files array
  const title = req.body.title;
  const slug = '';

  let images = [];
  //  console.log(JSON.stringify(req.files))

  var fileData = JSON.stringify(req.files)
  fileData = JSON.parse(fileData);

  // console.log(fileData)
  for (let i = 0; i < fileData.length; i++) {
    // console.log(files[i]['path'])
    // console.log(files[i].fieldname);
    var data = { type: i == 0 ? "back" : "front", image: fileData[i].filename };

    images.push(data);
  }
  const bannerData = {
    slug,
    title,
    images,
  };
  //  console.log(productData);
  Banner.create(bannerData).then((data, err) => {
    if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
    else {
      // session.isLoggedIn = true;
      res.redirect('admin/banner');
    }
  });

  // Process the form data and uploaded files as needed
  // Save file information to database, associate with name and email, etc.

});


app.post('/updateProduct', upload.array('files', 5), async (req, res) => {


  const id = req.query.id;
  
  // Access the form fields via req.body and the uploaded files via req.files array
  const title = req.body.title;
  const description = req.body.about;
  const price = req.body.price;
  const brand = req.body.brand;
  const category = req.body.category;
  const sub_category = req.body.sub_category;
  const product_sub_category = req.body.product_sub_category;
  const slug = '';
  const quantity = req.body.quantity;
  let images = [];
  //  console.log(JSON.stringify(req.files))

  var fileData = JSON.stringify(req.files)
  fileData = JSON.parse(fileData);

  // console.log(fileData)
  for (let i = 0; i < fileData.length; i++) {
    // console.log(files[i]['path'])
    // console.log(files[i].fieldname);
    var data = { type: i == 0 ? "back" : "front", image: fileData[i].filename };

    images.push(data);

  }
  var findProductforImages = await Product.findOne({ _id: new ObjectId(id) })
  console.log(findProductforImages);
  if (findProductforImages.images.length > 0) {
    for (let i = 0; i < findProductforImages.images.length; i++) {
      var data = { type: i == 0 ? "back" : "front", image: findProductforImages.images[i].image };
      images.push(data);
    }
  }
  const productData = {
    slug,
    title,
    description,
    price,
    brand,
    category,

    images,
    quantity
  };
  //  console.log(productData);
  Product.findOneAndUpdate({ _id: id }, productData).then((data, err) => {
    if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
    else {
      // session.isLoggedIn = true;
      console.log(data)
      res.redirect('admin/productList');
    }
  });

  // Process the form data and uploaded files as needed
  // Save file information to database, associate with name and email, etc.


});

app.post('/createSubCategoryAPI', async (req, res) => {
  try {
    let myobj = new Array();


    // Retrieve subcategories based on the selected subcategory ID

    // myobj.push(subcategory.data);
    var data;
    if (req.body.subcategory.includes(',')) {
      data = req.body.subcategory.split(",");
    } else {
      data = req.body.subcategory.split(",");
    }
    for (let i = 0; i < data.length; i++) {
      var subCat = { "id": data.length + i.toString(), "type": data[i].toUpperCase() };
      myobj.push(subCat);
    }
  
    const filter = { _id: new ObjectId('6467be0b1343ecd88c358086') };
    //  const filter = { "subcategoryId": req.body.category.toString() };
    const update = { $push: { "subcategory.$[elem].data": myobj } };
    var response = await SubCategory.updateOne(filter, update, { arrayFilters: [{ "elem.subcategoryId": req.body.category }] });
    console.log(response);
    res.redirect('admin/index');
  } catch (error) {
    console.log(error.message);
  }

});



app.use(notFound)
app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/api/user/loginpage`)
  console.log(`Server is running on port http://localhost:${PORT}/admin/adminLogin`)
})

