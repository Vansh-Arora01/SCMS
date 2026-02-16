import { Notification } from "../Models/notification.model.js";
import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import { ApiError } from "../Utils/apierror.js";


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
      { notifications },
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
      "Unread notification count fetched successfully"
    )
  );
});


// MARK SINGLE NOTIFICATION AS READ
export const markAsRead = asynchandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id   // 🔐 ownership check
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read"
    )
  );
});


// MARK ALL AS READ
export const markAllAsRead = asynchandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
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
