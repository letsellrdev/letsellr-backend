import location from "../model/location.js";
import property from "../model/propertyschema.js";
import mongoose from "mongoose";

const extractCoords = (url) => {
  if (!url) return null;
  // Patterns to match: @lat,lng  or q=lat,lng or ll=lat,lng
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)|ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = url.match(regex);
  if (match) {
    // Collect the first pair found
    const lat = match[1] || match[3] || match[5];
    const lng = match[2] || match[4] || match[6];
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return null;
};

// Haversine formula to calculate distance in KM
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const addLocation = async (req, res) => {
  try {
    console.log(req.body);
    const body = { ...req.body };
    if (body.googleMapUrl && (!body.latitude || !body.longitude)) {
      const coords = extractCoords(body.googleMapUrl);
      if (coords) {
        body.latitude = coords.lat;
        body.longitude = coords.lng;
      }
    }
    const createLocation = await location.create(body);
    console.log(createLocation);
    return res.status(200).json({
      message: "Location added successfully",
      location: createLocation,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Location with this title already exists" });
    }
    return res.status(500).json({ message: "Location cannot be added" });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    console.log(locationId);

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      googleMapUrl: req.body.googleMapUrl,
      importantLocation: req.body.importantLocation,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };

    if (req.body.googleMapUrl && (!req.body.latitude || !req.body.longitude)) {
      const coords = extractCoords(req.body.googleMapUrl);
      if (coords) {
        updateData.latitude = coords.lat;
        updateData.longitude = coords.lng;
      }
    }

    const editLocation = await location.findByIdAndUpdate(
      locationId,
      updateData,
      { new: true }
    );
    console.log(editLocation);
    return res.status(200).json({
      message: "Location updated successfully",
      location: editLocation,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Location with this title already exists" });
    }
    return res.status(500).json({ message: "Location cannot be updated" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    console.log(locationId);

    const propertyFind = await property.find({ location: locationId });
    console.log(propertyFind);
    console.log(propertyFind.length);

    if (propertyFind.length === 0) {
      const locationDelete = await location.findByIdAndDelete(locationId);
      return res.status(200).json({
        message: "Location deleted successfully",
        location: locationDelete,
      });
    }
    return res.status(400).json({
      message: "Cannot delete location with associated properties",
      success: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Location cannot be deleted, check your details" });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching location with ID or title:", id);

    let loc;
    if (mongoose.Types.ObjectId.isValid(id)) {
      loc = await location.findById(id);
    } else {
      // If not a valid ObjectId, search by title (slug-like)
      // Try exact match first
      loc = await location.findOne({ title: { $regex: new RegExp(`^${id}$`, "i") } });
      
      // If no exact match, try partial match in title
      if (!loc) {
        loc = await location.findOne({ title: { $regex: new RegExp(id, "i") } });
      }
    }

    if (!loc) {
      return res.status(404).json({ message: "Location not found" });
    }

    return res.status(200).json({ location: loc });
  } catch (err) {
    console.error("Error in getLocationById:", err);
    return res.status(500).json({
      message: "Error fetching location",
      error: err.message,
    });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const onlyImportantLocations = req.query.onlyImportantLocations === "true";
    
    // Get unique location IDs that have associated properties
    const activeLocationIds = await property.distinct("location");
    
    const baseFilter = {
      _id: { $in: activeLocationIds }
    };

    if (onlyImportantLocations) {
      baseFilter.importantLocation = true;
    }

    const allLocations = await location.find(baseFilter).sort({ title: 1 });
    return res.status(200).json({
      message: "All locations",
      data: allLocations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Locations cannot be fetched" });
  }
};

export const getImportantLocations = async (req, res) => {
  try {
    const importantLocations = await location.find({ importantLocation: true }).sort({ title: 1 });
    return res.status(200).json({
      message: "Important locations",
      data: importantLocations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Important locations cannot be fetched" });
  }
};

export const getNearbyLocations = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const allLocations = await location.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });

    const nearby = allLocations
      .map((loc) => {
        const distance = getDistance(
          userLat,
          userLng,
          loc.latitude,
          loc.longitude
        );
        return {
          ...loc.toObject(),
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Return top 10 closest

    return res.status(200).json({
      message: "Nearby locations fetched",
      data: nearby,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching nearby locations" });
  }
};

// ─── Google Places Integration ──────────────────────────────────────────────

export const getGoogleNearby = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.PLACES_API_KEY;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    // Nearby Search to find localities/sublocalities
    // Using rankby=distance requires removing radius
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=locality|sublocality|neighborhood&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(data.error_message || "Google API error");
    }

    return res.status(200).json({
      success: true,
      data: data.results || []
    });
  } catch (err) {
    console.error("Google Nearby Error Details:", err.message || err);
    return res.status(500).json({ 
      message: "Failed to fetch from Google",
      error: err.message || "Unknown error"
    });
  }
};


export const getGoogleAutocomplete = async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.PLACES_API_KEY;

    if (!query) return res.status(200).json({ data: [] });

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(regions)&components=country:in&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json({
      success: true,
      data: data.predictions || []
    });
  } catch (err) {
    console.error("Google Autocomplete Error:", err);
    return res.status(500).json({ message: "Failed to fetch from Google" });
  }
};

export const integratePlace = async (req, res) => {
  try {
    const { placeId, title } = req.body;
    const apiKey = process.env.PLACES_API_KEY;

    if (!placeId) return res.status(400).json({ message: "Place ID is required" });

    // Check if location already exists by title (fuzzy match or exact)
    let existing = await location.findOne({ 
      $or: [
        { title: { $regex: new RegExp(`^${title}$`, "i") } },
        { googlePlaceId: placeId }
      ]
    });

    if (existing) {
      return res.status(200).json({
        message: "Location already integrated",
        data: existing
      });
    }

    // Fetch details to get lat/lng
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address&key=${apiKey}`;
    const response = await fetch(detailsUrl);
    const details = await response.json();

    if (details.status !== "OK") {
      throw new Error(details.error_message || "Failed to fetch place details");
    }

    const { location: coords } = details.result.geometry;

    const newLocation = await location.create({
      title: title || details.result.name,
      description: details.result.formatted_address,
      latitude: coords.lat,
      longitude: coords.lng,
      googlePlaceId: placeId,
      importantLocation: false
    });

    return res.status(201).json({
      message: "Location integrated successfully",
      data: newLocation
    });
  } catch (err) {
    console.error("Integration Error:", err);
    return res.status(500).json({ message: "Failed to integrate location" });
  }
};

