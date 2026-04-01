import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import propertyType from "./model/propertytype.js";

async function seed() {
    try {
        await mongoose.connect(process.env.URI);
        console.log("Connected to DB");

        const types = [
            { name: "Rent", description: "Property available for rent" },
            { name: "Buy", description: "Property available for purchase" },
            { name: "Lease", description: "Property available for lease" }
        ];

        for (const t of types) {
            const exists = await propertyType.findOne({ name: t.name });
            if (!exists) {
                await propertyType.create(t);
                console.log(`Added: ${t.name}`);
            } else {
                console.log(`Already exists: ${t.name}`);
            }
        }

        await mongoose.disconnect();
        console.log("Disconnected from DB");
    } catch (err) {
        console.error(err);
    }
}

seed();