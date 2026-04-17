import express from 'express';
import {
  addLocation,
  updateLocation,
  deleteLocation,
  getLocationById,
  getAllLocations,
  getNearbyLocations,
  getImportantLocations,
  getGoogleNearby,
  getGoogleAutocomplete,
  integratePlace
} from '../controller/locationcontroller.js';

import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js';

const locationrouter = express.Router();

// Public routes (no authentication required)
locationrouter.get("/google/nearby", getGoogleNearby);
locationrouter.get("/google/autocomplete", getGoogleAutocomplete);
locationrouter.get("/important", getImportantLocations);
locationrouter.get("/nearby", getNearbyLocations);
locationrouter.get("/:id", getLocationById);
locationrouter.get("/", getAllLocations); 

// Admin or logic-driven integration
locationrouter.post("/integrate", adminmiddle, adminOnly, integratePlace);


// Admin routes (authentication required)
locationrouter.post("/", adminmiddle, adminOnly, addLocation); 
locationrouter.put("/:id", adminmiddle, adminOnly, updateLocation);
locationrouter.delete("/:id", adminmiddle, adminOnly, deleteLocation);

export default locationrouter;
