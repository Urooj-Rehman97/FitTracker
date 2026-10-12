import SupportTicket from "../models/SupportTicket.mjs";

const generateTicketId = () => {
  return `FT-${Date.now().toString().slice(-8)}`;
};

export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      message,
      description,
      category,
      priority,
    } = req.body;

    const ticketDescription =
      description?.trim() || message?.trim();

    if (!subject?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    if (!ticketDescription) {
      return res.status(400).json({
        success: false,
        message: "Ticket description is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing",
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user.id,
      ticketId: generateTicketId(),
      subject: subject.trim(),
      description: ticketDescription,
      category: category || "Technical",
      priority: priority || "medium",
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create support ticket",
      error: error.name || "ServerError",
    });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get my support tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load support tickets",
    });
  }
};

export const getMyTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Get support ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load support ticket",
    });
  }
};

export const deleteMyTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

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
    console.error("Delete support ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete support ticket",
    });
  }
};