import admin from "../model/adminschema.js";
import bcrypt from "bcryptjs";
import Joi from "joi";

const adminlogin = async (req, res) => {
  console.log("reached admin route");
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const { email, password } = req.body;
    console.log(req.body);

    const admindata = await admin.findOne({ email });

    if (!admindata) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admindata.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    req.session.adminId = admindata._id;
    req.session.role = admindata.role; // Store role in session
    console.log(req.session.adminId, req.session.role);


    return res.status(200).json({ 
      message: "Login successful", 
      success: true,
      role: admindata.role // Return role to frontend
    });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("letsellr_admin_sid");
      return res.status(200).json({ message: "Logout successful", success: true });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
      role: Joi.string().valid('superadmin', 'admin', 'manager').default('manager')
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role } = req.body;

    const existingAdmin = await admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new admin({
      name,
      email,
      password: hashedPassword,
      role: role || 'manager'
    });

    await newAdmin.save();

    return res.status(201).json({
      message: "Admin registered successfully",
      success: true
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export { adminlogin, adminLogout, registerAdmin };
