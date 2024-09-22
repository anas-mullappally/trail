const User = require("../model/user");
const Product = require("../model/product");
const Admin = require("../model/admin");
const Category = require("../model/categorie");
const generateOTP = require("../utils/otpGenerator");
const jwt = require("jsonwebtoken");
const Orders = require("../model/orders");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { log } = require("handlebars/runtime");
// const { log } = require("handlebars");

require("dotenv").config();

// get homepage
let homePage = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.render("user/index");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;

     

    const user = await User.findOne({ _id: req.user.id });
    const products = await Product.find();

    const admin = await Admin.findOne();

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.render("user/index", { products, user, coupons: admin.coupons });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Internal Server Error in home page" });
  }
};

// get shop page
let showShop = async (req, res) => {
  try {
    const categories = await Category.find();
    const products = await Product.find();
    res.render("user/shop-fullwide", { products, categories });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      message:
        "An error occurred while fetching shop data. Please try again later.",
    });
  }
};

// get myAccount
const account = async (req, res) => {
  try {
    // Ensure req.user exists and contains the user ID
    if (!req.user.id) {
      return res.status(401).render("user/login-register");
    }

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const orders = await Orders.find({ orderedBy: req.user.id })
      .populate("products.product", "name")
      .select("products status  total payment date orderId")
      .sort({ createdAt: -1 }) //latest first it will come
      .lean();

    

    res.render("user/my-account", { user, orders });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
};

// logout user
const logout = (req, res) => {
  res.clearCookie("jwt"); // Clear the JWT cookie
  // res.clearCookie('userId')
  res.redirect("/"); // Redirect to login page or any other appropriate page
};

const blockUnblock = async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (user) {
      user.blocked = !user.blocked;
      await user.save();

      // console.log("block status :", user.blocked);
    }
    res.redirect("/customersList");
  } catch (error) {
    res.status(500).send("admin is changing the user status");
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    
    const order = await Orders.findById(orderId).populate(
      "products.product",
      "name "
    );
    
    
    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found in user's orders array" });
    }

    // If order found, return the order details
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching order details" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await Orders.findById(orderId);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const { products } = order;

    // Find the product within the order by productId
    const product = products.find((item) => String(item.product) === productId);
   

    // Check if the product exists within the order
    if (!product) {
      return res.status(404).json({ error: "Product not found in the order" });
    }

    // Update the status of the product to "cancelled"
    product.status = "cancelled";

    // Save the updated order
    await order.save();

    res.json({ message: "Product cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error cancelling product" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user data stored in the request object
    const addressId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the address from the user's address array
    user.address = user.address.filter((address) => address._id != addressId);
    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const priceFiltration = async (req, res) => {
  try {
    // Extracting price range from request body
    const priceRange = req.body.price;

    // Splitting the price range string by " - " to get start and end prices
    const [startPriceString, endPriceString] = priceRange.split(" - ");

    // Removing "$" sign and converting to numbers
    const startPrice = parseFloat(startPriceString.replace("$", ""));
    const endPrice = parseFloat(endPriceString.replace("$", ""));

    // console.log("Start Price:", startPrice);
    // console.log("End Price:", endPrice);

    // Find products within the specified price range
    const products = await Product.find({
      price: {
        $gte: startPrice,
        $lte: endPrice,
      },
    });

    // console.log("Products found:", products);

    // Send response with found products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error:", error);
    // Handle errors appropriately
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const forgotPasswordRendring = async (req, res) => {
  try {
    res.render("user/forgotPassword");
  } catch (error) {
    console.error("Error rendering forgot password page:", error);
    res.status(500).send("Internal Server Error");
  }
};

// const passwordChangeRendring = async (req, res) => {
//   try {
//     res.render("user/password-change");
//   } catch (error) {
//     console.error("Error rendering password change page:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// Function to create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

// Function to send OTP via email
const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: "miduzack3007@gmail.com",
      to: email,
      subject: "OTP for email verification",
      text: `Your OTP is: ${otp}`,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error; // Rethrow the error to handle it in the caller function
  }
};

// const checkEmail = async (req, res) => {
//   try {
//     const { email } = req.query;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const otp = generateOTP();

//     // console.log("Generated OTP:", otp);

//     req.session.otp = otp;
//     req.session.email = email
    
//     console.log(req.session.email);
//     console.log('req.sesio',req.session.otp);

//     await sendOTP(email, otp);

//     res.render("user/otp", { email, otp }); // Assuming this is your OTP verification page
//   } catch (error) {
//     console.error("Internal server Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
const optRendring = async (req, res) => {
  try {
    res.render("user/otp", { email: req.session.email, otp: req.session.otp });
  } catch (error) {
    console.error("Error rendering OTP page:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body; // Assuming the email is sent in the request body
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: " User not found! please check your email !!" });
    }

    const otp = generateOTP();

    // console.log('GenerateOTP',otp);
    // Save email and OTP in session
    req.session.email = email;
    req.session.otp = otp;

    await sendOTP(email, otp);

    // Return email and OTP as JSON response
    res.status(200).json({ email, otp });
  } catch (error) {
    console.error("Internal server Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


 
// const verifyOTP = async (req, res) => {
//   try {
//     // const { otp, email } = req.body;
//     console.log(req.body);
//     console.log(req.session.email);
//     console.log(req.session.otp);
//     const sessionOTP = req.session.otp; // Retrieve the OTP stored in session

//     // console.log(req.body);
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.send("User not found");
//     }

//     const userEmail = user.email; // Extract the email from the user object
   

//     // Check if the OTP entered by the user matches the OTP stored in session
//     const isCorrectOTP = otp === sessionOTP;
 

//     // Render the password change page with email and OTP verification status
//     res.render("user/password-change", { email: userEmail, isCorrectOTP });
//   } catch (error) {
//     console.error("Error checking OTP:", error);
//     return res.status(500).send("Internal server error");
//   }
// };

// const passwordChangeRendring = async (req, res) => {
//   const message = req.session.invalidOTP ? 'Invalid OTP' : ' ' // Check if OTP is invalid
//   req.session.invalidOTP = false; // Reset invalidOTP flag
//   res.render('user/otp', { message :'Invalid otp'});
// }



const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const sessionOTP = req.session.otp; // Retrieve the OTP stored in session
    const sessionEmail = req.session.email; // Retrieve the email stored in session
 
    // Check if the OTP and email match the ones stored in session
    if (otp !== sessionOTP ) {
     
      return res.render('user/otp',{message:'invalidOTP!!'}); // Redirect to the OTP form with error message
    }

    // If OTP is correct, render the password change page with email and OTP verification status
    res.render('user/password-change', { email: sessionEmail, otp: sessionOTP });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
 



const passwordChange = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
 

    // If newPassword is not provided, return 400 Bad Request
    if (!newPassword) {
      return res.status(400).render({ message: "New password is required" });
    }

    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await User.updateOne({ email: email }, { $set: { password: hashedPassword } });

    // Password changed successfully
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// const passwordChange = async (req, res) => {
//   try {
//       const { email, newPassword } = req.body;

//       // Check if newPassword is provided
//       if (!newPassword) {
//           return res.status(400).json({ message: "New password is required" });
//       }

//       // Check if the user exists in the database
//       const user = await User.findOne({ email });
//       if (!user) {
//           return res.status(404).json({ message: "User not found" });
//       }


//       // Hash the new password
//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       // Update the user's password in the database
//       await User.updateOne({ email: email }, { $set: { password: hashedPassword } });

//       // Password changed successfully
//       return res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//       console.error("Error changing password:", error);
//       return res.status(500).json({ message: "Internal server error" });
//   }
// };

 
const updateUser = async (req, res) => {
  try {
     const userId = req.user.id; // Assuming userId is provided in the request parameters
    const { name, phoneNumber, email } = req.body; // Assuming name, phoneNumber, and email are provided in the request body

    // Find the user by userId
    const user = await User.findById(userId);
 
    // If user is not found, return 404 Not Found error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's information
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;

    // Save the updated user
    await user.save();

    // Return success response
    return res.status(200).json({ message: "User information updated successfully" });
  } catch (error) {
    console.error(error);
    // Return error response
    return res.status(500).json({ message: "An error occurred while updating user information" });
  }
};


const contact = async (req,res)=>{
  try {
    res.render('user/contact')
  } catch (error) {
    
  }
}



 
// const searching =  async (req, res) => {
//   const { keyword } = req.query;
//   try {
//       // Search for categories containing the keyword
//       const results = await Categorie.find({ categorie: { $regex: keyword, $options: 'i' } });
//       res.json(results);
//   } catch (error) {
//       console.error('Error searching:', error);
//       res.status(500).json({ error: 'An error occurred while searching.' });
//   }
// }




// const sendMessage = async (req, res) => {
//     const { name, email, subject, message } = req.body;

    
//     // Configure Nodemailer
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'process.env.APP_EMAIL', // Your Gmail email address
//             pass: 'process.env.APP_PASSWORD' // Your Gmail password
//         }
//     });

//     // Email content
//     const mailOptions = {
//         from: email,
//         to: 'midlajmidu0002@gmail.com', // Recipient's email address
//         subject: subject,
//         text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log(error);
//             res.status(500).json({ error: 'Failed to send message. Please try again later.' });
//         } else {
//             console.log('Email sent: ' + info.response);
//             res.json({ message: 'Message sent successfully!' });
//         }
//     });
// };



module.exports = {
  homePage,
  showShop,
  logout,
  account,
  blockUnblock,
  getOrderDetails,
  cancelOrder,
  deleteAddress,
  priceFiltration,
  forgotPasswordRendring,
  // verifyOTPRendring,
  optRendring,
  checkEmail,
  verifyOTP,
  // passwordChangeRendring,
  passwordChange,
  updateUser,
  contact,
  // searching,
  // sendMessage
};
