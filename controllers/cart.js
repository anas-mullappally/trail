const User = require("../model/user");
const Product = require("../model/product");

const showCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.render("user/login-register");
    }

    // console.log('this is useri',userId);

    // Find the user by ID and populate the bookings array with product details
    const user = await User.findById(userId)
      .populate("cart.products.product")
      .select("cart")
      .lean();

    if (!user) {
      return res.render("user/login-register");
    }
    const { cart } = user;
    cart.grandtotal = cart.subtotal + cart.shippingcost;
    if (cart.products.length <= 0) {
      cart.shippingcost = 0;
      cart.grandtotal = 0;
    }
    // console.log('this is grand total ',grandtotal);
    // Render the cart page with the user's bookings
    res.render("user/cart", {
      cart: user.cart,
    });

    // console.log('this is render  subtotal and grand : ' , subtotal,grandtotal);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addCart = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id; // Corrected to use req.user.id

  
  try {
    const user = await User.findById(userId).select("cart").exec();

    if (!user) {
      return res.render("user/login-register");
    }

    const product = await Product.findById(productId).select("price").lean();
    if (!product) {
      return;
    }
    const { cart } = user;

    const productIndex = cart.products.findIndex(
      (item) => String(item.product) === productId
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity++;
      cart.products[productIndex].total =
        cart.products[productIndex].quantity * product.price;
      cart.subtotal = product.price + cart.subtotal;
    } else {
      const newCartProduct = {
        product: product._id,
        quantity: 1,
        total: product.price,
      };
      cart.subtotal = product.price + cart.subtotal;
      cart.products.push(newCartProduct);
    }

    await user.save();
    return res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
    // Handle errors
    console.error("Error adding product to cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

// // singleCart
// const singleCart = async (req, res) => {
//   const productId = req.params.id;
//   const userId = req.user.id; // Corrected to use req.user.id

//   try {
//     const user = await User.findById(userId).select("cart").exec();

//     if (!user) {
//       return res.render("user/login-register");
//     }

//     const product = await Product.findById(productId).select("price").lean();
//     if (!product) {
//       return;
//     }
//     const { cart } = user;

//     const productIndex = cart.products.findIndex(
//       (item) => String(item.product) === productId
//     );

//     if (productIndex >= 0) {
//       cart.products[productIndex].quantity++;
//       cart.products[productIndex].total =
//         cart.products[productIndex].quantity * product.price;
//       cart.subtotal = product.price + cart.subtotal;
//     } else {
//       const newCartProduct = {
//         product: product._id,
//         quantity: 1,
//         total: product.price,
//       };
//       cart.subtotal = product.price + cart.subtotal;
//       cart.products.push(newCartProduct);
//     }

//     await user.save();
//     return res.redirect("/single/:id?success=addedToCart");
//   } catch (error) {
//     // Handle errors
//     console.error("Error adding product to cart:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

const buyNow = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id; // Corrected to use req.user.id

  try {
    const user = await User.findById(userId).select("cart").exec();

    if (!user) {
      return res.render("user/login-register");
    }

    const product = await Product.findById(productId).select("price").lean();
    if (!product) {
      return;
    }
    const { cart } = user;

    const productIndex = cart.products.findIndex(
      (item) => String(item.product) === productId
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity++;
      cart.products[productIndex].total =
        cart.products[productIndex].quantity * product.price;
      cart.subtotal = product.price + cart.subtotal;
    } else {
      const newCartProduct = {
        product: product._id,
        quantity: 1,
        total: product.price,
      };
      cart.subtotal = product.price + cart.subtotal;
      cart.products.push(newCartProduct);
    }

    await user.save();
    return res.redirect("/cart");
  } catch (error) {
    // Handle errors
    console.error("Error adding product to cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, type } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select("cart");
    const { cart } = user;

    const product = await Product.findById(productId).select("price").lean();
    if (!product) {
      return;
    }
    const productIndex = cart.products.findIndex(
      (item) => String(item.product) === productId
    );

    if (productIndex >= 0) {
      if (type === "dec") {
        cart.products[productIndex].quantity--;
        cart.products[productIndex].total =
          cart.products[productIndex].quantity * product.price;
        cart.subtotal = cart.subtotal - product.price;
      } else if (type === "inc") {
        cart.products[productIndex].quantity++;
        cart.products[productIndex].total =
          cart.products[productIndex].quantity * product.price;
        cart.subtotal = cart.subtotal + product.price;
      }
    } else {
      return res.status(404).json({ message: "booking not found" });
    }

    await user.save();

    return res.status(200).json({
      message: "Quantity update successfully",
      newQuantity: cart.products[productIndex].quantity,
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeProductCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId).select("cart");
    if (!user) {
      return res.render("user/login-register");
    }
    const { cart } = user;

    const index = cart.products.findIndex(
      (item) => String(item.product) === productId
    );

    if (index !== -1) {
      const amount = cart.products[index].total;
      cart.subtotal = cart.subtotal - amount;
      // Remove the object from the array
      cart.products.splice(index, 1);
      await user.save();
      return res.redirect("/cart");
    }

    return res.status(404).send("Product not found in cart");
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the product" });
  }
};

 

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user by ID and clear the bookings array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        cart: {
          products: [],
          shippingcost: 40,
          subtotal: 0,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.redirect("/cart");
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  showCart,
  addCart,
  updateQuantity,
  removeProductCart,
  clearCart,
  buyNow,
  // singleCart
};
