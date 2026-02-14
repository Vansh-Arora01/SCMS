import { Notification } from "../Models/notification.model.js";
import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";

// GET USER NOTIFICATIONS
export const getNotifications = asynchandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  })
    .sort({ createdAt: -1 })
    .limit(20);

  return res.status(200).json(
    new ApiResponse(
      200,
      { notifications },  // 👈 wrap inside object
      "Notifications fetched successfully"
    )
  );
});


// GET UNREAD COUNT
export const getUnreadCount = asynchandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { count },
      "Unread notification count fetched"
    )
  );
});

// MARK SINGLE NOTIFICATION AS READ
export const markAsRead = asynchandler(async (req, res) => {
  const updatedNotification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedNotification,
      "Notification marked as read"
    )
  );
});

// MARK ALL AS READ
export const markAllAsRead = asynchandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { userId: userId, isRead: false },   // ⚠ fixed field from user → userId
    { $set: { isRead: true } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "All notifications marked as read"
    )
  );
});
