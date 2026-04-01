import Testimonial from "../model/testimonial.schema.js";

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { name, role, content, rating, initials } = req.body;
    const newTestimonial = new Testimonial({
      name,
      role,
      content,
      rating,
      initials,
    });
    await newTestimonial.save();
    res.status(201).json({ success: true, data: newTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedTestimonial)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    res.status(200).json({ success: true, data: updatedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
    if (!deletedTestimonial)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
