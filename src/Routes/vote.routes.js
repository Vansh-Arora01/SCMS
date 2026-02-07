import { Router } from "express";
import { voteOnComplaint, removeVote } from "../Controllers/vote.controller.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";

const router = Router();

// vote
router.post(
  "/:complaintId/vote",
  verifyJWT,
  voteOnComplaint
);

// remove vote
router.delete(
  "/:complaintId/vote",
  verifyJWT,
  removeVote
);

export default router;
