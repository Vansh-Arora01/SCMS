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
/* ---------- ADD VOTE ---------- */
// export const voteOnComplaint = asynchandler(async (req, res) => {

//   const { complaintId } = req.params;
//   const userId = req.user._id;

//   const complaint = await Complaint.findById(complaintId);
//   if (!complaint) {
//     throw new ApiError(404, "Complaint not found");
//   }

//   if (["RESOLVED", "REJECTED"].includes(complaint.status)) {
//   throw new ApiError(400, "Voting is closed for this complaint");
// }


//   // Create vote (DB prevents duplicates)
//   try {
//     await Vote.create({
//       complaint: complaintId,
//       user: userId
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       throw new ApiError(400, "You have already voted on this complaint");
//     }
//     throw error;
//   }

//   // Increment vote count
//   complaint.voteCount += 1;

//   // Auto priority update
//  if (complaint.status !== "ESCALATED") {
//   complaint.priority = calculatePriority(complaint.voteCount);
// }
//   if (
//   complaint.voteCount >= VOTE_ESCALATION_THRESHOLD &&
//   complaint.status !== "ESCALATED"
// ) {
//   complaint.status = "ESCALATED";
//   complaint.escalatedAt = new Date();

//   // optional: force higher visibility
//   complaint.priority = "critical";
// }

//   await complaint.save();

//   return res.status(201).json(
//     new ApiResponse(
//       201,
//       {
//         voteCount: complaint.voteCount,
//         priority: complaint.priority
//       },
//       "Vote added successfully"
//     )
//   );
// });
export const voteOnComplaint = asynchandler(async (req, res) => {

  const complaintId = req.params.id;
  const userId = req.user._id;

  // Check complaint exists
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Prevent duplicate voting
  const alreadyVoted = await Vote.findOne({
    complaintId,
    userId
  });

  if (alreadyVoted) {
    throw new ApiError(400, "You have already voted for this complaint");
  }

  // Create vote
  await Vote.create({
    complaintId,
    userId
  });

  // Increment vote count
  complaint.voteCount += 1;
  await complaint.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Vote registered successfully")
  );
});

/* ---------- REMOVE VOTE (OPTIONAL BUT GOOD) ---------- */
export const removeVote = asynchandler(async (req, res) => {
  const { complaintId } = req.params;
  const userId = req.user._id;

  const vote = await Vote.findOneAndDelete({
    complaint: complaintId,
    user: userId
  });

  if (!vote) {
    throw new ApiError(400, "You have not voted on this complaint");
  }

  const complaint = await Complaint.findById(complaintId);

  complaint.voteCount = Math.max(0, complaint.voteCount - 1);
  complaint.priority = calculatePriority(complaint.voteCount);

  await complaint.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        voteCount: complaint.voteCount,
        priority: complaint.priority
      },
      "Vote removed successfully"
    )
  );
});
