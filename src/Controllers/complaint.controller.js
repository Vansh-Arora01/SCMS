// import { Complaint } from "../Models/Complain.model.js";
// import { validationResult } from "express-validator";
// import { asynchandler } from "../Utils/asyncHandler.js";
// import { ApiResponse } from "../Utils/apiresponse.js";
// import {ApiError} from "../Utils/apierror.js";
// import {
  
//   checkComplaintCollege
// } from "../Middlewares/complaint.middleware.js"
// import {  sendEmail } from "../Utils/mail.js";
// import {complaintLifecycleMailgenContent} from "../mails/tempelates/ComplainStatus.js"

// /**
//  * =====================================================
//  * CREATE COMPLAINT (USER)
//  * POST /complaints
//  * =====================================================
//  */
// export const createComplaint = asynchandler(async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     throw new ApiError(400, "Validation failed", errors.array());
//   }

//   const { title, description, category, isAnonymous ,eligibleforVote} = req.body;

//   const complaint = await Complaint.create({
//     title,
//     description,
//     category,
//     isAnonymous: Boolean(isAnonymous),
//     createdBy: isAnonymous ? null : req.user._id,
//     collegeId: req.user.collegeId,
//     status: "OPEN",
//     eligibleforVote:Boolean(eligibleforVote),
//     priorityScore: 0
//   });
//   // One event 
//    await sendEmail({
//     email: req.user.email,
//     subject: "Complaint Registered Successfully",
//     mailgenContent: complaintLifecycleMailgenContent({
//       username: req.user.username,
//       complaintId: complaint._id,
//       event: "REGISTERED"
//     })
//   })

//   return res
//     .status(201)
//     .json(
//       new ApiResponse(
//         201,
//         complaint,
//         "Complaint created successfully"
//       )
//     );
// });

// /**
//  * =====================================================
//  * LIST COMPLAINTS (USER / ADMIN)
//  * GET /complaints
//  * =====================================================
//  */
// export const listComplaints = asynchandler(async (req, res) => {
//   const complaints = await Complaint.find({
//     collegeId: req.user.collegeId
//   })
//     .sort({ priorityScore: -1, createdAt: -1 })
//     .select("-__v");

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         count: complaints.length,
//         complaints
//       },
//       "Complaints fetched successfully"
//     )
//   );
// });

// /**
//  * =====================================================
//  * GET COMPLAINT BY ID
//  * GET /complaints/:id
//  * =====================================================
//  */
// export const getComplaintById = asynchandler(async (req, res) => {
//   const complaint = await Complaint.findById(req.params.id);

//   if (!complaint) {
//     throw new ApiError(404, "Complaint not found");
//   }

//   // Tenant isolation
//   if (!checkComplaintCollege(complaint, req.user)) {
//     throw new ApiError(403, "Access denied");
//   }

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         complaint,
//         "Complaint fetched successfully"
//       )
//     );
// });

// /**
//  * =====================================================
//  * UPDATE COMPLAINT STATUS (ADMIN / SUPERADMIN)
//  * PATCH /complaints/:id/status
//  * =====================================================
//  */
// // export const updateComplaintStatus = asynchandler(async (req, res) => {

// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     throw new ApiError(400, "Validation failed", errors.array());
// //   }

// //   const { status, resolutionNote , assignedTo} = req.body;

// //   const complaint = await Complaint.findById(req.params.id).populate("createdBy", "name email");

// //   if (!complaint) {
// //     throw new ApiError(404, "Complaint not found");
// //   }

// //   // Tenant isolation
// //   if (complaint.collegeId !== req.user.collegeId) {
// //     throw new ApiError(403, "Unauthorized access");
// //   }

// //   // Terminal state protection
// //   if (["RESOLVED", "REJECTED"].includes(complaint.status)) {
// //     throw new ApiError(
// //       400,
// //       "Complaint is already closed and cannot be updated"
// //     );
// //   }

// //   // Lifecycle validation
// //   const isValidTransition = validateStatusTransition(
// //     complaint.status,
// //     status
// //   );
// //   //ADDING SOMETHING!!! SEEIT
// //   if (status === "ASSIGNED") {
// //   if (!assignedTo) {
// //     throw new ApiError(400, "assignedTo is required when assigning a complaint");
// //   }

// //   const assignee = await User.findById(assignedTo);

// //   if (!assignee || !["ADMIN", "STAFF"].includes(assignee.role)) {
// //     throw new ApiError(400, "Invalid assignee");
// //   }

// //   complaint.assignedTo = assignedTo;
// //   complaint.assignedAt = new Date();
// // }


// //   if (!isValidTransition) {
// //     throw new ApiError(
// //       400,
// //       `Invalid status transition from ${complaint.status} to ${status}`
// //     );
// //   }

// //   complaint.status = status;

// //   if (resolutionNote) {
// //     complaint.resolutionNote = resolutionNote;
// //   }

// //   await complaint.save();
// //   // 📧 EMAIL TRIGGER BASED ON STATUS
// // const emailEvents = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "ESCALATED"];

// // if (emailEvents.includes(status) && complaint.createdBy) {
// //   await sendEmail({
// //     email: complaint.createdBy.email,
// //     subject: `Complaint ${status}`,
// //     mailgenContent: complaintLifecycleMailgenContent({
// //       username: complaint.createdBy.username,
// //       complaintId: complaint._id,
// //       event: status,
// //       remarks: resolutionNote || ""
// //     })
// //   });
// // }


// //   return res
// //     .status(200)
// //     .json(
// //       new ApiResponse(
// //         200,
// //         complaint,
// //         "Complaint status updated successfully"
// //       )
// //     );
// // });

// // export const getVoteableComplaints = asynchandler(async (req, res) => {
// //   const complaints = await Complaint.find({
// //     eligibleForVote: true,
// //     status: { $ne: "RESOLVED" }
// //   })
// //     .select("title category votes status createdAt")
// //     .sort({ createdAt: -1 });

// //   if (!complaints || complaints.length === 0) {
// //     throw new ApiError(404, "No voteable complaints found");
// //   }

// //   return res.status(200).json(
// //     new ApiResponse(
// //       200,
// //       complaints,
// //       "Voteable complaints fetched successfully"
// //     )
// //   );
// // });

// export const getVoteableComplaints = asynchandler(async (req, res) => {

//   const complaints = await Complaint.find({
//     eligibleforVote: true,
//     status: { $nin: ["RESOLVED", "REJECTED"] }
//   })
//     .select("title category votes status createdAt")
//     .sort({ createdAt: -1 });

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       complaints,
//       complaints.length
//         ? "Voteable complaints fetched successfully"
//         : "No voteable complaints available"
//     )
//   );
// });

// export const getComplaintStatusById = asynchandler(async (req, res) => {
//   const { id } = req.params;

//   const complaint = await Complaint.findById(id).select(
//     "title description status priority votes assignedTo createdAt updatedAt"
//   );

//   if (!complaint) {
//     throw new ApiError(404, "Complaint not found");
//   }

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       complaint,
//       "Complaint status fetched successfully"
//     )
//   );
// });



// export const deleteComplaint = asynchandler(async (req, res) => {
//   const { id } = req.params;

//   const complaint = await Complaint.findById(id);

//   if (!complaint) {
//     throw new ApiError(404, "Complaint not found");
//   }

//   // Clean related data 
//   await ComplaintMedia.deleteMany({ complaint: id });
//   await Vote.deleteMany({ complaint: id });

//   await complaint.deleteOne();

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       null,
//       "Complaint deleted successfully"
//     )
//   );
// });


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
  // One event 
  await sendEmail({
    email: req.user.email,
    subject: "Complaint Registered Successfully",
    mailgenContent: complaintLifecycleMailgenContent({
      username: req.user.username,
      complaintId: complaint._id,
      event: "REGISTERED"
    })
  })

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        complaint,
        "Complaint created successfully"
      )
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
