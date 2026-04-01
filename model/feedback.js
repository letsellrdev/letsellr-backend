import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "property",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

const feedback = mongoose.model('feedback', feedbackSchema, 'feedback')
export default feedback