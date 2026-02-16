import express from "express";
import {
  createComplaint,
  listComplaints,
  getComplaintById,
 
  getVoteableComplaints,
  getComplaintStatusById,
  deleteComplaint
} from "../Controllers/complaint.controller.js";
import { voteOnComplaint, removeVote } from "../Controllers/vote.controller.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";

import {
  createComplaintValidator,
  complaintIdValidator,
  updateComplaintStatusValidator
} from "../Validators/complaint.validator.js";

const router = express.Router();

/**
 * ===============================
 * USER ROUTES
 * ===============================
 */

// Create complaint
router.post(
  "/create",
  verifyJWT,
  allowRoles("STUDENT"),
  createComplaintValidator,
  createComplaint
);

// List complaints (user + admin)
router.get(
  "/",
  verifyJWT,
  listComplaints
);

// Get complaint by ID


/**
 * ===============================
 * ADMIN ROUTES
 * ===============================
 */

// Update complaint status
// router.patch(
//   "/:id/status",
//   verifyJWT,
//   allowRoles("ADMIN","SUPER_ADMIN","STAFF"),
//   complaintIdValidator,
//   updateComplaintStatusValidator,
//   updateComplaintStatus
// );

// 2 updated routers 
router.get("/voteable",verifyJWT,getVoteableComplaints)
router.get("/status/:id", verifyJWT, getComplaintStatusById);

// Vote routes
router.post("/vote/:id", verifyJWT, voteOnComplaint);
router.post("/unvote/:id", verifyJWT, removeVote);

// delete one for admin
router.delete(
  "/:id",
  verifyJWT,
  allowRoles("ADMIN","SUPER_ADMIN"),
  deleteComplaint
);
router.get(
  "/:id",
  verifyJWT,
  complaintIdValidator,
  getComplaintById
);
export default router;
