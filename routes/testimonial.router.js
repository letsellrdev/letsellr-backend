import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js';
import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controller/testimonial.controller.js';

const router = express.Router();

router.use(adminmiddle, adminOnly);

router.get("/", getTestimonials);
router.post("/", createTestimonial);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
