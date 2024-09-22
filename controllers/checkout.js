const User = require("../model/user");
const uuid = require("uuid");
const dotenv = require("dotenv");
dotenv.config();
const Admin = require("../model/admin");
// RAZORPAY
// const Razorpay = require("razorpay");
const Orders = require("../model/orders");
const Product = require("../model/product");
const moment = require("moment");
const { generateOrderId } = require("../utils/orderIdGenerator");
// const { log } = require("handlebars/runtime");

const addAddress = async (req, res) => {
  try {
    const formData = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new address object
    const newAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postcode: formData.postcode,
      email: formData.email,
      phone: formData.phone,
    };

    // Assuming user.address is an array field in the User model
    user.address.push(newAddress);
    await user.save();

    // console.log('New address saved:', newAddress);
    // console.log('Updated user:', user);

    // Redirect back to the checkout page or show a success message
    return res.redirect("/checkout");
  } catch (error) {
    console.error("Error in addAddress:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error adding address" });
  }
};

const showCheckout = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.redirect("/login-register");
    }

    const user = await User.findById(userId)
      .select("cart address")
      .populate("cart.products.product", "name");

    if (!user) {
      return res.status(404).send("User not found");
    }
    const { cart } = user;
    cart.grandtotal = cart.subtotal + cart.shippingcost;

    return res.render("user/checkout", {
      cart,
      address: user.address,
    });
  } catch (error) {
    console.error("Error in showCheckout:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// const placeOrder = async (req, res) => {
//   const { paymentMethod, selectedAddress } = req.body;
//   const {couponCode }= req.query
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId)
//       .populate("cart.products.product", "price name")
//       .select("cart address");
//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     const address = user.address.find(
//       (item) => String(item._id) === selectedAddress
//     );

//     delete address._id;
//     const products = user.cart.products.map((item) => ({
//       product: item.product._id,
//       quantity: item.quantity,
//       amount: item.total,
//     }));
//     const currentDate = moment();

//     // Format the date and time
//     const formattedDate = currentDate.format("DD-MM-YYYY hh:mm");

//     let orderId;
//     let isUnique = false;

//     do {
//       orderId = generateOrderId(); // Generate a new order ID
//       isUnique = !(await Orders.exists({ orderId })); // Check if the generated ID is unique
//     } while (!isUnique);

//     const orders = new Orders({
//       orderId,
//       products: products,
//       address,
//       orderedBy: userId,
//       date: formattedDate,
//       total: user.cart.subtotal + user.cart.shippingcost,
//       payment: {
//         method: paymentMethod,
//       },
//     });

//     user.cart.products = [];
//     user.cart.subtotal = 0;
//     await user.save();
//     await orders.save();

//     return res.redirect("/checkout?success=orderSuccessfully");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).render("error", {
//       message:
//         "An error occurred while placing the order. Please try again later.",
//     });
//   }
// };

 


const placeOrder = async (req, res) => {
  try {
    const { paymentMethod, selectedAddress, totalAmount } = req.body;

    // console.log(
    //   'This is payment method ',paymentMethod,
    //   'This is select address ',selectedAddress,
    //   'This is Total amount',totalAmount
    // );

    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId)
      .populate("cart.products.product", "price name")
      .select("cart address");

      
      // Check if user exists
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      const products = user.cart.products.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        amount: item.total ,// Assuming 'total' is the amount
        status:"pending"
      })); 
      
    // Find the selected address in user's addresses
    const address = user.address.find(
      (item) => String(item._id) === selectedAddress
    );
    if (!address) {
      return res.status(400).send("Selected address not found");
    }
    

    // Create new order
    const currentDate = moment();
    const formattedDate = currentDate.format("DD-MM-YYYY hh:mm");
    const orderId = generateOrderId();
    const newOrder = new Orders({
      orderId,
      address,
      orderedBy: userId,
      date: formattedDate,
      total: totalAmount, // Save the total amount in the order document
      payment: {
        method: paymentMethod,
      },
      products
    });

    // Clear user's cart and save order
    user.cart.products = [];
    user.cart.subtotal = 0;
    await user.save();
    await newOrder.save();

    return res.redirect("/checkout?success=orderSuccessfully");
  } catch (error) {

    console.error("Error",error);
    return res.status(500) 
    
  }
};

// RAZORPAY 
// // Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.KEY_ID,
//   key_secret: process.env.KEY_SECRET,
// });

// // Function to create Razorpay order
// async function createRazorpayOrder(req, res) {
//   try {
//     const userId = req.user.id;

//     if (!userId) {
//       return res.redirect("/login-register");
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     const { totalAmount } = req.body;

//     const total = totalAmount;
//     const options = {
//       amount: total * 100, // Amount in paise
//       currency: "INR",
//       receipt: uuid.v4(),
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json({ order, key_id: process.env.KEY_ID });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("An error occurred while creating Razorpay order.");
//   }
// }

 

// const razorpay = new Razorpay({
//   key_id: process.env.KEY_ID,
//   key_secret: process.env.KEY_SECRET
// });

// const createRazorpayOrder = async (req, res) => {
//   try {

//     const { totalAmount } = req.body;
//     console.log("this is boyd", req.body);
//     const key_id = process.env.KEY_ID;
//     const options = {
//       amount: totalAmount * 100, // Amount in paise
//       currency: 'INR',
//       receipt: uuid.v4(),
//     };

//     console.log("this is options", options);
//     const order = await razorpay.orders.create(options);
//     res.status(200).json({ order, key_id }); // Wrap order and key_id in an object for proper JSON response

//     console.log("this is new Options", order);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('An error occurred while creating Razorpay order.');
//   }
// };

// const saveRazorpayResponse = async (req, res) => {
//   try {
//     const { razorpayResponse, userId } = req.body;

//     // Extract relevant data from razorpayResponse
//     const { order_id, status } = razorpayResponse;

//     // Update the order status in the User collection
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $set: { "orders.$[elem].status": status } }, // Update the status of the relevant order
//       { arrayFilters: [{ "elem.orderId": order_id }], new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).send("User not found");
//     }

//     // Clear the user's bookings after placing the order
//     updatedUser.bookings = [];
//     await updatedUser.save();

//     return res.redirect("/checkout?success=orderSuccessfully");
//     // Handle other updates as per your requirement

//     // res.status(200).send("Razorpay response saved successfully");
//   } catch (error) {
//     console.error('Error while saving Razorpay response:', error);
//     res.status(500).send('An error occurred while saving Razorpay response.');
//   }
// }
 

const checkCouponController = async (req, res) => {
  try {
    const { couponCode } = req.body;

    // Find the admin with the provided coupon code
    const admin = await Admin.findOne({ "coupons.couponCode": couponCode });

    // If admin is found
    if (admin) {
      const currentDate = new Date();
      const coupon = admin.coupons.find(
        (coupon) => coupon.couponCode === couponCode
      );
      // console.log("this is coupon ", coupon, coupon.endDate);

      // Convert coupon.endDate to "DD/MM/YYYY" format
      const endDate = moment(coupon.endDate, "YYYY-MM-DDTHH:mm:ss.SSSZ").format(
        "DD/MM/YYYY"
      );
      // console.log("this is end date ", endDate);

      // Convert currentDate to string type
      const currentDateAsString = currentDate.toISOString();

      // Convert endDate to string type
      const endDateAsString = moment(endDate, "DD/MM/YYYY").toISOString();

      // If the coupon has expired
      if (moment(endDate, "DD/MM/YYYY").isBefore(currentDate)) {
        return res.status(400).json({ error: "Coupon has expired." });
      } else {
        // Coupon code is valid
        return res
          .status(200)
          .json({ valid: true, discountAmount: coupon.discountAmount });
      }
    } else {
      // Coupon code is invalid
      res.json({ valid: false });
    }
  } catch (error) {
    console.error("Error checking coupon validity:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking the coupon validity." });
  }
};

module.exports = {
  showCheckout,
  addAddress,
  placeOrder,
  // RAZORPAY
  // createRazorpayOrder,
  checkCouponController,
  // saveRazorpayResponse
};
