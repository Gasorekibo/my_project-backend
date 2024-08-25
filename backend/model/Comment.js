import mongoose from "mongoose";
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "post is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: [true, "author is required"]
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
