// const Product = require("../model/product");
// const Category = require("../model/categorie");
// const cloudinary = require("../config/cloudinary");
const User = require("../model/user")


let showList = async(req,res)=>{
    try {
        const user = await User.find()
        // console.log("this is customer show list " , user);
        res.render("admin/customers",{user})
    } catch (error) {
        console.log(error,"from show list in customer");
    }
}

module.exports = {

    showList
}