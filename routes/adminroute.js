import express from "express";
import { adminlogin, adminLogout, registerAdmin } from '../controller/admincontroller.js'
import { adminmiddle, superAdminOnly } from "../middleware/adminmiddleware.js";

const router = express.Router();

router.post('/login', adminlogin);
router.delete('/logout', adminLogout);
router.post('/register', adminmiddle, superAdminOnly, registerAdmin);

export default router;
