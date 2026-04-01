import express from 'express'
import { addCategory, updateCategory, deletecategory, getCategoryById, getAllCategories } from '../controller/categorycontroller.js'
import { adminmiddle } from '../middleware/adminmiddleware.js'
import generateUploadURL from '../middlewares/s3upload.js'

const categoryrouter = express.Router()
categoryrouter.get("/upload-url", generateUploadURL); // Replaces /s3url
categoryrouter.get("/", getAllCategories); // Replaces /fullcategory
categoryrouter.get("/:id", getCategoryById); // Replaces /getcategory/:id

categoryrouter.use('/', adminmiddle);

categoryrouter.post("/", addCategory); // Replaces /addcategory
categoryrouter.put("/:id", updateCategory); // Replaces /updatecategory/:id
categoryrouter.delete("/:id", deletecategory); // Replaces /deletecategory/:id



export default categoryrouter