import mongoose from "mongoose";

const model = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
    unique: true
  },
  isTrending: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SeoKeyword = mongoose.model("seokeyword", model, "seokeyword");

export default SeoKeyword;
