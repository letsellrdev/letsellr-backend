import express from "express";
import {
  addPropertyType,
  updatePropertyType,
  deletePropertyType,
  getPropertyTypeById,
  getAllPropertyTypes,
} from "../controller/propertytypecontroller.js";
import { adminmiddle, adminOnly } from "../middleware/adminmiddleware.js";

const propertyTypeRouter = express.Router();
propertyTypeRouter.get("/:id", getPropertyTypeById); // Replaces /getpropertytype/:id
propertyTypeRouter.get("/", getAllPropertyTypes); // Replaces /fullpropertytypes

propertyTypeRouter.post("/", adminmiddle, adminOnly, addPropertyType); // Replaces /addpropertytype
propertyTypeRouter.put("/:id", adminmiddle, adminOnly, updatePropertyType); // Replaces /updatepropertytype/:id
propertyTypeRouter.delete("/:id", adminmiddle, adminOnly, deletePropertyType); // Replaces /deletepropertytype/:id

export default propertyTypeRouter;
