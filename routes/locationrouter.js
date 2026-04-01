import express from 'express';
import {
  addLocation,
  updateLocation,
  deleteLocation,
  getLocationById,
  getAllLocations,
  getNearbyLocations,
  getImportantLocations
} from '../controller/locationcontroller.js';
import { adminmiddle } from '../middleware/adminmiddleware.js';

const locationrouter = express.Router();

// Public routes (no authentication required)
locationrouter.get("/important", getImportantLocations);
locationrouter.get("/nearby", getNearbyLocations);
locationrouter.get("/:id", getLocationById);
locationrouter.get("/", getAllLocations); // Replaces /fulllocations

// Admin routes (authentication required)
locationrouter.use('/', adminmiddle);
locationrouter.post("/", addLocation); // Replaces /addlocation
locationrouter.put("/:id", updateLocation); // Replaces /updatelocation/:id
locationrouter.delete("/:id", deleteLocation); // Replaces /deletelocation/:id

export default locationrouter;
