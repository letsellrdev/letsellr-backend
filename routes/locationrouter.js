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

import { adminmiddle } from '../middleware/adminmiddleware.js';

const locationrouter = express.Router();

// Public routes (no authentication required)
locationrouter.get("/google/nearby", getGoogleNearby);
locationrouter.get("/google/autocomplete", getGoogleAutocomplete);
locationrouter.get("/important", getImportantLocations);
locationrouter.get("/nearby", getNearbyLocations);
locationrouter.get("/:id", getLocationById);
locationrouter.get("/", getAllLocations); 

// Admin or logic-driven integration
locationrouter.post("/integrate", integratePlace);


// Admin routes (authentication required)
locationrouter.use('/', adminmiddle);
locationrouter.post("/", addLocation); // Replaces /addlocation
locationrouter.put("/:id", updateLocation); // Replaces /updatelocation/:id
locationrouter.delete("/:id", deleteLocation); // Replaces /deletelocation/:id

export default locationrouter;
