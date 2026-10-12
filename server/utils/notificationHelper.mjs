import Notification from "../models/Notification.mjs";

export const createUserNotification = async ({
  userId,
  title,
  message,
  type = "system",
  link = "",
}) => {
  try {
    console.log("AUTOMATIC NOTIFICATION DATA:", {
      userId,
      title,
      message,
      type,
      link,
    });

    const notification = await Notification.create({
      user: userId,
      title: title.trim(),
      message: message.trim(),
      type,
      link,
    });

    console.log(
      "AUTOMATIC NOTIFICATION CREATED:",
      notification
    );

    return notification;
  } catch (error) {
    console.error(
      "Create automatic notification error:",
      error
    );

    return null;
  }
};