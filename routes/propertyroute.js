import express from 'express';
import { findproperty, addproperty, updateproperty, deleteproperty } from '../controller/propertycontroller.js';
import { propertylist } from '../controller/listingcontroller.js';
import { adminmiddle } from '../middleware/adminmiddleware.js';
import { generateLocalUploadURL, handleLocalUpload } from '../middlewares/localUpload.js';

const propertyrouter = express.Router();

// Public routes
propertyrouter.get("/", propertylist);
propertyrouter.get("/:id", findproperty);

// Upload routes (public - no auth needed for file upload)
propertyrouter.post("/upload-url", generateLocalUploadURL);
propertyrouter.put("/upload-local/:filename", handleLocalUpload);

// Protected routes (require admin auth)
propertyrouter.use("/", adminmiddle);

propertyrouter.post("/", addproperty);
propertyrouter.put("/:id", updateproperty);
propertyrouter.delete("/:id", deleteproperty);

export default propertyrouter;