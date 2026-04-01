
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  allowed: {
    type: Boolean,
    
  }
});

const user = mongoose.model("user", userSchema);
export default user;
