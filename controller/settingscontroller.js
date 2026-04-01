import Settings from "../model/settings.js";

// Get a setting by key
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });

    if (!setting) {
      return res.status(404).json({
        message: "Setting not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "Setting retrieved successfully",
      data: setting,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error fetching setting",
      success: false
    });
  }
};

// Get all settings
export const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    return res.status(200).json({
      message: "Settings retrieved successfully",
      data: settings,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error fetching settings",
      success: false
    });
  }
};

// Update or create a setting
export const updateSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key || !value) {
      return res.status(400).json({
        message: "Key and value are required",
        success: false
      });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value, description },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Setting updated successfully",
      data: setting,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error updating setting",
      success: false
    });
  }
};

// Delete a setting
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await Settings.findOneAndDelete({ key });

    if (!setting) {
      return res.status(404).json({
        message: "Setting not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "Setting deleted successfully",
      data: setting,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error deleting setting",
      success: false
    });
  }
};
