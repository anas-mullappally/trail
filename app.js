const exphbs = require("express-handlebars");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const userRouter = require("./routers/user");
const authRoutes = require("./routers/auth");
const adminRouter = require("./routers/admin");
const categorieRouter = require("./routers/categerie");
const productRouter = require("./routers/product");
const customersRouter = require("./routers/customers");
const cartRouter = require("./routers/cart");
const wishlistRouter = require("./routers/wishlist");
const checkoutRouter = require("./routers/checkout");

const bodyParser = require("body-parser");
const connectDatabase = require("./config/database");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const RedisStore = require("connect-redis").default; // Updated syntax for connect-redis v4+
const redis = require("redis");

// Initialize Redis client
const redisClient = redis.createClient({
  host: 'localhost', // Replace with your Redis host if it's not localhost
  port: 6379, // Default Redis port
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// cors
const cors = require("cors");
const corsConfig = {
  origin: "*",
  credentials: "true",
  methods: ["GET", "POST", "PUT", "DELETE"]
};

const app = express();

app.use(cors());
app.use(cors(corsConfig));
const port = 2328;

app.use(cookieParser());

// Register a custom helper function for JSON.stringify
const handlebars = exphbs.create({
  helpers: {
    stringify: function (context) {
      return JSON.stringify(context);
    },
  },
});

// Configure Handlebars
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware with RedisStore
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use environment variable for secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set secure to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use("/", authRoutes);
app.use("/", userRouter);
app.use("/", adminRouter);
app.use("/", categorieRouter);
app.use("/", productRouter);
app.use("/", customersRouter);
app.use("/", cartRouter);
app.use("/", wishlistRouter);
app.use("/", checkoutRouter);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectDatabase();
});
