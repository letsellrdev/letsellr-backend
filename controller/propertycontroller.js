import category from "../model/category.js";
import property from "../model/propertyschema.js";
import location from "../model/location.js";
import ImageKit from "@imagekit/nodejs";
import mongoose from "mongoose";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

/**
 * Extract the ImageKit file path from a full URL.
 * e.g. https://ik.imagekit.io/assets01/uploads/1234-photo.jpg  →  /uploads/1234-photo.jpg
 */
const getImageKitFilePath = (url) => {
  try {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT; // https://ik.imagekit.io/assets01
    if (endpoint && url.startsWith(endpoint)) {
      return url.slice(endpoint.length); // /uploads/...
    }
    // Fallback: strip protocol + host
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

/**
 * Delete a single file from ImageKit by its full URL.
 * Uses the Files Search API to resolve the fileId then deletes it.
 */
const deleteImageKitFile = async (fileUrl) => {
  try {
    const filePath = getImageKitFilePath(fileUrl);
    // Search for the file by path
    const searchResult = await imagekit.files.list({ searchQuery: `filePath = "${filePath}"` });
    if (searchResult && searchResult.length > 0) {
      const fileId = searchResult[0].fileId;
      await imagekit.files.delete(fileId);
      console.log(`Deleted ImageKit file: ${filePath} (id: ${fileId})`);
    } else {
      console.warn(`ImageKit file not found for path: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to delete ImageKit file (${fileUrl}):`, err.message);
  }
};

/**
 * Delete multiple files from ImageKit by their full URLs.
 */
const deleteImageKitFiles = async (fileUrls) => {
  await Promise.allSettled(fileUrls.map(deleteImageKitFile));
};

// ============ GENERATE UNIQUE PROPERTY CODE ============
// ============ GENERATE UNIQUE PROPERTY CODE ============
const generateUniquePropertyCode = async () => {
  const start = Date.now();
  let code;
  let isUnique = false;
  let attempts = 0;

  // Generate a random 4-5 digit code and check uniqueness
  while (!isUnique && attempts < 10) {
    attempts++;
    // Generate random 4 or 5 digit number
    const length = Math.random() > 0.5 ? 5 : 4;
    const min = length === 4 ? 1000 : 10000;
    const max = length === 4 ? 9999 : 99999;
    code = Math.floor(Math.random() * (max - min + 1)) + min;
    code = code.toString();

    // Check if code already exists
    const existing = await property.findOne({ propertyCode: code }).select('_id').lean();
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    // Fallback if random attempts fail (extremely unlikely)
    code = Date.now().toString().slice(-6);
  }

  console.log(`[Performance] generateUniquePropertyCode took ${Date.now() - start}ms (attempts: ${attempts})`);
  return code;
};

// ============ ADD PROPERTY ============
export const addproperty = async (req, res) => {
  const startTime = Date.now();
  console.log("[Performance] Starting addproperty request");

  try {
    const {
      title,
      description,
      location,
      category,
      amenity,
      images,
      price,
      contactNumber,
      propertyType,
      propertyTypeCategory,
      propertyCode,
      vacancyCount,
      vacancies,
    } = req.body;

    if (!["buy", "rent", "lease"].includes(propertyType)) {
      return res.status(400).json({ message: "Invalid property type. Must be 'buy', 'rent', or 'lease'" });
    }

    // Sanitize ObjectId fields — empty strings cause Mongoose BSONError
    const sanitizedCategory = category && category !== "" ? category : undefined;
    const sanitizedLocation = location && location !== "" ? location : undefined;
    const sanitizedPropertyTypeCategory = propertyTypeCategory && propertyTypeCategory !== "" ? propertyTypeCategory : undefined;

    // Generate unique property code if not provided
    console.log("[Performance] Checking property code need");
    const codeStart = Date.now();
    let finalPropertyCode;
    if (propertyCode && propertyCode.trim() !== "") {
      finalPropertyCode = propertyCode;
      // If manual code provided, verify uniqueness to prevent DB crash later
      const existing = await property.findOne({ propertyCode: finalPropertyCode }).select('_id').lean();
      if (existing) {
        return res.status(400).json({ message: "Provided property code already exists" });
      }
    } else {
      finalPropertyCode = await generateUniquePropertyCode();
    }
    console.log(`[Performance] Property code resolution took ${Date.now() - codeStart}ms`);
    
    // Validate length if provided manually
    if (propertyCode && (propertyCode.length < 4 || propertyCode.length > 6)) {
       // Optional: could add validation here, but sticking to fixing the bug first
    }

    console.log("[Performance] Creating property in DB");
    const dbStart = Date.now();
    const createproperty = await property.create({
      propertyCode: finalPropertyCode,
      title,
      description,
      location: sanitizedLocation,
      category: sanitizedCategory,
      amenity,
      images, // Array of S3 URLs
      price: price || [], // save price array
      contactNumber,
      propertyType,
      propertyTypeCategory: sanitizedPropertyTypeCategory,
      vacancies: vacancies || [],
      vacancyCount: vacancies ? vacancies.reduce((sum, v) => sum + (parseInt(v.count) || 0), 0) : (vacancyCount !== undefined ? vacancyCount : 0),
    });
    console.log(`[Performance] DB property.create took ${Date.now() - dbStart}ms`);

    const totalTime = Date.now() - startTime;
    console.log(`[Performance] Total addproperty execution time: ${totalTime}ms`);

    res.json({
      message: "Property added successfully",
      property: createproperty,
      performance: { totalTime }
    });
  } catch (err) {
    console.error(err, 'error from add property');
    res.status(500).json({
      message: "Property can't be added. Check your details",
      error: err.message,
    });
  }
};

// ============ UPDATE PROPERTY ============
export const updateproperty = async (req, res) => {
  try {
    const propertyid = req.params.id;
    const {
      propertyCode,
      title,
      description,
      price,
      location,
      category,
      amenity,
      contactNumber,
      images,
      addImages,
      removeImage,
      propertyType,
      propertyTypeCategory,
      vacancyCount,
      vacancies,
    } = req.body;

    const prop = await property.findById(propertyid);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    // Update property code with uniqueness validation
    if (propertyCode && propertyCode !== prop.propertyCode) {
      // Validate code length
      //   if (propertyCode.length < 4 || propertyCode.length > 5) {
      //     return res.status(400).json({ message: "Property code must be 4-5 digits long" });
      //   }

      // Check if the new code is unique
      const existingProperty = await property.findOne({ propertyCode });
      if (existingProperty) {
        return res.status(400).json({ message: "Property code already exists. Please use a unique code." });
      }

      prop.propertyCode = propertyCode;
    }

    // Update basic fields
    if (title) prop.title = title;
    if (description) prop.description = description;
    if (price) prop.price = price;
    if (location) prop.location = location;
    if (category) prop.category = category;
    if (amenity) prop.amenity = amenity;
    if (contactNumber) prop.contactNumber = contactNumber;
    if (propertyType) {
      if (!["buy", "rent", "lease"].includes(propertyType)) {
        return res.status(400).json({ message: "Invalid property type. Must be 'buy', 'rent', or 'lease'" });
      }
      prop.propertyType = propertyType;
    }
    if (propertyTypeCategory !== undefined) {
      prop.propertyTypeCategory = propertyTypeCategory;
    }
    if (vacancies) {
      prop.vacancies = vacancies;
      prop.vacancyCount = vacancies.reduce((sum, v) => sum + (parseInt(v.count) || 0), 0);
    } else if (vacancyCount !== undefined) {
      prop.vacancyCount = vacancyCount;
    }

    // Replace all images
    // Add new images safely
    if (addImages) {
      const newImages = Array.isArray(addImages) ? addImages : [addImages];
      prop.images.push(...newImages);
    }

    // Replace all images safely
    if (images) {
      prop.images = Array.isArray(images) ? images : [images];
    }

    // Delete a specific image (DB + ImageKit)
    if (removeImage) {
      prop.images = prop.images.filter((img) => img !== removeImage);
      // Fire-and-forget deletion from ImageKit
      deleteImageKitFile(removeImage).catch(() => {});
    }
    await prop.save();

    res.json({ message: "Property updated successfully", property: prop });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Property can't update successfully", error: err.message });
  }
};

// ============ DELETE PROPERTY ============
export const deleteproperty = async (req, res) => {
  try {
    const propertyid = req.params.id;

    const propertydelete = await property.findByIdAndDelete(propertyid);

    if (!propertydelete) return res.status(404).json({ message: "Property not found" });

    // Delete all property images from ImageKit (non-blocking)
    if (propertydelete.images && propertydelete.images.length > 0) {
      deleteImageKitFiles(propertydelete.images).catch(() => {});
    }

    res.json({ message: "Property deleted successfully", property: propertydelete });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Property can't delete", error: err.message });
  }
};

// ============ FIND ONE PROPERTY ============
export const findproperty = async (req, res) => {
  try {
    const propertyid = req.params.id;

    // Validate ObjectId to prevent BSONError (500)
    if (!mongoose.Types.ObjectId.isValid(propertyid)) {
      return res.status(400).json({
        message: "Invalid property ID format",
        success: false,
      });
    }

    const showproperty = await property
      .findById(propertyid)
      .populate("category", "name description image")
      .populate("location", "title googleMapUrl importantLocation")
      .populate("propertyTypeCategory", "name description");

    if (!showproperty) {
      return res.status(404).json({
        message: "Property not found",
        success: false,
      });
    }

    return res.json({ message: "Property found", property: showproperty });
  } catch (err) {
    console.error("Error in findproperty:", err);
    res.status(500).json({
      message: "An unexpected error occurred while fetching the property",
      error: err.message,
      success: false,
    });
  }
};

// ============ SEARCH PROPERTIES ============

// ============ GET PROPERTY COUNTS BY TYPE ============
export const getPropertyCountsByType = async (req, res) => {
  try {
    const counts = await property.aggregate([
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      rent: 0,
      buy: 0,
      lease: 0,
    };

    counts.forEach((item) => {
      if (item._id && result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error in getPropertyCountsByType:", err);
    res.status(500).json({
      success: false,
      message: "Could not fetch property counts",
      error: err.message,
    });
  }
};

// ============ GET FEATURED PROPERTIES ============
export const getFeaturedProperties = async (req, res) => {
  try {
    // Featured logic: TOP 8 highest rated properties
    const featured = await property
      .find()
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .populate("category", "name image")
      .populate("location", "title");

    res.json({ success: true, properties: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============ GET LATEST PROPERTIES ============
export const getLatestProperties = async (req, res) => {
  try {
    // Latest logic: TOP 8 most recently updated properties
    const latest = await property
      .find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name image")
      .populate("location", "title");

    res.json({ success: true, properties: latest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};