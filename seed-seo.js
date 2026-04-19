import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import SeoKeyword from "./model/seokeyword.js";
import SeoMetadata from "./model/seometadata.js";

async function seedSeo() {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connected to DB for SEO seeding");

    // 1. Seed Keywords
    const keywords = [
      { text: "Calicut rental homes", query: "calicut rental homes" },
      { text: "Kozhikode rent flat", query: "kozhikode rent flat" },
      { text: "Nadakkavu rent house", query: "nadakkavu rent house" },
      { text: "Beach Road Calicut apartments", query: "beach road calicut apartments" },
      { text: "Mavoor Road rent room", query: "mavoor road rent room" },
      { text: "Student room near Calicut University", query: "student room near calicut university" },
      { text: "Bachelors room Calicut", query: "bachelors room calicut" },
    ];

    for (const kw of keywords) {
      await SeoKeyword.findOneAndUpdate(
        { query: kw.query },
        kw,
        { upsert: true, new: true }
      );
    }
    console.log("Seeded SEO Keywords");

    // 2. Seed Metadata for Home Page
    const homeMetadata = {
      page: "home",
      title: "Rental Homes, Flats & Rooms in Calicut/Kozhikode | Letsellr",
      description: "Best rental homes in Calicut (Kozhikode). Find flats, houses, rooms, and apartments for rent. Verified listings for students, families, and bachelors.",
      keywords: "calicut rental homes, kozhikode rent flat, nadakkavu rent house, beach road calicut apartments, mavoor road rent room, student room near calicut university, bachelors room calicut",
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Letsellr Calicut",
          "description": "Premium rental listings for PGs, hostels, and apartments in Calicut (Kozhikode). Verified properties for students and professionals.",
          "url": "https://letsellr.in",
          "logo": "https://letsellr.in/favicon.ico",
          "areaServed": "Calicut, Kozhikode, Kerala",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Calicut",
            "addressRegion": "Kerala",
            "addressCountry": "IN"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://letsellr.in",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://letsellr.in/search?query={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }
      ]
    };

    await SeoMetadata.findOneAndUpdate(
      { page: "home" },
      homeMetadata,
      { upsert: true, new: true }
    );
    console.log("Seeded Home Metadata");

    // 3. Seed Metadata for Search Page
    const searchMetadata = {
      page: "search",
      title: "Search Properties in Calicut & Kozhikode | Letsellr",
      description: "Search for the best rental homes, flats, and rooms in Calicut. Use filters to find your perfect accommodation. Verified listings only.",
      keywords: "search rentals calicut, kozhikode property search, find rooms calicut"
    };

    await SeoMetadata.findOneAndUpdate(
      { page: "search" },
      searchMetadata,
      { upsert: true, new: true }
    );
    console.log("Seeded Search Metadata");

    await mongoose.disconnect();
    console.log("Disconnected from DB");
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

seedSeo();
