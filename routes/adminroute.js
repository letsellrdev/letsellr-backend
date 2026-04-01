import express from "express";
import { adminlogin, adminLogout } from '../controller/admincontroller.js'

const router = express.Router();

router.post('/login', adminlogin);
router.delete('/logout', adminLogout)

export default router;
