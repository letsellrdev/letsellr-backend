import mongoose from "mongoose";
const model = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String, required: true },
});
const category = mongoose.model("category", model, "category");
export default category;
