import { Notification } from "../Models/notification.model.js"

export const createNotification = async ({
  userId,
  role,
  title,
  message,
  complaintId
}) => {
  try {
    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
      complaintId
    });

    console.log("✅ Notification saved:", notification._id);
    return notification;

  } catch (error) {
    console.error("❌ Notification FULL ERROR:", error);
    throw error; // 🔥 important for debugging
  }
};