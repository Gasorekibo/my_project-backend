import expressAsyncHandler from "express-async-handler";
import fs from "fs";
import generateToken from "../config/generateToken.js";
import User from "../model/User.js";
import validateMongodbId from "../utils/validateMongodbId.js";
import cloudinaryUploadPhoto from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

//-------------------------------------
//Register
//-------------------------------------

const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  //Check if user Exist
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");
  try {
    //Register user
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//-------------------------------
//Login user
//-------------------------------

const loginUserCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user exists
  const userFound = await User.findOne({ email });
  //check if blocked
  if (userFound?.isBlocked)
    throw new Error("Access Denied You have been blocked");
  if (userFound && (await userFound.isPasswordMatched(password))) {
    //Check if password is match
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
      isVerified: userFound?.isAccountVerified,
      role:userFound?.role
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

//------------------------------
//Users
//-------------------------------
const fetchUsersCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).sort({_id:-1});
    res.status(200).json({
      success:true,
      data:users
    })
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Delete user
//------------------------------
const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.isAdmin
  validateMongodbId(id);
  try {
    if(!isAdmin) {
      throw new Error("You don't have permission to delete user")
    }
    const deletedUser = await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: deletedUser? "Deleted Successfully": "No user Found or have already deleted",
      data:deletedUser?deletedUser: null
    })
  } catch (error) {
    throw new Error(error)
  }
});

//----------------
//user details
//----------------
const fetchUserDetailsCtrl = expressAsyncHandler(async (req, res) => {
  const {_id} = req?.user
  const { userId } = req.params;
  validateMongodbId(userId);
  try {
    const user = await User.findById(userId).populate("viewedBy");
    
    if (!user.viewedBy.includes(_id)) {
      user.viewedBy.push(_id);
      await user.save();
    }
    res.json(user);
    
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//User profile
//------------------------------
const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  //1.Find the login user
  //2. Check this particular if the login user exists in the array of viewedBy

  //Get the login user
  try {
    const userProfile = await User.findById(id).populate("posts").populate("viewedBy");
    res.json(userProfile);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Update profile
//------------------------------
const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  //block

  validateMongodbId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

//------------------------------
//Update password to be done after
//------------------------------

// const updateUserPasswordCtrl = expressAsyncHandler(async (req, res) => {
//   //destructure the login user
//   const { _id } = req.user;
//   const { password } = req.body;
//   validateMongodbId(_id);
//   //Find the user by _id
//   const user = await User.findById(_id);

//   if (password) {
//     user.password = password;
//     const updatedUser = await user.save();
//     res.json(updatedUser);
//   } else {
//     res.json(user);
//   }
// });

//------------------------------
//following
//------------------------------

const followingUserCtrl = expressAsyncHandler(async (req, res) => {
  //1.Find the user you want to follow and update it's followers field
  //2. Update the login user following field
  const { followId } = req.body;
  const loginUserId = req.user.id;

  //find the target user and check if the login id exist
  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) throw new Error("You have already followed this user");

  //1. Find the user you want to follow and update it's followers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  //2. Update the login user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  res.json("You have successfully followed this user");
});

//------------------------------
//unfollow
//------------------------------

const unfollowUserCtrl = expressAsyncHandler(async (req, res) => {
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );

  res.json("You have successfully unfollowed this user");
});

//------------------------------
//Block user
//------------------------------

const blockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  res.json(user);
});

//------------------------------
//unBlock user
//------------------------------

const unBlockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
});

//------------------------------
// Generate Email verification token done
//------------------------------
const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;

  try {
    const user = await User.findById(loginUserId);
    //Generate token
    const verificationToken = await user?.createAccountVerificationToken();
    //save the user
    console.log(verificationToken);
    await user.save();
    //build your message
    const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a>`;
    await sendEmail(user?.email, resetURL);
    res.json(resetURL);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Account verification  To be done
//------------------------------
const accountVerificationCtrl = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log(hashedToken);
  //find this user by token
  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("Token expired, try again later");
  //update the proprt to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();
  res.json(userFound);
});

//------------------------------
//Forget token generator To be done after
//------------------------------

// const forgetPasswordToken = expressAsyncHandler(async (req, res) => {
//   //find the user by email
//   const { email } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) throw new Error("User Not Found");

//   try {
//     //Create token
//     const token = await user.createPasswordResetToken();

//     await user.save();

//     //build your message
//     const resetURL = `If you were requested to reset your password, reset now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/reset-password/${token}">Click to Reset</a>`;
//     const msg = {
//       to: email,
//       from: "twentekghana@gmail.com",
//       subject: "Reset Password",
//       html: resetURL,
//     };

//     await sgMail.send(msg);
//     res.json({
//       msg: `A verification message is successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`,
//     });
//   } catch (error) {
//     res.json(error);
//   }
// });

//------------------------------
//Password reset To be done after
//------------------------------

// const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
//   const { token, password } = req.body;
//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//   //find this user by token
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });
//   if (!user) throw new Error("Token Expired, try again later");

//   //Update/change the password
//   user.password = password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   res.json(user);
// });
//------------------------------
//Profile photo upload
//------------------------------

const profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
  //Find the login user

  const { _id } = req.user;

  //block user

  //1. Get the local path to img
  const localPath = `public/images/profiles/${req.file.filename}`;
  //2.Upload to cloudinary
  const imgUploaded = await cloudinaryUploadPhoto(localPath);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded?.url,
    },
    { new: true }
  );
  //remove the saved img from local file
  fs.unlinkSync(localPath);
  res.json(foundUser);
});

// ====== Change user into bloger =======

const userToBlogger = expressAsyncHandler(async(req,res)=> {
  try {
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      return res.json({
        success: false,
        message: "You don't have permission",
      })
    }
    else {
      const user = await User.findById(req.params.userId);
      if (!user) {
        throw new Error("No such user");
      }
      else {
        user.role = 'blogger';
      }
      await user.save();
      res.status(200).send({success : true , msg:"user changed to blogger Successfully", data : user})
    }
  } catch (error) {
    
  }
})

// ========== Get All Community Healthworkers ======

const getAllChw = expressAsyncHandler(async(req, res)=> {
  try {
    const chws = await User.find({role:"blogger"});
    if (chws) {
      res.status(201).send({msg:'Success',data:chws})
    }
    else {
      throw new Error('Error')
    }
  } catch (error) {
    throw Error(error.message || 'Something went wrong')
  }
})
export {
  profilePhotoUploadCtrl,
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUserDetailsCtrl,
  userProfileCtrl,
  updateUserCtrl,
  followingUserCtrl,
  unfollowUserCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  userToBlogger,
  getAllChw
};
