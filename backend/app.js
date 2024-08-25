import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import reportRoute from "./routes/report.js"

import commentRoute from "./routes/commentRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import { errorHandler, notFound } from "./middleWares/errorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// MiddleWare
app.use(express.json());
app.use(cors());

// DB connection
dbConnect();

// Server Routings
app.get("/", (req, res)=> {res.json({
  status:200,
  message:"Welcome to chwss platform"
})})
app.use("/api/users", userRoute);
app.use("/api/post", postRoute);
app.use("/api/comment", commentRoute);
app.use("/api/category", categoryRoute);
app.use("/api/report", reportRoute)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
