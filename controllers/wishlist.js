const User = require("../model/user");
const Product = require("../model/product");
const { log } = require("handlebars/runtime");

const wishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.render("user/login-register");
    }

    const user = await User.findById(userId).populate("wishlist.items");

    res.render("user/wishlist",{ wishlistItems: user.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    res.status(500).send("Internal Server Error");
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // console.log("productId", productId);

    // Check if the user is authenticated
    if (!userId) {
      return res.render("user/login-register");
    }

    // Update the user's document to add the product ID to the wishlist array
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "wishlist.items": { $ne: productId } }, // Check if the product is not already in the cart
      { $addToSet: { wishlist: { items: productId, wishlist: true } } }, // Update the 'cart' field to true
      { new: true }
    );

    if (updatedUser) {
      // return res.redirect('/Shop?success=addedToWishlist');
      return res.json({ success: "addedToWishlist" });
    } else {
      // return res.redirect(`/Shop?failed=ItemIsAlreadyInWishList&productId=${productId}`);
      return res.json({ failed: "ItemIsAlreadyInWishList" });
    }
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).send("Internal Server Error");
  }
};

 

const DeleteWishList = async (req, res) => {
  const productId = req.params.id;

  try {
      const updatedUserWishlist = await User.findOneAndUpdate(
          { "wishlist.items": productId },
          { $pull: { wishlist: { items: productId } } },
          { new: true }
      );

      if (!updatedUserWishlist) {
          return res.status(404).send("Product not found in wishlist");
      }

      // Sending a success response
      res.status(200).json({ message: "Product successfully removed from wishlist" });
  } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

 


const addCartWishlist = async (req, res) => {
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
    // return res.status(200).json({ message: "Product added to cart" });
    return res.redirect('/cart')
  } catch (error) {
    // Handle errors
    console.error("Error adding product to cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  wishlist,
  addToWishlist,
  DeleteWishList,

  addCartWishlist
};
