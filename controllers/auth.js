// auth related
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../model/user");
const generateOTP = require("../utils/otpGenerator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const Product = require("../model/product");

// get  loginPage
const loginPage = (req, res) => {
  try {
    res.render("user/login-register");
  } catch (err) {
    console.error("Error rendering login page:", err);
    res.status(500).send("Internal Server Error");
  }
};

const otpReg = (req, res) => {
  try {
    res.render("user/otp-register");
  } catch (err) {
    console.error("Error rendering otp register", err);
    res.status(500).send("Internal Server Error");
  }
};

// handle login submission
const submitLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).render("user/login-register", {
        message: "User does not exist. Please Register.",
      });
    }

    // Check if the user is blocked
    if (user.blocked) {
      console.error("This account has been restricted by the admin");
      return res.render("user/login-register", {
        message: "This account has been restricted by the admin",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(404).render("user/login-register", {
        message: "Incorrect password. Please try again.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "24h",
      }
    );

    // Set JWT Token in a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      // secure: process.env.NODE_ENV === "production",
    });

    // Optionally, store user ID in a separate cookie
    // res.cookie("userId", user._id, {
    //   maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    //   // secure: process.env.NODE_ENV === "production",
    // });

    const products = await Product.find();

    // res.render("user/index", { products });
    res.redirect("/")
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

// LOGIN With Google
const successGoogleLogin = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).send("no user data , Login failed");
    }

    let user = await User.findOne({ email: req.user.email });

    if (!user) {
      user = new User({
        name: req.user.displayName,
        email: req.user.email,
      });
      await user.save();
    }

    // generate jwt token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "24h",
      }
    );

    //set JWT Token in a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).redirect("/");

    // console.log("User logged in with Google : jwt created");
  } catch (error) {
    console.error("Error logging in with Google:", error);

    res.status(500).redirect("user/login");
  }
};

const failureGooglelogin = (req, res) => {
  res
    .status(500)
    .render("user/login-register", { message: "Error logging in with Google" });
};

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

// handle signup form submission
let submitRegister = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const userExist = await User.exists({ email: email.toLowerCase() });

    if (userExist) {
      return res.status(400).render("user/login-register", {
        success: false,
        message: "Email already exists. Please try again.",
      });
    }

    const otp = generateOTP();

    req.session.otp = otp;

    // console.log(otp);
    await sendOTP(email, otp);

    res.render("user/otp-register", {
      email,
      phoneNumber,
      password,
      otp,
      name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error", error });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp, name, phoneNumber, password } = req.body;
  try {
    if (otp !== req.session.otp) {
      return res
        .status(400)
        .render("user/otp-register", { error: "Invalid OTP" });
    }

    // const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user data in the database
    const newUser = new User({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const products = await Product.find();

    return res.render("user/login-register", { products });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error in verifyOTP");
  }
};

module.exports = {
  loginPage,
  submitRegister,
  submitLogin,
  sendOTP,
  verifyOTP,
  otpReg,
  successGoogleLogin,
  failureGooglelogin,
};
