import mongoose from "mongoose";

const schema = mongoose.Schema;

const statisticSchema = new schema(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: false,
      // Store the name of the icon, e.g., "Users", "Home"
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Statistic = mongoose.model("Statistic", statisticSchema);

export default Statistic;
