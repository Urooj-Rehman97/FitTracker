import SupportTicket from "../models/SupportTicket.mjs";

export const getAdminTickets = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      priority = "",
      category = "",
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          ticketId: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const tickets = await SupportTicket.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get admin tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load support tickets",
    });
  }
};

export const getAdminTicketStats = async (req, res) => {
  try {
    const [
      total,
      open,
      inProgress,
      resolved,
      urgent,
    ] = await Promise.all([
      SupportTicket.countDocuments(),

      SupportTicket.countDocuments({
        status: "open",
      }),

      SupportTicket.countDocuments({
        status: "in-progress",
      }),

      SupportTicket.countDocuments({
        status: "resolved",
      }),

      SupportTicket.countDocuments({
        priority: "urgent",
        status: { $nin: ["resolved", "closed"] },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        open,
        inProgress,
        resolved,
        urgent,
      },
    });
  } catch (error) {
    console.error("Get support stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load support statistics",
    });
  }
};

export const updateAdminTicket = async (req, res) => {
  try {
    const { status, priority, category, adminResponse } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (status !== undefined) {
      ticket.status = status;
    }

    if (priority !== undefined) {
      ticket.priority = priority;
    }

    if (category !== undefined) {
      ticket.category = category;
    }

    if (adminResponse !== undefined) {
      ticket.adminResponse = adminResponse;
    }

    if (
      status === "resolved" ||
      status === "closed"
    ) {
      ticket.resolvedAt = new Date();
    }

    if (
      status &&
      status !== "resolved" &&
      status !== "closed"
    ) {
      ticket.resolvedAt = null;
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(
      ticket._id
    ).populate("user", "name email");

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Update admin ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update support ticket",
    });
  }
};

export const deleteAdminTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Support ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete support ticket",
    });
  }
};