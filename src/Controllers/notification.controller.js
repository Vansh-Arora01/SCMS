import mongoose from "mongoose";
import { Notification } from "../Models/notification.model.js";
import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import { ApiError } from "../Utils/apierror.js";

/* ================= GET USER NOTIFICATIONS ================= */
export const getNotifications = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Optional pagination (future-ready)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // 🔥 faster response

  const total = await Notification.countDocuments({ userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Notifications fetched successfully"
    )
  );
});

/* ================= GET UNREAD COUNT ================= */
export const getUnreadCount = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const count = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { count },
      "Unread notification count fetched successfully"
    )
  );
});

/* ================= MARK SINGLE AS READ ================= */
export const markAsRead = asynchandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: id,
      userId, // 🔐 ownership check
    },
    { $set: { isRead: true } },
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

/* ================= MARK ALL AS READ ================= */
export const markAllAsRead = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        modifiedCount: result.modifiedCount,
      },
      "All notifications marked as read"
    )
  );
});