import express from "express";
import { adminlogin, adminLogout, registerAdmin } from '../controller/admincontroller.js'
import { adminmiddle, superAdminOnly } from "../middleware/adminmiddleware.js";

const router = express.Router();

router.post('/login', adminlogin);
router.delete('/logout', adminLogout);
router.post('/register', adminmiddle, superAdminOnly, registerAdmin);

// Lightweight session check — used by frontend to verify session is still alive
// before triggering a logout on any 401 response.
router.get('/check-session', adminmiddle, (req, res) => {
  res.status(200).json({ success: true, message: 'Session valid', role: req.session.role });
});

export default router;
