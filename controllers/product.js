const Product = require("../model/product");
const Category = require("../model/categorie");
const cloudinary = require("../config/cloudinary");
// const tinycolor = require("tinycolor2");

// show the product list page
let listProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/product-list",{products});
  } catch (error) {
     console.error(error);
    res.status(500).json({ message: "An error occurred while fetching products" });
  }
};




// show the product add page
let ShowAddProduct = async (req, res) => {
  try {
    
    const categories = await Category.find();
    res.render("admin/product-add",{categories});
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "An error occurred while fetching categories" });
  }
};
const productAdding = async (req, res) => {
  try {
      const {
          productName,
          mrp,
          price,
          color,
          createdAt,
          category,
          meterial,
          description,
          modelNumber,
      } = req.body;

      
      

      // Get the cropped image data from the request body
      const croppedImageData = req.body.croppedMainImage;

      if (!croppedImageData) {
          return res.status(400).send("No cropped image found");
      }

      // Upload cropped image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(croppedImageData);

      // Construct the product object
      const newProduct = new Product({
          name: productName,
          meterial: meterial,
          mrp: mrp,
          price: price,
          color: color,
          createdAt: createdAt,
          category: category,
          // coupon: coupon,
          description: description,
          modelNumber: modelNumber,
          images: [cloudinaryResponse.secure_url], // Store cropped image URL in an array
      });
 

      // Save the product to the database
      await newProduct.save();

      // console.log('Product saved successfully');

      // Redirect to the product list page
      res.redirect("/listProduct");
  } catch (error) {
      console.error("Error saving Product:", error);
      res.status(500).json({ message: "An error occurred while saving the Product" });
  }
};


const editProduct = async (req, res) => {
  try {

    let productId = req.params.id;


    let product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const categories = await Category.find();

    if (!categories) {
      return res.status(404).send("categories not found");
    }
    res.render("admin/product-edit",{product,categories}); // Pass the product object to the template

  } catch (error) {
    res.status(500).send("Internal Server Error in product Edit");
  }
};



const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
 
   
    const {
      productName,
      mrp,
      price,
     
      category,
      material,
      color,
      description,
    } = req.body;

 
    let updateFields = {
      name: productName,
      mrp: mrp,
      price: price,
      color:color,
     
      category: category,
      material: material, 
      description: description,
    };


    // Check if there's a file to upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateFields.images = [result.secure_url];
    }

   

    // Update the product using findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }
 

    res.redirect("/listProduct");
  } catch (error) {
    console.error("Error updating Product:", error);
    res.status(500).send("Internal Server Error in product Update");
  }
};



const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Assuming product ID is passed in the URL parameters
    
    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).redirect("/listProduct");
  } catch (error) {
    console.error("Error deleting Product:", error);
    res.status(500).json({ message: "An error occurred while deleting the Product" });
  }
};
 
 

 
const singleProductDetails = async (req, res) => {
  try {
      const productId = req.params.id;
      const product = await Product.findOne({ _id: productId, productCategory: req.query.category }); // Include category filter
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
   
      res.render("user/product-details", { product });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};


 

 

module.exports = {
  listProduct,
  ShowAddProduct,
  productAdding,
  editProduct,
  updateProduct,
  deleteProduct,
  singleProductDetails,
 
};
