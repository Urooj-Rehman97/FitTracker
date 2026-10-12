import mongoose from "mongoose";

const adminReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "users",
        "workouts",
        "nutrition",
        "goals",
        "progress",
        "support",
        "overview",
      ],
      default: "overview",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    format: {
      type: String,
      enum: ["json", "csv"],
      default: "json",
    },
  },
  { timestamps: true }
);

const AdminReport = mongoose.model(
  "AdminReport",
  adminReportSchema
);

export default AdminReport;