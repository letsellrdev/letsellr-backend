import mongoose from "mongoose";

const schema = mongoose.Schema;

const model = new schema({
  propertyCode: {
    type: String,
    unique: true,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['buy', 'rent', 'lease'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: [
    {
      type: {
        type: String, // e.g., "4 shared", "3 shared", "single room"
        required: true,
      },
      amount: {
        type: Number, // e.g., 6500
        required: true,
      },
    },
  ],
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "location",
    required: true,
  },
  images: {
    type: [String],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  amenity: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
  },
  propertyTypeCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "propertyType",
  },
  vacancies: [
    {
      type: { type: String, required: true },
      count: { type: Number, required: true, min: 0 },
    },
  ],
  vacancyCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const property = mongoose.model("property", model, "property");

export default property;
