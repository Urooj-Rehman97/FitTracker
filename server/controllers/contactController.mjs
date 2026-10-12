import ContactMessage from "../models/ContactMessage.mjs";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (cleanSubject.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please select or enter a valid subject.",
      });
    }

    if (cleanMessage.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must contain at least 10 characters.",
      });
    }

    const contactMessage = await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Create contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send your message.",
    });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get contact messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages.",
    });
  }
};

export const getContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: contactMessage,
    });
  } catch (error) {
    console.error("Get contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message.",
    });
  }
};

export const updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = ["new", "read", "replied", "closed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message status.",
        });
      }

      contactMessage.status = status;
    }

    if (reply !== undefined) {
      contactMessage.reply = String(reply).trim();

      if (contactMessage.reply) {
        contactMessage.repliedAt = new Date();

        // Automatically mark as replied only when
        // the admin did not explicitly select a status.
        if (
          status === undefined &&
          (contactMessage.status === "new" ||
            contactMessage.status === "read")
        ) {
          contactMessage.status = "replied";
        }
      } else {
        contactMessage.repliedAt = null;
      }
    }

    await contactMessage.save();

    return res.status(200).json({
      success: true,
      message: "Contact message updated successfully.",
      data: contactMessage,
      contactMessage,
    });
  } catch (error) {
    console.error("Update contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update contact message.",
    });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    await ContactMessage.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message.",
    });
  }
};