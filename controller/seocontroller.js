import SeoKeyword from "../model/seokeyword.js";
import SeoMetadata from "../model/seometadata.js";

// Keywords
export const getAllKeywords = async (req, res) => {
  try {
    const keywords = await SeoKeyword.find();
    res.json({ success: true, data: keywords });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateKeyword = async (req, res) => {
  try {
    const { text, query, isTrending } = req.body;
    const keyword = await SeoKeyword.findOneAndUpdate(
      { query },
      { text, query, isTrending },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: keyword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteKeyword = async (req, res) => {
  try {
    const { query } = req.params;
    await SeoKeyword.findOneAndDelete({ query });
    res.json({ success: true, message: "Keyword deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Metadata
export const getMetadataByPage = async (req, res) => {
  try {
    const { page } = req.params;
    const metadata = await SeoMetadata.findOne({ page });
    if (!metadata) {
      return res.status(404).json({ success: false, message: "Metadata not found" });
    }
    res.json({ success: true, data: metadata });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMetadata = async (req, res) => {
  try {
    const { page, title, description, keywords, structuredData } = req.body;
    const metadata = await SeoMetadata.findOneAndUpdate(
      { page },
      { page, title, description, keywords, structuredData },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: metadata });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
