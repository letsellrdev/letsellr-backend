import propertyType from "../model/propertytype.js";
import property from "../model/propertyschema.js";

export const addPropertyType = async (req, res) => {
  try {
    console.log(req.body);
    const createPropertyType = await propertyType.create(req.body);
    console.log(createPropertyType);
    return res.status(200).json({
      message: "Property type added successfully",
      data: createPropertyType
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Property type already exists" });
    }
    return res.status(500).json({ message: "Property type can't be added" });
  }
};

export const updatePropertyType = async (req, res) => {
  try {
    const propertyTypeId = req.params.id;
    console.log(propertyTypeId);
    const editPropertyType = await propertyType.findByIdAndUpdate(
      propertyTypeId,
      {
        name: req.body.name,
        description: req.body.description
      },
      { new: true }
    );
    console.log(editPropertyType);
    return res.status(200).json({
      message: "Property type updated successfully",
      data: editPropertyType
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Property type can't be updated" });
  }
};

export const deletePropertyType = async (req, res) => {
  try {
    const propertyTypeId = req.params.id;
    console.log(propertyTypeId);

    const propertyFind = await property.find({ propertyTypeCategory: propertyTypeId });
    console.log(propertyFind);
    console.log(propertyFind.length);

    if (propertyFind.length === 0) {
      const propertyTypeDelete = await propertyType.findByIdAndDelete(propertyTypeId);
      return res.status(200).json({
        message: "Property type deleted successfully",
        data: propertyTypeDelete
      });
    }
    return res.status(400).json({
      message: "Cannot delete property type with associated properties",
      success: false
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Property type can't be deleted" });
  }
};

export const getPropertyTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching property type with ID:", id);

    const propType = await propertyType.findById(id);
    if (!propType) {
      return res.status(404).json({ message: "Property type not found" });
    }

    return res.status(200).json({ data: propType });
  } catch (err) {
    console.error("Error in getPropertyTypeById:", err);
    return res.status(500).json({
      message: "Error fetching property type",
      error: err.message
    });
  }
};

export const getAllPropertyTypes = async (req, res) => {
  try {
    const allPropertyTypes = await propertyType.find();
    return res.status(200).json({
      message: "All property types",
      data: allPropertyTypes
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Property types can't be fetched" });
  }
};
