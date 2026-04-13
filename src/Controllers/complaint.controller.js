


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
import { createNotification } from "../services/notification.service.js";


export const createComplaint = asynchandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { title, description, category, isAnonymous, eligibleforVote } = req.body;

  // 
  const complaint = await Complaint.create({
    title,
    description,
    category,
    isAnonymous: Boolean(isAnonymous),
    createdBy: req.user._id, // 🔥 FIXED
    collegeId: req.user.collegeId,
    status: "OPEN",
    eligibleforVote: Boolean(eligibleforVote),
    priorityScore: 0
  });

  /* ================= EMAIL ================= */
  try {
    const mailContent = complaintLifecycleMailgenContent({
      username: isAnonymous ? "Anonymous User" : req.user.name, // 🔥 improvement
      complaint,
      event: "REGISTERED"
    });

    await sendEmail({
      email: req.user.email,
      subject: mailContent.subject,
      mailgenContent: mailContent.mailgenContent
    });

    console.log("✅ Mail sent successfully");
  } catch (mailError) {
    console.log("❌ Mail failed:", mailError.message);
  }

  /** Notify  */
  try {
    await createNotification({
      userId: req.user._id,
      role: req.user.role,
      title: "Complaint Registered Successfully",
      message: `Your complaint "${complaint.title}" has been registered and is currently OPEN.`,
      complaintId: complaint._id
    });

    console.log("🔔 Notification created");
  } catch (notificationError) {
    console.log("❌ Notification failed:", notificationError.message);
  }

  // if anonymous 
  const responseComplaint = complaint.toObject();

  if (responseComplaint.isAnonymous) {
    responseComplaint.createdBy = null;
  }

  return res.status(201).json(
    new ApiResponse(201, responseComplaint, "Complaint created successfully")
  );
});



export const listComplaints = asynchandler(async (req, res) => {
  const filter = {
    collegeId: req.user.collegeId
  };

  // can see the complaints they created 
  if (req.user.role === "STUDENT") {
    filter.createdBy = req.user._id;
  }

  const complaints = await Complaint.find(filter)
    .sort({ priorityScore: -1, createdAt: -1 })
    .select("-__v")
    .populate("createdBy", "name email"); // optional (safe)

  // if anonymous 
  const formattedComplaints = complaints.map(c => {
    const obj = c.toObject();

    if (obj.isAnonymous) {
      obj.createdBy = null; 
    }

    return obj;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: formattedComplaints.length,
        complaints: formattedComplaints
      },
      "Complaints fetched successfully"
    )
  );
});

export const getComplaintById = asynchandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  
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

  const complaints = await Complaint.find({
    collegeId: req.user.collegeId,   // college only what user belongs to 
    eligibleforVote: true,
    status: { $nin: ["RESOLVED", "REJECTED"] }
  })
    .select("title category voteCount status createdAt description attachments")
    .sort({ createdAt: -1 });

 
  const complaintIds = complaints.map(c => c._id);

  const userVotes = await Vote.find({
    userId,
    complaintId: { $in: complaintIds }
  });

  
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

  const filter = {
    _id: id,
    collegeId: req.user.collegeId
  };

  // If student, restrict to their own complaint
  if (req.user.role === "STUDENT") {
    filter.createdBy = req.user._id;
  }

  const complaint = await Complaint.findOne(filter)
    .select("title description status priority voteCount assignedTo createdAt updatedAt");

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
