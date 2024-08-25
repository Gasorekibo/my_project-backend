import express from "express";
import {
  FetchSingleCategoryController,
  createCategoryController,
  deleteCategoryController,
  fetchAllCategoryController,
  updateCategoryController,
} from "../controller/categoryController.js";
import { authMiddleware } from "../middleWares/authMiddleware.js";

const categoryRoute = express.Router();

categoryRoute.post("/", authMiddleware, createCategoryController);
categoryRoute.get("/", authMiddleware, fetchAllCategoryController);
categoryRoute.get("/:id", authMiddleware, FetchSingleCategoryController);
categoryRoute.put("/:id", authMiddleware, updateCategoryController);
categoryRoute.delete("/:id", authMiddleware, deleteCategoryController);

export default categoryRoute;
