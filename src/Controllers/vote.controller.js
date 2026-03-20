import { Vote } from "../Models/Vote.model.js";
import { Complaint } from "../Models/Complain.model.js";
import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import {ApiError} from "../Utils/apierror.js";

/* ---------- HELPER ---------- */
const calculatePriority = (voteCount) => {
  if (voteCount > 10) return "critical";
  if (voteCount > 5) return "high";
  if (voteCount > 2) return "medium";
  return "low";
};
const VOTE_ESCALATION_THRESHOLD = 10;


export const voteOnComplaint = asynchandler(async (req, res) => {
  const complaintId = req.params.id;
  const userId = req.user._id;

  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const alreadyVoted = await Vote.findOne({ complaintId, userId });

  if (alreadyVoted) {
    throw new ApiError(400, "You already voted");
  }

  await Vote.create({ complaintId, userId });

  // ✅ increment ONLY ONCE
  complaint.voteCount += 1;

  // ✅ escalation first
  if (complaint.voteCount >= VOTE_ESCALATION_THRESHOLD) {
    complaint.status = "ESCALATED";
    complaint.escalatedAt = new Date();
    complaint.priority = "critical";
  } else {
    // ✅ only calculate if not escalated
    complaint.priority = calculatePriority(complaint.voteCount);
  }

  console.log("After vote:", complaint.voteCount, complaint.priority);

  await complaint.save(); // ✅ only once

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        voteCount: complaint.voteCount,
        priority: complaint.priority,
        status: complaint.status
      },
      "Vote added"
    )
  );
});
/* ---------- REMOVE VOTE ---------- */
export const removeVote = asynchandler(async (req, res) => {
  const complaintId = req.params.id;
  const userId = req.user._id;

  const complaint = await Complaint.findOne({
    _id: complaintId,
    collegeId: req.user.collegeId
  });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const vote = await Vote.findOneAndDelete({ complaintId, userId });

  if (!vote) {
    throw new ApiError(400, "You have not voted on this complaint");
  }

  // ✅ update safely
  complaint.voteCount = Math.max(0, complaint.voteCount - 1);

  // ✅ reset escalation if needed
  if (complaint.voteCount < VOTE_ESCALATION_THRESHOLD) {
    complaint.status = "OPEN";
    complaint.escalatedAt = null;
  }

  complaint.priority = calculatePriority(complaint.voteCount);

  await complaint.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        voteCount: complaint.voteCount,
        priority: complaint.priority,
        status: complaint.status
      },
      "Vote removed successfully"
    )
  );
});