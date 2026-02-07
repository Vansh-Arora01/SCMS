import { Notification } from "../Models/notification.model.js"

export const createNotification = async ({
  userId,
  role,
  title,
  message,
  complaintId
}) => {
  try {
    await Notification.create({
      userId,
      role,
      title,
      message,
      complaintId
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};
