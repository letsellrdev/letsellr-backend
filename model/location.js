import mongoose from "mongoose";

const model = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ""
  },
  googleMapUrl: {
    type: String,
    required: false
  },
  importantLocation: {
    type: Boolean,
    default: false
  },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  googlePlaceId: { type: String, default: null },
  metaTitle: { type: String },
  metaDescription: { type: String }

}, {
  timestamps: true
});

const location = mongoose.model('location', model, 'location');

export default location;
