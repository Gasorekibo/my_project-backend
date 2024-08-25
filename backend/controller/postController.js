import expressAsyncHandler from 'express-async-handler';
import validateMongodbId from '../utils/validateMongodbId.js';
import fs from 'fs';
import Post from '../model/Post.js';
import User from '../model/User.js';
import Filter from 'bad-words';
import cloudinaryUploadPhoto from '../utils/cloudinary.js';

// -------------- CREATE A POST ------------

const createPostController = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  const filter = new Filter();
  const isProfaneWord = filter.isProfane(req.body.title, req.body.description);
  if (isProfaneWord) {
    await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      'Create Post Failed and you have been blocked because you have used profane words in your post.'
    );
  }
  await User.findByIdAndUpdate(_id, {
    $inc: { postCount: 1 },
  });
  const localPath = `public/images/posts/${req?.file?.filename}`;
  const imgUploaded = await cloudinaryUploadPhoto(localPath);
  try {
    const post = await Post.create({
      ...req.body,
      author: _id,
      image: imgUploaded?.url,
    });

    res.status(200).json(post);
    fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

// --------- Fetch all posts created by a specific user -----------
const fetchAllPostController = expressAsyncHandler(async (req, res) => {
  const { category } = req.query;

  try {
    if (category === 'undefined') {
      const posts = await Post.find()
        .populate('author')
        .populate('comments')
        .sort('-createdAt');
      res.status(200).json(posts);
    } else {
      const posts = await Post.find({ category: category })
        .populate('author')
        .populate('comments');
      res.status(200).json(posts);
    }
  } catch (error) {
    res.json(error);
  }
});

// ------------- Find a single post and populate the author info and update the number of views whenever this endpoint is called This will work in the way that after finding the single post we will increment then numViews field by 1 using mongodb inc method ----------

const fetchPostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findById(id)
      .populate('author')
      .populate('disLikes')
      .populate('likes')
      .populate('comments');

    // increase the number of view by 1.
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.json(error);
  }
});

// -------- Update a post -------------
const updatePostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndUpdate(id, {
      ...req.body,
      author: req.user?._id,
    });
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

// --------- Delete a post ----------
const deletePostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndDelete(id);
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

// ---------- Likes a particular post This involves different steps ------------------

const likePostController = expressAsyncHandler(async (req, res) => {
  // 1. Find a particular post user want to like
  const { postId } = req.body;
  validateMongodbId(postId);
  const post = await Post.findById(postId);
  // 2.Find the login user who want to like
  const loginUserId = req.user?._id;
  // 3. Find if this user liked the post before
  const isLiked = post?.isLiked;
  // 4 find if the login user disliked the post before by checking in dislikes array if the user exist.
  const isDisLiked = post?.disLikes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  // 5. Remove the login user from dislike array if he wants to like the post.
  if (isDisLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }

  // 6. Toggle likes and unlike of the post
  if (isLiked) {
    // unlike the post if login user already liked the post
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    // like the post when you didn't like it.
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

// ------------- Dislike post --------------
const disLikePostController = expressAsyncHandler(async (req, res) => {
  // 1. Find a particular post a user want to dislike
  const { postId } = req.body;
  const post = await Post.findById(postId);
  validateMongodbId(postId);
  // 2. Find the login user
  const loginUserId = req.user?._id;
  // 3.check if the login user disliked the post before,
  const isDisLiked = post?.isDisLiked;
  // 4. Find if the login user liked this post before
  const alreadyLiked = post?.likes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  // 5. Remove the login user from like array if he wants to dislike the post.
  if (alreadyLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  // 6. Toggle dislikes and undislike of the post
  if (isDisLiked) {
    // undislike the post if login user already disliked the post
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    // dislike the post when you  undislike it.
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { disLikes: loginUserId },
        isDisLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

export {
  createPostController,
  fetchAllPostController,
  fetchPostController,
  updatePostController,
  deletePostController,
  likePostController,
  disLikePostController,
};
