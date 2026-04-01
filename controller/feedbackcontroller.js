import mongoose from "mongoose";
import feedback from "../model/feedback.js";
import property from "../model/propertyschema.js";

export const addfeedback = async (req, res) => {
  try {
    const { email, propertyId, rating, comment, userName } = req.body.data;
    const feedbackadd = await feedback.insertOne({ email, propertyId, rating, comment, userName });

    const feedBacks = await feedback.aggregate([
      {
        $match: { propertyId: new mongoose.Types.ObjectId(propertyId) },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    await property.updateOne({ _id: new mongoose.Types.ObjectId(propertyId) }, { $set: { rating: Number(feedBacks?.[0]?.avgRating || 0)?.toFixed(1) } });

    res.json({ feedback: feedbackadd, message: "feedback added successfully" });
  } catch (err) {
    console.log(err);
    res.json({ message: "user cant add feedback" });
  }
};

export const getfeedback = async (req, res) => {
  try {
    const propertyId = req.params.id;
    // console.log(propertyId);
    const feedbacks = await feedback.find({ propertyId: propertyId });
    // console.log(feedbacks);
    res.status(200).json({ message: "feedback fetched successfully", data: feedbacks, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error occured while fetching feedback" });
  }
};

export const getallfeedback = async (req, res) => {
  try {
    const feedbacks = await feedback.find({}).populate("propertyId", "title");
    const feedbackCount = feedbacks.length;

    const formatted = feedbacks.map((fb) => {
      const property = fb.propertyId;
      console.log(property);
      return {
        ...fb.toObject(),
        propertyName: property ? property.title : "Property not found",
        propertyId: fb.propertyId._id,
        date: fb.createdAt.toLocaleDateString(),
      };
    });
    res.status(200).json({ message: "all feedback fetched successfully", data: formatted, success: true, count: feedbackCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error occured while fetching all feedback" });
  }
};

export const deletefeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    await feedback.deleteOne({ _id: feedbackId });
    res.status(200).json({ message: "feedback deleted successfully", success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error occured while deleting feedback" });
  }
};