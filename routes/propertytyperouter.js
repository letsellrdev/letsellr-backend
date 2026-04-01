import express from "express";
import {
  addPropertyType,
  updatePropertyType,
  deletePropertyType,
  getPropertyTypeById,
  getAllPropertyTypes,
} from "../controller/propertytypecontroller.js";
import { adminmiddle } from "../middleware/adminmiddleware.js";

const propertyTypeRouter = express.Router();
propertyTypeRouter.get("/:id", getPropertyTypeById); // Replaces /getpropertytype/:id
propertyTypeRouter.get("/", getAllPropertyTypes); // Replaces /fullpropertytypes

propertyTypeRouter.use("/", adminmiddle);

propertyTypeRouter.post("/", addPropertyType); // Replaces /addpropertytype
propertyTypeRouter.put("/:id", updatePropertyType); // Replaces /updatepropertytype/:id
propertyTypeRouter.delete("/:id", deletePropertyType); // Replaces /deletepropertytype/:id

export default propertyTypeRouter;
