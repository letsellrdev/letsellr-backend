import express from 'express';
import {
  getSetting,
  getAllSettings,
  updateSetting,
  deleteSetting
} from '../controller/settingscontroller.js';
import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js';

const settingsRouter = express.Router();

// Public route to get settings (for floating contact icons, etc.)
settingsRouter.get("/:key", getSetting); // Replaces /get/:key
settingsRouter.get("/", getAllSettings); // Replaces /all

// Protected admin routes
settingsRouter.post("/", adminmiddle, adminOnly, updateSetting); // Replaces /update
settingsRouter.delete("/:key", adminmiddle, adminOnly, deleteSetting); // Replaces /delete/:key

export default settingsRouter;
