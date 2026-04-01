// createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import admin from "./model/adminschema.js";

dotenv.config();

const createAdmin = async () => {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log("Usage: node createAdmin.js <name> <email> <password>");
        process.exit(1);
    }

    const [name, email, password] = args;

    try {
        await mongoose.connect(process.env.URI);
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new admin({
            name,
            email,
            password: hashedPassword,
        });

        await newAdmin.save();
        console.log(`Admin ${name} (${email}) created successfully!`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
