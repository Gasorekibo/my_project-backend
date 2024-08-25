import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import User from "../model/User.js";

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(decodedToken?.id).select("-password");

        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("No Token or it has Expired");
    }
  } else {
    throw new Error("No Token Attached to headers or it has Expired");
  }
});
export { authMiddleware };
