import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"

// Create User model

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Required"],
    },
    lastName: {
      type: String,
      required: [true, "First Name is Required"],
    },
    profilePhoto: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "guest", "blogger"],
    },
    isFollowing: { type: Boolean, default: false },
    isUnFollowing: { type: Boolean, default: false },
    isAccountVerified: { type: Boolean, default: false },
    accountVerificationToken: { type: String },
    accountVerificationTokenExpiration: { type: Date },
    viewedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    followers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    passwordChangedAt: { type: Date },
    passwordRestetToken: { type: String },
    passwordResetTokenExpire: { type: Date },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// SOME MIDDLEWARE

// Creating Virtual method to get the post created by this user because we don't have the field for post

UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "author",
  localField: "_id",
});

// hash user password
UserSchema.pre("save", async function (next) {
  // Check for password update
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// ========= Create an Account verification token ==========
UserSchema.methods.createAccountVerificationToken = async function () {
  //create a token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000; //10 minutes
  return verificationToken;
};

//=============== Password reset/forget ===========

UserSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; //10 minutes
  return resetToken;
};
// Compare password using bcryptjs
UserSchema.methods.isPasswordMatched = async function (userInputPassword) {
  return bcrypt.compare(userInputPassword, this.password);
};

// Compile schema into a model

const User = mongoose.model("User", UserSchema);
export default User;
