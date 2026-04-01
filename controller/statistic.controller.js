import Statistic from "../model/statistic.schema.js";

export const getStatistics = async (req, res) => {
  try {
    const statistics = await Statistic.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: statistics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStatistic = async (req, res) => {
  try {
    const { label, value, order } = req.body;
    const newStatistic = new Statistic({ label, value, order });
    await newStatistic.save();
    res.status(201).json({ success: true, data: newStatistic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatistic = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStatistic = await Statistic.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedStatistic)
      return res
        .status(404)
        .json({ success: false, message: "Statistic not found" });
    res.status(200).json({ success: true, data: updatedStatistic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStatistic = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStatistic = await Statistic.findByIdAndDelete(id);
    if (!deletedStatistic)
      return res
        .status(404)
        .json({ success: false, message: "Statistic not found" });
    res.status(200).json({ success: true, message: "Statistic deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
