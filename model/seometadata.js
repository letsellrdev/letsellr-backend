import mongoose from "mongoose";

const model = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true // 'home', 'search', etc.
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keywords: {
    type: String,
    default: ""
  },
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const SeoMetadata = mongoose.model("seometadata", model, "seometadata");

export default SeoMetadata;
