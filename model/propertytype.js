import mongoose from "mongoose";

const model = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
});

const propertyType = mongoose.model('propertyType', model, 'propertyType');
export default propertyType;
