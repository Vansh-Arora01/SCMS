import express from "express";

import {getNotifications,
    getUnreadCount,
     markAsRead,
     markAllAsRead
} from "../Controllers/notification.controller.js"

import { verifyJWT } from "../Middlewares/Auth.middleware.js";
const router = express.Router();

router.get("/", verifyJWT, getNotifications);
router.get("/unread-count", verifyJWT, getUnreadCount);
router.patch("/:id/read", verifyJWT, markAsRead);
router.patch("/read-all", verifyJWT, markAllAsRead);




export default router;
