const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  phoneNumber: {
    type: String,
    // required: true,
  },
  otp: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpExpiration: {
    type: Date,
  },
  token: {
    type: String,
    default: null,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cart: {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        total: {
          type: Number,
        },
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    shippingcost: {
      type: Number,
      default: 40,
    },
  },

  wishlist: [
    {
      items: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
  address: [
    {
      // country: {
      //     type: String,

      // },
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      postcode: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
  ],
});

 

const User = mongoose.model("User", userSchema);

module.exports = User;
