import express from "express";
import Property from "../model/propertyschema.js";
import Location from "../model/location.js";
import Category from "../model/category.js";

const router = express.Router();

const BASE_URL = process.env.FRONTEND_URL || "https://letsellr.in";

router.get("/sitemap.xml", async (req, res) => {
  console.log("Generating sitemap...");
  try {
    const urls = [];

    // 1. Static Pages
    urls.push({ loc: `${BASE_URL}/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 });
    urls.push({ loc: `${BASE_URL}/search`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.8 });

    // 2. Dynamic Property Pages
    const properties = await Property.find({}, "_id updatedAt");
    properties.forEach((prop) => {
      urls.push({
        loc: `${BASE_URL}/property/${prop._id}`,
        lastmod: prop.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.7,
      });
    });

    // 3. Dynamic Search/Category/Location combinations (High value SEO pages)
    const locations = await Location.find({}, "_id updatedAt title");
    locations.forEach((loc) => {
      urls.push({
        loc: `${BASE_URL}/search?locationId=${loc._id}`,
        lastmod: loc.updatedAt ? loc.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.6,
      });
    });

    const categories = await Category.find({}, "_id updatedAt name");
    categories.forEach((cat) => {
      urls.push({
        loc: `${BASE_URL}/search?category=${cat._id}`,
        lastmod: cat.updatedAt ? cat.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.6,
      });
    });

    // Construct XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
