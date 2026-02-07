import express from "express";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { uploadComplaintMedia } from "../Controllers/complaintMedia.controller.js";

const router = express.Router();

/**
 * Upload complaint media (USER)
 */
router.post(
  "/:id/media",
  verifyJWT,
  allowRoles("STUDENT"),
  upload.single("file"),
  uploadComplaintMedia
);

export default router;
