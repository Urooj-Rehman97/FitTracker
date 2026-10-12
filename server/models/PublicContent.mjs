import mongoose from "mongoose";

const publicContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: ["home", "about", "features", "contact"],
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PublicContent = mongoose.model(
  "PublicContent",
  publicContentSchema
);

export default PublicContent;