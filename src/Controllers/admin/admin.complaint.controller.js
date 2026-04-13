import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import { ApiError } from "../../Utils/apierror.js";
import { Complaint } from "../../Models/Complain.model.js";
import { changeComplaintStatus } from "../../services/complaint.service.js";
import { createNotification } from "../../services/notification.service.js";
import { User } from "../../Models/User.model.js";
import { sendEmail } from "../../Utils/mail.js";

export const getUnassignedComplaints = asynchandler(async (req, res) => {
  const complaints = await Complaint.find({
    collegeId: req.user.collegeId,
    status: "OPEN",
     $or: [
    { assignedTo: null },
    { assignedTo: { $exists: false } }
  ],
    
  }).populate("createdBy", "name email enrollment");

  res.status(200).json(
    new ApiResponse(200, complaints, "Unassigned complaints fetched")
  );
});

export const assignComplaint = asynchandler(async (req, res) => {

  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can assign complaints");
  }

  const { enrollment, name } = req.body;

  if (!enrollment) {
    throw new ApiError(400, "Staff enrollment is required");
  }

  const staff = await User.findOne({
    enrollment,
    role: "STAFF",
    collegeId: req.user.collegeId
  });

  if (!staff) {
    throw new ApiError(404, "Staff not found with this enrollment");
  }

  if (name && staff.name !== name) {
    throw new ApiError(400, "Name does not match enrollment");
  }

  const complaint = await changeComplaintStatus({
    complaintId: req.params.id,
    status: "ASSIGNED",
    assignedTo: staff._id,
    user: req.user
  });

  await createNotification({
    userId: staff._id,
    role: "STAFF",
    title: "New Complaint Assigned",
    message: `Complaint assigned to you`,
    complaintId: complaint._id
  });

  // ===================== mail to staff when complain assigned  =====================

 try {
  if (staff.email) {
    await sendEmail({
      email: staff.email,
      subject: "New Complaint Assigned to You",
      mailgenContent: {
        body: {
          name: staff.name || "Staff",
          intro: "A new complaint has been assigned to you.",
          table: {
            data: [
              {
                ComplaintID: complaint.complaintNumber,
                Title: complaint.title,
                Category: complaint.category
              }
            ]
          },
          action: {
            instructions: "Click below to view the complaint:",
            button: {
              color: "#22c55e",
              text: "View Complaint",
              link: "https://scms-frontend-mt99.vercel.app/"
            }
          },
          outro: "Please take action as soon as possible."
        }
      }
    });
  }
} catch (error) {
  console.error(" Staff email failed:", error.message);
}

  

  res.status(200).json(
    new ApiResponse(200, complaint, "Complaint assigned successfully")
  );
});

export const reassignComplaint = asynchandler(async (req, res) => {
  const { assignedTo } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

 if (String(complaint.collegeId) !== String(req.user.collegeId)){
    throw new ApiError(403, "Unauthorized");
  }

  const staff = await User.findById(assignedTo);
  if (!staff || staff.role !== "STAFF") {
    throw new ApiError(400, "Invalid staff");
  }

  complaint.assignedTo = assignedTo;
  complaint.assignedAt = new Date();

  await complaint.save();

  res.status(200).json(
    new ApiResponse(200, complaint, "Complaint reassigned successfully")
  );
});


export const handleReassignmentRequest = asynchandler(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can handle reassignment");
  }

  const { action, newStaffId } = req.body;

  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // 🔒 College check
  if (String(complaint.collegeId) !== String(req.user.collegeId)) {
    throw new ApiError(403, "Unauthorized");
  }

  // ❗ Request must exist and be pending
  if (complaint.reassignmentStatus !== "PENDING") {
    throw new ApiError(400, "No pending reassignment request");
  }

  const oldStaffId = complaint.assignedTo;

  // =========================
  // ✅ APPROVE
  // =========================
  if (action === "APPROVE") {

    if (!newStaffId) {
      throw new ApiError(400, "New staff ID is required");
    }

    const newStaff = await User.findOne({
      _id: newStaffId,
      role: "STAFF",
      collegeId: req.user.collegeId
    });

    if (!newStaff) {
      throw new ApiError(404, "New staff not found");
    }

    // 🚫 Prevent same assignment
    if (String(oldStaffId) === String(newStaffId)) {
      throw new ApiError(400, "Already assigned to this staff");
    }

    // 🔁 Update core fields
    complaint.previousAssignedTo = oldStaffId;
    complaint.assignedTo = newStaffId;
    complaint.assignedAt = new Date();

    // 🎯 Update reassignment tracking
    complaint.reassignmentRequested = false;
    complaint.reassignmentStatus = "APPROVED";
    complaint.reassignmentHandledBy = req.user._id;
    complaint.reassignmentHandledAt = new Date();

    await complaint.save();

    // 🔔 Notify OLD staff
    if (oldStaffId) {
      await createNotification({
        userId: oldStaffId,
        role: "STAFF",
        title: "Reassignment Approved",
        message: `Your reassignment request for "${complaint.title}" has been approved`,
        complaintId: complaint._id
      });
    }

    // 🔔 Notify NEW staff
    await createNotification({
      userId: newStaffId,
      role: "STAFF",
      title: "New Complaint Assigned",
      message: `You have been assigned complaint "${complaint.title}"`,
      complaintId: complaint._id
    });

    return res.status(200).json(
      new ApiResponse(200, complaint, "Reassignment approved")
    );
  }

  // =========================
  // ❌ REJECT
  // =========================
  if (action === "REJECT") {

    complaint.reassignmentRequested = false;
    complaint.reassignmentStatus = "REJECTED";
    complaint.reassignmentHandledBy = req.user._id;
    complaint.reassignmentHandledAt = new Date();

    await complaint.save();

    // 🔔 Notify staff
    if (oldStaffId) {
      await createNotification({
        userId: oldStaffId,
        role: "STAFF",
        title: "Reassignment Rejected",
        message: `Your reassignment request for "${complaint.title}" was rejected`,
        complaintId: complaint._id
      });
    }

    return res.status(200).json(
      new ApiResponse(200, complaint, "Reassignment rejected")
    );
  }
});
export const getReassignmentRequests = asynchandler(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Admin only");
  }

  const complaints = await Complaint.find({
    collegeId: req.user.collegeId,
    reassignmentStatus: "PENDING"
  })
  .populate("assignedTo", "name email")
  .populate("reassignmentRequestedBy", "name email")
  .sort({ reassignmentRequestedAt: -1 });

  res.status(200).json(
    new ApiResponse(200, complaints, "Reassignment requests fetched")
  );
});



//one more sorted view one 
export const getComplaintsSortedByDepartment = asynchandler(async (req, res) => {
  const complaints = await Complaint.find(
    { collegeId: req.user.collegeId },
    {
      title: 1,
      description: 1,
      category: 1,   //  fixed
      status: 1,
      priority: 1,
      assignedTo: 1,
      createdAt: 1,
      voteCount:1,
      complaintNumber:1
    }
  )
    .populate("createdBy", "name email enrollment")
    .populate("assignedTo", "name email role enrollment")
    .sort({ category: 1, createdAt: -1 });  // fixed

  res.status(200).json(
    new ApiResponse(
      200,
      complaints,
      "Complaints fetched and sorted by category"
    )
  );
});

export const getComplaintsCategoryWise = asynchandler(async (req, res) => {

  const complaints = await Complaint.find({
    collegeId: req.user.collegeId
  })
    .populate("createdBy", "name email enrollment role")
    .populate("assignedTo", "name email role enrollment")
    .sort({ category: 1, createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      complaints,
      "Complaints fetched category-wise sorted"
    )
  );
});
