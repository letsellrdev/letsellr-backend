import express from 'express';
import {
  getAllKeywords,
  updateKeyword,
  deleteKeyword,
  getMetadataByPage,
  updateMetadata
} from '../controller/seocontroller.js';
import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js';

const seoRouter = express.Router();

// Public routes
seoRouter.get("/keywords", getAllKeywords);
seoRouter.get("/metadata/:page", getMetadataByPage);

// Protected admin routes
seoRouter.post("/keywords", adminmiddle, adminOnly, updateKeyword);
seoRouter.delete("/keywords/:query", adminmiddle, adminOnly, deleteKeyword);
seoRouter.post("/metadata", adminmiddle, adminOnly, updateMetadata);

export default seoRouter;
