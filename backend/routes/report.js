import express from "express";
import {authMiddleware} from "../middleWares/authMiddleware.js";
import {profilePhotoUploadMiddleware,
    reportResizeMiddleware,
} from "../middleWares/fileUploadMiddleware.js";

import {createReport, getAllReport, getSingleReporter,
    getSingleReport, deleteReport, forwardReport, getForwarded} from "../controller/reportController.js"
const reportRoute = express.Router();

reportRoute.post("/add", authMiddleware, profilePhotoUploadMiddleware.single("image"),reportResizeMiddleware,createReport);
reportRoute.get("/:_id",getAllReport);
reportRoute.get("/user", authMiddleware,getSingleReporter);
reportRoute.get("/single/rpt", authMiddleware,getSingleReport);
reportRoute.delete("/:id", authMiddleware,deleteReport);
reportRoute.get("/", authMiddleware,forwardReport);
reportRoute.get("/all/forwarded", authMiddleware,getForwarded);

export default reportRoute;