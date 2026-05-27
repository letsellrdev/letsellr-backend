import category from "../model/category.js";
import property from "../model/propertyschema.js";
import location from "../model/location.js";

const extractCoords = (url) => {
  if (!url) return null;
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)|ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = url.match(regex);
  if (match) {
    const lat = match[1] || match[3] || match[5];
    const lng = match[2] || match[4] || match[6];
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return null;
};

const getDistanceKM = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const addCategory = async (req, res) => {
  try {
    console.log(req.body);
    const createcategory = await category.create(req.body);
    console.log(createcategory);
    return res.status(200).json({
      mesaage: "category added successfully",
      category: createcategory,
    });
  } catch (err) {
    return res.status(500).json({ message: "category cant add" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryid = req.params.id;
    console.log(categoryid);
    const editcategory = await category.findByIdAndUpdate(
      categoryid,
      {
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
      },
      { new: true }
    );
    console.log(editcategory);
    return res.status(200).json({
      message: "category updated successfully",
      category: editcategory,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "category cant update" });
  }
};

export const deletecategory = async (req, res) => {
  try {
    const categoryid = req.params.id;
    console.log(categoryid);

    const propertyfind = await property.find({ category: categoryid });
    console.log(propertyfind);
    console.log(propertyfind.length);

    if (propertyfind.length === 0) {
      const categorydelete = await category.findByIdAndDelete(categoryid);

      // Delete category image from S3 if it exists
      if (categorydelete && categorydelete.image) {
        const key = categorydelete.image.split(".amazonaws.com/")[1];
        if (key) {
          await s3
            .deleteObject({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: key,
            })
            .promise();
        }
      }

      return res.status(200).json({
        message: "category deleted successfully",
        category: categorydelete,
      });
    }
    return res.status(400).json({
      message: "Cannot delete category with associated properties",
      success: false,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "category cant delete check your details" });
  }
};
// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching category with ID:", id);

    const cat = await category.findById(id);
    if (!cat) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category: cat });
  } catch (err) {
    console.error("Error in getCategoryById:", err);
    return res
      .status(500)
      .json({ message: "Error fetching category", error: err.message });
  }
};

import mongoose from "mongoose";

export const getAllCategories = async (req, res) => {
  try {
    const { locationId } = req.query;

    const pipeline = [];

    if (locationId && mongoose.Types.ObjectId.isValid(locationId)) {
      let locationIdsArray = [new mongoose.Types.ObjectId(locationId)];
      const targetLocation = await location.findById(locationId);
      
      if (targetLocation) {
        let tLat = targetLocation.latitude;
        let tLng = targetLocation.longitude;
        if (!tLat || !tLng) {
          if (targetLocation.googleMapUrl) {
            const coords = extractCoords(targetLocation.googleMapUrl);
            if (coords) {
              tLat = coords.lat;
              tLng = coords.lng;
            }
          }
        }

        if (tLat && tLng) {
          const allLocations = await location.find({
            $or: [
              { latitude: { $ne: null }, longitude: { $ne: null } },
              { googleMapUrl: { $ne: null, $ne: "" } }
            ]
          });
          const nearbyIds = allLocations.filter(loc => {
            let locLat = loc.latitude;
            let locLng = loc.longitude;
            if (!locLat || !locLng) {
              if (loc.googleMapUrl) {
                const coords = extractCoords(loc.googleMapUrl);
                if (coords) {
                  locLat = coords.lat;
                  locLng = coords.lng;
                }
              }
            }
            if (!locLat || !locLng) return false;
            
            const dist = getDistanceKM(tLat, tLng, locLat, locLng);
            return dist <= 15;
          }).map(loc => loc._id);
          
          locationIdsArray = [new mongoose.Types.ObjectId(locationId), ...nearbyIds];
        }
      }

      pipeline.push(
        {
          $lookup: {
            from: "property",
            let: { categoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$category", "$$categoryId"] },
                  location: { $in: locationIdsArray },
                },
              },
            ],
            as: "properties",
          },
        },
        {
          $addFields: {
            propertyCount: { $size: "$properties" },
          },
        },
        {
          $match: {
            propertyCount: { $gt: 0 },
          },
        }
      );
    } else {
      pipeline.push(
        {
          $lookup: {
            from: "property",
            localField: "_id",
            foreignField: "category",
            as: "properties",
          },
        },
        {
          $addFields: {
            propertyCount: { $size: "$properties" },
          },
        }
      );
    }

    pipeline.push({
      $project: {
        properties: 0, // Exclude the properties array to keep the response light
      },
    });

    const allcategory = await category.aggregate(pipeline);
    return res.status(200).json({ message: "all category", data: allcategory });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "category cant fetch" });
  }
};
