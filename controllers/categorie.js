const { log } = require("handlebars/runtime");
const Categorie = require("../model/categorie");
const Product = require("../model/product")

let categorieListShow = async (req, res) => {
  try {
    const category = await Categorie.find();
    res.render("admin/categorie-list", { category });
    
  } catch (error) {
 
    res.status(500).send("Internal Server Error in  category list page");
  }
};

let categorieAddShow = (req, res) => {
  try {
    res.render("admin/categories-add");
  } catch (error) {
 
    res.status(500).send("Internal Server Error in category show page");
  }
};

const submitAddCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategorie = new Categorie({
      categorie: name,
    });
    await newCategorie.save();
    const category = await Categorie.find();

    
    res.status(201).render("admin/categorie-list", { category });
  } catch (error) {
    // console.error("Error saving Categorie:", error);
    res
      .status(500)
      .json({ message: "An error occurred while saving the Categorie" });
  }
};

let categoryEdit = async (req, res) => {
  try {
    let categoryId = req.params.id;

     

    let category = await Categorie.findById(categoryId);

    if (!category) {
      return res.status(404).send("Category not found");
    }
 
    res.render("admin/categories-edit",{category});
 
  } catch (error) {
    res.status(500).send("Internal Server Error in category Edit");
  }
};

let categoryUpdate = async (req, res) => {
  try {
    
    let categoryId = req.params.id;
    let newCategoryName = req.body.categorie;

    let category = await Categorie.findById(categoryId);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Update the category name
    category.categorie = newCategoryName;

    // Save the updated category
    await category.save();

    return res.status(200).redirect("/categorie");
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).send("Internal Server Error in category Update");
  }
};





let categoryDelete = async (req, res) => {
  try {
    let categoryId = req.params.id;
   

    // findByAndDelete
    let category = await Categorie.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    return res.status(200).redirect("/categorie");
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const filterByCategory = async (req, res) => {
  try {
    const { categoryName } = req.query;
 
    // Find products matching the provided category name
    const products = await Product.find({ category: categoryName });

    // If products are found, return them in the response
    if (products.length > 0) {
      return res.json({ products });
    } else {
      return res.json({ message: "No products found for the provided category name" });
    }
  } catch (error) {
    // Handle errors
    console.error('Error filtering products by category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    // Find products matching the provided keyword
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } }, // Match product name
        { description: { $regex: keyword, $options: 'i' } }, // Match product description
        { category: { $regex: keyword, $options: 'i' } }, // Match product category
        // Add more fields to search here if needed
      ],
    });

    // If products are found, return them in the response
    if (products.length > 0) {
      return res.json({ products });
    } else {
      return res.json({ message: "No products found matching the search keyword" });
    }
  } catch (error) {
    // Handle errors
    console.error('Error searching products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getSortedProducts = async (req, res) => {
  try {
      const { sortBy } = req.query;
      let products;

      if (sortBy === 'priceLow') {
        // Sort products by price in ascending order
        products = await Product.find().sort({ price: 1 });
    } else if (sortBy === 'priceHigh') {
        // Sort products by price in descending order
        products = await Product.find().sort({ price: -1 });
    } else if (sortBy === 'nameAZ') {
        // Sort products by name in ascending order
        products = await Product.find().sort({ name: 1 });
    } else if (sortBy === 'nameZA') {
        // Sort products by name in descending order
        products = await Product.find().sort({ name: -1 });
    } else {
        // Fetch products without sorting
        products = await Product.find();
    }
      // Return products in the response
      res.json({ products });
  } catch (error) {
      // Handle errors
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
  categorieListShow,
  categorieAddShow,
  submitAddCategory,
  categoryEdit,
  categoryUpdate,
  categoryDelete,
  filterByCategory,
  searchProducts,
  getSortedProducts
};
