import express from "express";
import {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  fetchUserDetailsCtrl,
  userProfileCtrl,
  followingUserCtrl,
  unfollowUserCtrl,
  profilePhotoUploadCtrl,
  deleteUsersCtrl,
  updateUserCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  userToBlogger,
  getAllChw
} from "../controller/authController.js";
import { authMiddleware } from "../middleWares/authMiddleware.js";
import {
  profilePhotoUploadMiddleware,
  resizeImageMiddleware,
} from "../middleWares/fileUploadMiddleware.js";

const userRoute = express.Router();

userRoute.post("/register", userRegisterCtrl);
userRoute.post("/login", loginUserCtrl);
userRoute.get("/", authMiddleware, fetchUsersCtrl);
userRoute.get("/profile/:id", authMiddleware, userProfileCtrl);
userRoute.post(
  "/generate-verify-email-token",
  authMiddleware,
  generateVerificationTokenCtrl
);
userRoute.put("/verify-account", authMiddleware, accountVerificationCtrl);
userRoute.put("/follow", authMiddleware, followingUserCtrl);
userRoute.put("/unfollow", authMiddleware, unfollowUserCtrl);
userRoute.put("/update-profile", authMiddleware, updateUserCtrl);
userRoute.put("/block-user/:id", authMiddleware, blockUserCtrl);
userRoute.put("/unBlock-user/:id", authMiddleware, unBlockUserCtrl);

userRoute.put(
  "/profilephoto-upload",
  authMiddleware,
  profilePhotoUploadMiddleware.single("image"),
  resizeImageMiddleware,
  profilePhotoUploadCtrl
);
userRoute.delete("/:id",authMiddleware, deleteUsersCtrl);
userRoute.get("/:userId", authMiddleware,fetchUserDetailsCtrl);
userRoute.put("/:userId",authMiddleware, userToBlogger);
userRoute.get("/all/chw",authMiddleware, getAllChw);

export default userRoute;
