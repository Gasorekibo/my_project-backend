import express from "express";
import {
  createCommentController,
  fetchAllCommentController,
  fetchSinglePostController,
  updateCommentController,
  deleteCommentController,
} from "../controller/commentController.js";
import { authMiddleware } from "../middleWares/authMiddleware.js";
const commentRoute = express.Router();

commentRoute.post("/", authMiddleware, createCommentController);
commentRoute.get("/", authMiddleware, fetchAllCommentController);
commentRoute.get("/:id", authMiddleware, fetchSinglePostController);
commentRoute.put("/:id", authMiddleware, updateCommentController);
commentRoute.delete("/:id", authMiddleware, deleteCommentController);

export default commentRoute;
