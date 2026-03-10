import Category from '../models/Category.model.js';
import SubCategory from '../models/SubCategory.model.js';
import ItemType from '../models/ItemType.model.js';

/* ===============================
   ADMIN: CREATE CATEGORY TREE
   Category → SubCategory → ItemTypes
================================ */

export const createCategoryTree = async (req, res) => {
  try {

    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const createdData = [];

    for (const entry of payload) {

      const { category, subCategories } = entry;

      const createdCategory = await Category.create({
        name: category.name,
        image: category.image,
        position: category.position
      });

      const createdSubCategories = [];

      for (const sub of subCategories) {

        const createdSub = await SubCategory.create({
          categoryId: createdCategory._id,
          title: sub.title,
          position: sub.position
        });

        const createdItems = [];

        if (Array.isArray(sub.items)) {
          for (const itemName of sub.items) {

            const item = await ItemType.create({
              subCategoryId: createdSub._id,
              name: itemName
            });

            createdItems.push(item);
          }
        }

        createdSubCategories.push({
          ...createdSub.toObject(),
          items: createdItems
        });
      }

      createdData.push({
        category: createdCategory,
        subCategories: createdSubCategories
      });
    }

    res.status(201).json({
      success: true,
      message: "Category trees created successfully",
      data: createdData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ➕ CREATE SUB CATEGORY */
export const createSubCategory = async (req, res) => {
  try {
    const { categoryId, title, position } = req.body;

    const subCategory = await SubCategory.create({
      categoryId,
      title,
      position
    });

    res.status(201).json({
      success: true,
      message: 'SubCategory created successfully',
      data: subCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ➕ CREATE ITEM TYPE */
export const createItemType = async (req, res) => {
  try {
    const { subCategoryId, name } = req.body;

    const itemType = await ItemType.create({
      subCategoryId,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Item type created successfully',
      data: itemType
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ✏️ UPDATE CATEGORY */
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Category updated',
      data: category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ❌ DELETE CATEGORY (SOFT DELETE) */
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Category disabled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   SELLER CONTROLLERS
================================ */

/* 📦 SELLER – GET ALL ACTIVE CATEGORIES */
export const getCategoriesForSeller = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ position: 1 });

  res.json({ success: true, data: categories });
};

/* 📦 SELLER – GET SUBCATEGORIES BY CATEGORY */
export const getSubCategoriesForSeller = async (req, res) => {
  const subCategories = await SubCategory.find({
    categoryId: req.params.categoryId,
    isActive: true
  }).sort({ position: 1 });

  res.json({ success: true, data: subCategories });
};

/* 📦 SELLER – GET ITEM TYPES */
export const getItemTypesForSeller = async (req, res) => {
  const itemTypes = await ItemType.find({
    subCategoryId: req.params.subCategoryId,
    isActive: true
  });

  res.json({ success: true, data: itemTypes });
};

/* ===============================
   PUBLIC (USER) CONTROLLERS
================================ */

/* 🌍 PUBLIC – FULL CATEGORY TREE */
export const getPublicCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ position: 1 })
    .lean();

  const categoryIds = categories.map(c => c._id);

  const subCategories = await SubCategory.find({
    categoryId: { $in: categoryIds },
    isActive: true
  }).lean();

  const subCategoryIds = subCategories.map(s => s._id);

  const itemTypes = await ItemType.find({
    subCategoryId: { $in: subCategoryIds },
    isActive: true
  }).lean();

  const finalData = categories.map(category => ({
    ...category,
    subCategories: subCategories
      .filter(sc => sc.categoryId.toString() === category._id.toString())
      .map(sc => ({
        ...sc,
        items: itemTypes.filter(
          it => it.subCategoryId.toString() === sc._id.toString()
        )
      }))
  }));

  res.json({
    success: true,
    data: finalData
  });
};
