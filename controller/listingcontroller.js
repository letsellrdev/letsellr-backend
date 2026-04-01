import category from "../model/category.js";
import property from "../model/propertyschema.js";
import location from "../model/location.js";
import mongoose from "mongoose";

export const categorylist = async (req, res) => {
  try {
    console.log("API reached categorylist");
    // get the page number from query (default to 1 if not provided)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    // Optionally, you might want the total count to compute total pages
    const total = await category.countDocuments({});

    const categorydata = await category.find({}).skip(skip).limit(limit);

    res.status(200).json({
      message: "categories listed",
      data: categorydata,
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "categories can't be listed" });
  }
};

export const propertylist = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;
    const { sort } = req.query;

    const { query, category, propertyType, propertyTypeCategory, locationId } = req.query;
    const minPrice = req.query.minPrice !== undefined ? parseInt(req.query.minPrice, 10) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? parseInt(req.query.maxPrice, 10) : undefined;

    let sortOption = {};
    if (sort === "asc") {
      sortOption.price = 1;
    } else if (sort === "des") {
      sortOption.price = -1;
    }

    const match = {};
    if (propertyType) match.propertyType = propertyType;
    if (propertyTypeCategory && mongoose.Types.ObjectId.isValid(propertyTypeCategory)) {
      match.propertyTypeCategory = new mongoose.Types.ObjectId(propertyTypeCategory);
    }
    if (query) {
      const regex = new RegExp(query, "i");
      match.$or = [{ title: regex }, { description: regex }, { propertyCode: regex }, { amenity: regex }];
    }
    // Filter by location ID if provided
    if (locationId && mongoose.Types.ObjectId.isValid(locationId)) {
      match.location = new mongoose.Types.ObjectId(locationId);
    }

    const pipelineBase = [];
    if (Object.keys(match).length) {
      pipelineBase.push({ $match: match });
    }
    pipelineBase.push(
      {
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "location",
          localField: "location",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $unwind: {
          path: "$location",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "propertyType",
          localField: "propertyTypeCategory",
          foreignField: "_id",
          as: "propertyTypeCategory",
        },
      },
      {
        $unwind: {
          path: "$propertyTypeCategory",
          preserveNullAndEmptyArrays: true,
        },
      }
    );
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        pipelineBase.push({ $match: { "category._id": new mongoose.Types.ObjectId(category) } });
      } else {
        pipelineBase.push({ $match: { "category.name": new RegExp(category, "i") } });
      }
    }

    // Price range filtering against price array's amount field
    if (minPrice !== undefined || maxPrice !== undefined) {
      const amountCond = {};
      if (typeof minPrice === "number" && !Number.isNaN(minPrice)) amountCond.$gte = minPrice;
      if (typeof maxPrice === "number" && !Number.isNaN(maxPrice)) amountCond.$lte = maxPrice;
      if (Object.keys(amountCond).length) {
        pipelineBase.push({ $match: { price: { $elemMatch: { amount: amountCond } } } });
      }
    }

    const finalSort = { vacancyCount: -1 };
    if (Object.keys(sortOption).length) {
      Object.assign(finalSort, sortOption);
    }
    finalSort.createdAt = -1; // Sort by creation date (newest first)

    const dataPipeline = [
      ...pipelineBase,
      { $sort: finalSort },
      { $skip: skip },
      ...(limit ? [{ $limit: limit }] : []),
    ];

    const data = await property.aggregate(dataPipeline);
    const countAgg = await property.aggregate([...pipelineBase, { $count: "count" }]);
    const count = countAgg.length ? countAgg[0].count : 0;

    return res.status(200).json({
      message: "all property listed",
      properties: data,
      data,
      totalpages: Math.ceil(count / limit),
      count: Math.ceil(count / limit),
      currentpage: page,
      totalproperty: count,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message, success: false });
  }
};
