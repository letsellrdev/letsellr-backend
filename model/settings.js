import mongoose from "mongoose";

const model = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('settings', model, 'settings');
export default Settings;
