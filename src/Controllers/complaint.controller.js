


import { Complaint } from "../Models/Complain.model.js";
import { Vote } from "../Models/Vote.model.js";
import { validationResult } from "express-validator";
import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import { ApiError } from "../Utils/apierror.js";
import {

  checkComplaintCollege
} from "../Middlewares/complaint.middleware.js"
// import { ComplaintMedia } from "../Models/ComplaintMedia.model.js";
import { sendEmail } from "../Utils/mail.js";
import { complaintLifecycleMailgenContent } from "../mails/tempelates/ComplainStatus.js"

/**
 * =====================================================
 * CREATE COMPLAINT (USER)
 * POST /complaints
 * =====================================================
 */
export const createComplaint = asynchandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { title, description, category, isAnonymous, eligibleforVote } = req.body;

  const complaint = await Complaint.create({
    title,
    description,
    category,
    isAnonymous: Boolean(isAnonymous),
    createdBy: isAnonymous ? null : req.user._id,
    collegeId: req.user.collegeId,
    status: "OPEN",
    eligibleforVote: Boolean(eligibleforVote),
    priorityScore: 0
  });

  // 🔥 Safe mail sending
  try {
  console.log("📧 Preparing to send mail...");

  const mailContent = complaintLifecycleMailgenContent({
    name: req.user.username,   // or req.user.username (check!)
    complaint,
    event: "REGISTERED"
  });

  console.log("📦 Mail Content:", mailContent);

  await sendEmail({
    email: req.user.email,
    subject: mailContent.subject,
    mailgenContent: mailContent.body   // ✅ ONLY body
  });

  console.log("✅ Mail sent successfully");

} catch (mailError) {
  console.log("❌ Mail failed:", mailError.message);
}

  return res.status(201).json(
    new ApiResponse(201, complaint, "Complaint created successfully")
  );
});

/**
 * =====================================================
 * LIST COMPLAINTS (USER / ADMIN)
 * GET /complaints
 * =====================================================
 */
export const listComplaints = asynchandler(async (req, res) => {
  const filter = {
    collegeId: req.user.collegeId
  };

  // If user is a student, only show their own complaints
  if (req.user.role === "STUDENT") {
    filter.createdBy = req.user._id;
  }

  const complaints = await Complaint.find(filter)
    .sort({ priorityScore: -1, createdAt: -1 })
    .select("-__v");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: complaints.length,
        complaints
      },
      "Complaints fetched successfully"
    )
  );
});

/**
 * =====================================================
 * GET COMPLAINT BY ID
 * GET /complaints/:id
 * =====================================================
 */
export const getComplaintById = asynchandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Tenant isolation
  if (!checkComplaintCollege(complaint, req.user)) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        complaint,
        "Complaint fetched successfully"
      )
    );
});


export const getVoteableComplaints = asynchandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Get complaints
  const complaints = await Complaint.find({
    eligibleforVote: true,
    status: { $nin: ["RESOLVED", "REJECTED"] }
  })
    .select("title category voteCount status createdAt description") // Fixed: votes -> voteCount
    .sort({ createdAt: -1 });

  // 2. Get user's votes for these complaints
  const complaintIds = complaints.map(c => c._id);
  const userVotes = await Vote.find({
    userId,
    complaintId: { $in: complaintIds }
  });

  // 3. Map hasVoted status
  const voteMap = new Set(userVotes.map(v => v.complaintId.toString()));

  const complaintsWithStatus = complaints.map(c => ({
    ...c.toObject(),
    hasVoted: voteMap.has(c._id.toString())
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      complaintsWithStatus,
      complaints.length
        ? "Voteable complaints fetched successfully"
        : "No voteable complaints available"
    )
  );
});

export const getComplaintStatusById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id).select(
    "title description status priority voteCount assignedTo createdAt updatedAt"
  );

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      complaint,
      "Complaint status fetched successfully"
    )
  );
});



export const deleteComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Role check
  if (!["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
    throw new ApiError(403, "Not authorized to delete complaints");
  }

  // Tenant isolation
  if (!checkComplaintCollege(complaint, req.user)) {
    throw new ApiError(403, "Access denied");
  }


  await Vote.deleteMany({ complaintId: id });

  await complaint.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Complaint deleted successfully")
  );
});
