import Comment from "../model/Comment.js";
import validateMongodbId from "../utils/validateMongodbId.js";
import expressAsyncHandler from "express-async-handler";

// ----------- Create a comment ---------

const createCommentController = expressAsyncHandler(async (req, res) => {
  // 1. Find the post you want to comment on and description from req.body
  const { postId, description } = req.body;
  //   2. Find the author of the comment as the login user.
  const authorId = req?.user?._id;
  validateMongodbId(postId);
  try {
    const comment = await Comment.create({
      post: postId,
      author: authorId,
      description,
    });
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

// -------------- Fetch all comments -----------

const fetchAllCommentController = expressAsyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find({}).sort("-created");
    if (!comments) {
      res.json({ message: "Comments Not found" });
    }
    res.json(comments);
  } catch (error) {
    res.json(error);
  }
});

// -------- Fetch a single comment ---------
const fetchSinglePostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const comment = await Comment.find({ post: id }).populate("author");
    if (!comment) {
      res.json({ message: "Comment not found" });
    } else {
      res.json(comment);
    }
  } catch (error) {
    res.json(error);
  }
});

// ----------- update a particular comment ------------

const updateCommentController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const comment = await Comment.findByIdAndUpdate(
      id,
      {
        author: req?.user,
        description: req?.body?.description,
      },
      { new: true, runValidators: true }
    );
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

// --------- Delete a comment ---------
const deleteCommentController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const comment = await Comment.findByIdAndDelete(id);
    res.json({ comment, message: "the Comment above Deleted successfully" });
  } catch (error) {
    res.json(error);
  }
});

export {
  createCommentController,
  fetchAllCommentController,
  fetchSinglePostController,
  updateCommentController,
  deleteCommentController,
};
