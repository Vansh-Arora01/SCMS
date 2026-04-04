import { Notification } from "../Models/notification.model.js";
import { User } from "../Models/User.model.js";

export const createNotification = async ({
  userId,
  role,
  title,
  message,
  complaintId,
  collegeId
}) => {

  // ✅ Case 1: Direct user notification
  if (userId) {
    return await Notification.create({
      userId,
      role,
      title,
      message,
      complaintId
    });
  }

  // ✅ Case 2: Role-based notification (MULTI USER)
  if (role) {
    const users = await User.find({
      role,
      collegeId
    }).select("_id role");

    if (!users.length) return;

    const notifications = users.map((user) => ({
      userId: user._id,
      role: user.role, // 🔥 IMPORTANT (use user's actual role)
      title,
      message,
      complaintId
    }));

    return await Notification.insertMany(notifications);
  }

  throw new Error("userId or role is required");
};