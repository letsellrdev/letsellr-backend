import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js';
import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controller/testimonial.controller.js';

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", adminmiddle, adminOnly, createTestimonial);
router.put("/:id", adminmiddle, adminOnly, updateTestimonial);
router.delete("/:id", adminmiddle, adminOnly, deleteTestimonial);

export default router;
