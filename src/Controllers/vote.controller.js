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

// export const voteOnComplaint = asynchandler(async (req, res) => {
//   const complaintId = req.params.id;
//   const userId = req.user._id;

  

//   // 🔎 Check complaint exists AND belongs to same college
//   const complaint = await Complaint.findOne({
//     _id: complaintId,
//     collegeId: req.user.collegeId,
//     eligibleforVote: true,
//     status: { $nin: ["RESOLVED", "REJECTED"] }
//   });

//   if (!complaint) {
//     throw new ApiError(404, "Complaint not found or not eligible for voting");
//   }

//   // 🚫 Prevent duplicate vote
//   const alreadyVoted = await Vote.findOne({
//     complaintId,
//     userId
//   });

//   if (alreadyVoted) {
//     throw new ApiError(400, "You have already voted for this complaint");
//   }

//   // ✅ Create vote
//   await Vote.create({
//     complaintId,
//     userId
//   });

//   // ✅ Atomic increment (SAFE)
//   await Complaint.findByIdAndUpdate(
//     complaintId,
//     { $inc: { voteCount: 1 } }
//   );

//   return res.status(200).json(
//     new ApiResponse(200, null, "Vote registered successfully")
//   );
// });

// /* ---------- REMOVE VOTE (OPTIONAL BUT GOOD) ---------- */
// export const removeVote = asynchandler(async (req, res) => {
//   const { id: complaintId } = req.params;
//   const userId = req.user._id;

//   // 🔐 Role restriction
  

//   // 🔎 Check complaint exists + same college
//   const complaint = await Complaint.findOne({
//     _id: complaintId,
//     collegeId: req.user.collegeId
//   });

//   if (!complaint) {
//     throw new ApiError(404, "Complaint not found");
//   }

//   // 🗳 Remove vote
//   const vote = await Vote.findOneAndDelete({
//     complaintId,
//     userId
//   });

//   if (!vote) {
//     throw new ApiError(400, "You have not voted on this complaint");
//   }

//   // 🔄 Atomic decrement
//   const updatedComplaint = await Complaint.findByIdAndUpdate(
//     complaintId,
//     { $inc: { voteCount: -1 } },
//     { new: true }
//   );

//   // 🧠 Recalculate priority safely
//   updatedComplaint.priority = calculatePriority(
//     Math.max(0, updatedComplaint.voteCount)
//   );

//   await updatedComplaint.save();

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         voteCount: updatedComplaint.voteCount,
//         priority: updatedComplaint.priority
//       },
//       "Vote removed successfully"
//     )
//   );
// });

export const voteOnComplaint = asynchandler(async (req, res) => {
  const complaintId = req.params.id;
  const userId = req.user._id;

  const complaint = await Complaint.findOne({
    _id: complaintId,
    collegeId: req.user.collegeId,
    eligibleforVote: true,
    status: { $nin: ["RESOLVED", "REJECTED"] }
  });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found or not eligible for voting");
  }

  const alreadyVoted = await Vote.findOne({
    complaintId,
    userId
  });

  if (alreadyVoted) {
    throw new ApiError(400, "You have already voted for this complaint");
  }

  await Vote.create({
    complaintId,
    userId
  });

  // 🔼 increment vote
  const updatedComplaint = await Complaint.findByIdAndUpdate(
    complaintId,
    { $inc: { voteCount: 1 } },
    { new: true }
  );

  // 🧠 Update priority
  if (updatedComplaint.status !== "ESCALATED") {
    updatedComplaint.priority = calculatePriority(updatedComplaint.voteCount);
  }

  // 🚨 Escalation rule
  if (
    updatedComplaint.voteCount >= VOTE_ESCALATION_THRESHOLD &&
    updatedComplaint.status !== "ESCALATED"
  ) {
    updatedComplaint.status = "ESCALATED";
    updatedComplaint.escalatedAt = new Date();
    updatedComplaint.priority = "critical";
  }

  await updatedComplaint.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        voteCount: updatedComplaint.voteCount,
        priority: updatedComplaint.priority,
        status: updatedComplaint.status
      },
      "Vote registered successfully"
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

  const vote = await Vote.findOneAndDelete({
    complaintId,
    userId
  });

  if (!vote) {
    throw new ApiError(400, "You have not voted on this complaint");
  }

  const updatedComplaint = await Complaint.findByIdAndUpdate(
    complaintId,
    { $inc: { voteCount: -1 } },
    { new: true }
  );

  updatedComplaint.priority = calculatePriority(
    Math.max(0, updatedComplaint.voteCount)
  );

  await updatedComplaint.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        voteCount: updatedComplaint.voteCount,
        priority: updatedComplaint.priority
      },
      "Vote removed successfully"
    )
  );
});