import expressAsyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import validateMongodbId from "../utils/validateMongodbId.js";

// ------------------Create a category------------

const createCategoryController = expressAsyncHandler(async (req, res) => {
  try {
    const category = await Category.create({
      user: req?.user?._id,
      title: req?.body?.title,
    });
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

// ------------- Fetch all category -----------
const fetchAllCategoryController = expressAsyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate("user")
      .sort("-createdAt");
    res.json(categories);
  } catch (error) {
    res.json(error);
  }
});

// ----------- Fetch a single Category-----------
const FetchSingleCategoryController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const category = await Category.findById(id).populate("user");
    if (!category) {
      res.json({ message: "No category Found" });
    } else {
      res.json(category);
    }
  } catch (error) {
    res.json(error);
  }
});

// -------------- Update a category ---------

const updateCategoryController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

// -------------- Delete category ----------
const deleteCategoryController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const category = await Category.findByIdAndDelete(id);
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

export {
  createCategoryController,
  fetchAllCategoryController,
  FetchSingleCategoryController,
  updateCategoryController,
  deleteCategoryController,
};
