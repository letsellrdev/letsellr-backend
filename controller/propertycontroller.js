import category from "../model/category.js";
import property from "../model/propertyschema.js";
import location from "../model/location.js";
import AWS from "aws-sdk";
import mongoose from "mongoose";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// ============ GENERATE UNIQUE PROPERTY CODE ============
const generateUniquePropertyCode = async () => {
  let code;
  let isUnique = false;

  // Generate a random 4-5 digit code and check uniqueness
  while (!isUnique) {
    // Generate random 4 or 5 digit number
    const length = Math.random() > 0.5 ? 5 : 4;
    const min = length === 4 ? 1000 : 10000;
    const max = length === 4 ? 9999 : 99999;
    code = Math.floor(Math.random() * (max - min + 1)) + min;
    code = code.toString();

    // Check if code already exists
    const existing = await property.findOne({ propertyCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// ============ ADD PROPERTY ============
export const addproperty = async (req, res) => {
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

    // Generate unique property code
    // const propertyCode = await generateUniquePropertyCode();

    const createproperty = await property.create({
      propertyCode,
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

    res.json({
      message: "Property added successfully",
      property: createproperty,
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

    // Delete a specific image (DB + S3)
    if (removeImage) {
      prop.images = prop.images.filter((img) => img !== removeImage);

      // Extract S3 key from full URL
      const key = removeImage.split(".amazonaws.com/")[1];
      if (key) {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
          })
          .promise();
      }
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

    // Delete all property images from S3
    if (propertydelete.images && propertydelete.images.length > 0) {
      const objects = propertydelete.images.map((img) => ({
        Key: img.split(".amazonaws.com/")[1],
      }));

      await s3
        .deleteObjects({
          Bucket: process.env.AWS_S3_BUCKET,
          Delete: { Objects: objects },
        })
        .promise();
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
    const showproperty = await property
      .findById(propertyid)
      .populate("category", "name description image")
      .populate("location", "title googleMapUrl importantLocation")
      .populate("propertyTypeCategory", "name description");

    if (!showproperty) return res.status(404).json({ message: "Property not found", success: false });
    return res.json({ message: "Property found", property: showproperty });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Property can't be found",
      error: err.message,
      success: false,
    });
  }
};

// ============ SEARCH PROPERTIES ============