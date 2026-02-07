import { Notification } from "../Models/notification.model.js";
import { asynchandler } from "../Utils/asyncHandler.js";


export const getNotifications =  asynchandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(notifications);
});
export const getUnreadCount =  asynchandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  });

  res.json({ count });
});
export const markAsRead =  asynchandler (async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({ success: true });
});
