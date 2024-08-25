import expressAsyncHandler from "express-async-handler";
import Report from "../model/Report.js";
import User from "../model/User.js"
import fs from "fs";
import cloudinaryUploadPhoto from "../utils/cloudinary.js"
import validateMongodbId from "../utils/validateMongodbId.js"

// ======= Create Report =====

const createReport = expressAsyncHandler(async(req, res)=> {
    try {
        const {_id} = req.user
        //1. Get the local path to img
  const localPath = `public/images/reports/${req.file.filename}`;
  //2.Upload to cloudinary
  const imgUploaded = await cloudinaryUploadPhoto(localPath);
        const report = await Report.create({
            title: req.body.title,
            reporter:_id,
            description: req.body.description,
            chw: req.body.chw,
            image:imgUploaded?.url
        });
        fs.unlinkSync(localPath);
        if(!report) {
            res.json({
                status: fail,
                message:"Failed to add new report",

            })
        } else {
            return res.status(200).json({
                success: true,
                data: report
            })
    
        }
        
    } catch (error) {
        throw new Error(error.message || "Something went wrong")
    }
})


// ===== Get All reports reported to this CHW ===
const getAllReport = expressAsyncHandler(async(req, res)=> {
    validateMongodbId(req.params._id)
    try {
        const reports = await Report.find({chw:req?.params?._id}).populate("chw").populate("reporter").sort({"_id": -1});
        if(!reports) return res.status(404).json({
            success: false,
            message: "No Reports found for this CHW"
        })
        if(reports.length > 0) {
            
            return res.status(200).json({
                    status:true,
                    data:reports
            })
        } else {
            return res.status(404).json({
                success:false,
                message:"No Reports Found For This CHW"
            })
        }
    } catch (error) {
        throw new Error(error.message || "Something went wrong") 
    }
})
// ===== Get All reports Reported by Specific reporter ==
const getSingleReporter = expressAsyncHandler(async(req, res)=> {
    validateMongodbId(req.query.i)
    try {
        const reports = await Report.find({reporter:req.query.i}).sort({_id:-1});
        return res.status(200).json({
                status:true,
                data:reports && reports.length > 0 ? reports: "No Report Found"
        })
    } catch (error) {
        throw new Error(error.message || "Something went wrong")
    }
})
// ===== Get single reports Reported by Specific reporter ==
const getSingleReport = expressAsyncHandler(async(req, res)=> {
    validateMongodbId(req.query.i)
    try {
        const reports = await Report.findById(req.query.i).populate("reporter");
        // return res.status(200).json({
        //         status:true,
        //         data:reports ? reports: "No Report Found"
        // })

    const imageUrl = reports.image;

    return res.status(200).json({
      success: true,
      data: {
        reporter: reports.reporter,
        title: reports.title,
        description: reports.description,
        image: imageUrl,
        chw: reports.chw,
        _id: reports._id,
        __v: reports.__v,
        downloadLink: `${imageUrl}?dl=true`,
      },
    });
    } catch (error) {
        throw new Error(error.message || "Something went wrong")
    }
})

const deleteReport = expressAsyncHandler(async(req, res)=> {
    validateMongodbId(req.params.id)
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        return res.json({
            message:"Deleted Successfully",
            data:report?"Report Deleted":"Report Already Deleted"
        })
    } catch (error) {
        throw new Error(error.message || "Something went wrong")
  
    }
})

// ====== Forward report to admin =====
const forwardReport = expressAsyncHandler(async(req, res)=> {
    validateMongodbId(req.query.id)
    try {
        const report = await Report.findById(req.query.id)
        if(!report) {
            throw new Error("Report not found")
        }
        const admin = await User.findOne({isAdmin:true});
        if(!admin) {
            throw new Error("No admin Found")
        }
        const reportForward = await Report.findByIdAndUpdate( req.query.id,{
            title: report?.title,
            reporter:report?.chw,
            description: report?.description,
            chw: admin?._id,
            image:report?.image,
            
        }, {new:true})
        report.isForwarded = true;
        await report.save()
        res.status(200).json({
            success:true,
            message:"Report Forwarded Successfully",
            data:reportForward
        })
    } catch (error) {
        throw new Error(error.message)
    }
});
// ======= Find All forwarded reports ====

const getForwarded = expressAsyncHandler(async(req, res)=> {
    try {
        const forwared = await Report.find({isForwarded:true}).populate("reporter").sort({_id:-1});
        res.status(200).json({
            success:true,
            data:forwared.length > 0 ? forwared : "No Report Found"
        })
    } catch (error) {
       throw new Error(error.message) 
    }
})
export {
    createReport,
    getAllReport,
    getSingleReporter,
    getSingleReport,
    deleteReport,
    forwardReport,
    getForwarded
}
