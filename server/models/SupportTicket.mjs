import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: [true, "Ticket subject is required"],
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      enum: [
        "Technical",
        "Nutrition",
        "Workout",
        "Workouts",
        "Progress",
        "Goals",
        "Account",
        "Payment",
        "Other",
      ],
      default: "Technical",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },

    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
      maxlength: 2000,
    },

    adminResponse: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.pre("save", async function () {
  if (!this.ticketId) {
    const SupportTicketModel =
      mongoose.models.SupportTicket ||
      mongoose.model("SupportTicket", supportTicketSchema);

    const count = await SupportTicketModel.countDocuments();

    this.ticketId = `FT-${1001 + count}`;
  }

  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  if (this.status !== "resolved") {
    this.resolvedAt = null;
  }
});

const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;