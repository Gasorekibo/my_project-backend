// configure multer to specify the file we want to upload, this file will contain other explanation coz it is my first time to work with this library

import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from 'fs'


export const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
  return true;
};

const multerStorage = multer.memoryStorage();



const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // upload success
    cb(null, true);
  } else {
    cb({ msg: "unsupport image format." }, false);
  }
};

// configure our middle ware

const profilePhotoUploadMiddleware = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 4000000, //Max 4MB
  },
});
const multertestFilter = (req, file, cb) => {
  if (!file) {
    // No file uploaded
    cb(null, true);
  } else if (file.mimetype === "text/csv") {
    // CSV file uploaded successfully
    cb(null, true);
  } else {
    // Unsupported file format
    cb({ msg: "Unsupported file format. Please upload a CSV file." }, false);
  }
};

// test upload
const testPhotoUploadMiddleware = multer({
  storage: multerStorage,
  fileFilter: multertestFilter,
  limits: {
    fileSize: 4000000, //Max 4MB
  },
});

// profile image resizing middleware
const resizeImageMiddleware = expressAsyncHandler(async (req, res, next) => {
  // if no file uploaded from the above middleware, else we will have access to the image using req.file
  if (!req.file) {
    next();
  } else {
    // give a file a custom name to prevent upload of similar profile photo;

    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
    const output = path.join(`public/images/profiles/${req.file.filename}`);
    ensureDirectoryExistence(output);
    await sharp(req.file.buffer)
      .resize(250, 250)
      .toFormat("jpeg")
      .jpeg({
        quality: 90,
      })
      .toFile(output);

    next();
  }
});

//----------------- post image resizing -------------

const postImgResizeMiddleware = expressAsyncHandler(async (req, res, next) => {
  if (!req.file) {
    next();
  } else {
    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
    const output = path.join(`public/images/posts/${req.file.filename}`)
    ensureDirectoryExistence(output);
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({
        quality: 90,
      })
      .toFile(output);

    next();
  }
});


// ========= Report image =====

const reportResizeMiddleware = expressAsyncHandler(async (req, res, next) => {
  // if no file uploaded from the above middleware, else we will have access to the image using req.file
  if (!req.file) {
    next();
  } else {
    // give a file a custom name to prevent upload of similar profile photo;

    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
    const output = path.join(`public/images/reports/${req.file.filename}`)
    ensureDirectoryExistence(output);
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({
        quality: 90,
      })
      .toFile(output);

    next();
  }
});
// ========= csv image =====

const csvResizeMiddleware = expressAsyncHandler(async (req, res, next) => {
  // Check if a file has been uploaded
  if (!req.file) {
    next();
  } else if (req.file.mimetype === 'text/csv') {
    // Generate a filename for the CSV file
    req.file.filename = `test-${Date.now()}-${req.file.originalname}`;
    
    // Specify the directory path
    const directoryPath = 'public/images/csv';
    const filePath = path.join(directoryPath, req.file.filename);

    // Create the directory if it doesn't exist
    fs.mkdir(directoryPath, { recursive: true }, (err) => {
      if (err) {
        // Handle the error (e.g., log it, return an error response, etc.)
        console.error('Error creating directory:', err);
        next(err);
      } else {
        // Save the CSV file to the specified directory
        fs.writeFile(filePath, req.file.buffer, (err) => {
          if (err) {
            // Handle the error (e.g., log it, return an error response, etc.)
            console.error('Error saving CSV file:', err);
            next(err);
          } else {
            // Continue to the next middleware
            next();
          }
        });
      }
    });
  } else {
    // For non-CSV files, resize the image and save it
    req.file.filename = `test-${Date.now()}-${req.file.originalname}`;
    const output = path.join('public/images/csv', req.file.filename)
    ensureDirectoryExistence(output);
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFile(output);

    next();
  }
});




export {
  profilePhotoUploadMiddleware,
  resizeImageMiddleware,
  postImgResizeMiddleware,
  reportResizeMiddleware,
  csvResizeMiddleware,
  testPhotoUploadMiddleware
};
