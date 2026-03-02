import Product from "../models/Product.model.js";
import mongoose from "mongoose";

/* =====================================
   CREATE PRODUCT (SELLER)
===================================== */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      sellerId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================
   UPDATE PRODUCT (SELLER)
===================================== */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Product updated",
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================
   DELETE PRODUCT (SELLER)
===================================== */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Product deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================
   GET SELLER PRODUCTS
===================================== */
export const getSellerProducts = async (req, res) => {
  const products = await Product.find({
    sellerId: req.user._id
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: products.length,
    products
  });
};

/* =====================================
   GET SINGLE PRODUCT (PUBLIC)
===================================== */


export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    /* ===============================
       VALIDATE OBJECT ID
    ================================ */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    /* ===============================
       FIND PRODUCT (PUBLIC)
    ================================ */
    const product = await Product.findOne({
      _id: id,
      isActive: true,
      status: "published"
    })
      .populate("categoryId", "name slug")
      .populate("subCategoryId", "name slug")
      .populate("itemTypeId", "name slug")
      .populate("sellerId", "name")
      .lean(); // ⚡ performance

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    /* ===============================
       ANALYTICS (NON-BLOCKING)
    ================================ */
    Product.updateOne(
      { _id: id },
      { $inc: { "hotDeal.analytics.views": 1 } }
    ).exec();

    /* ===============================
       RESPONSE
    ================================ */
    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/* =====================================
   GET ALL PRODUCTS (PUBLIC)
===================================== */
export const getPublicProducts = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    categoryId,
    subCategoryId,
    itemTypeId,
    minPrice,
    maxPrice
  } = req.query;

  const filter = {
    isActive: true,
    status: "published"
  };

  if (categoryId) filter.categoryId = categoryId;
  if (subCategoryId) filter.subCategoryId = subCategoryId;
  if (itemTypeId) filter.itemTypeId = itemTypeId;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    products
  });
};



/* =====================================
   CATEGORY → SUBCATEGORY → ITEMTYPE
   WITH FILTERS (PRODUCTION READY)
===================================== */
// controllers/product.controller.js
export const getCategoryProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      subCategoryId,
      itemTypeId,
      brand,
      minPrice,
      maxPrice
    } = req.query;

    const filter = {
      categoryId,
      isActive: true,
      status: "published"
    };

    if (subCategoryId) filter.subCategoryId = subCategoryId;
    if (itemTypeId) filter.itemTypeId = itemTypeId;
    if (brand) filter.brand = brand;

    // ✅ PRICE FILTER (FIX)
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





export const getPublicProduct = async (req, res) => {
  try {
    const { brand, minPrice, maxPrice } = req.query;

    const filter = {
      isActive: true,
      status: "published"
    };

    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

