import express from "express";
import {
  createPostController,
  deletePostController,
  fetchAllPostController,
  fetchPostController,
  updatePostController,
  likePostController,
  disLikePostController,
} from "../controller/postController.js";
import { authMiddleware } from "../middleWares/authMiddleware.js";
import {
  profilePhotoUploadMiddleware,
  postImgResizeMiddleware,
} from "../middleWares/fileUploadMiddleware.js";

const postRoute = express.Router();

postRoute.post(
  "/create-post",
  authMiddleware,
  profilePhotoUploadMiddleware.single("image"),
  postImgResizeMiddleware,
  createPostController
);
postRoute.put("/dislikes", authMiddleware, disLikePostController);
postRoute.put("/likes", authMiddleware, likePostController);
postRoute.get("/", fetchAllPostController);
postRoute.get("/:id", fetchPostController);
postRoute.put("/:id", authMiddleware, updatePostController);
postRoute.delete("/:id", authMiddleware, deletePostController);

export default postRoute;
