import express from 'express'
import { addCategory, updateCategory, deletecategory, getCategoryById, getAllCategories } from '../controller/categorycontroller.js'
import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js'
import generateUploadURL from '../middlewares/s3upload.js'

const categoryrouter = express.Router()
categoryrouter.post("/upload-url", generateUploadURL); // Replaces /s3url
categoryrouter.get("/", getAllCategories); // Replaces /fullcategory
categoryrouter.get("/:id", getCategoryById); // Replaces /getcategory/:id

categoryrouter.post("/", adminmiddle, adminOnly, addCategory); // Replaces /addcategory
categoryrouter.put("/:id", adminmiddle, adminOnly, updateCategory); // Replaces /updatecategory/:id
categoryrouter.delete("/:id", adminmiddle, adminOnly, deletecategory); // Replaces /deletecategory/:id



export default categoryrouter