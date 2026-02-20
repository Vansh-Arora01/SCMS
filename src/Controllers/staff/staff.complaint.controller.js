import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import { ApiError } from "../../Utils/apierror.js";
import { Complaint } from "../../Models/Complain.model.js";
import { changeComplaintStatus } from "../../services/complaint.service.js";
import { createNotification } from "../../services/notification.service.js";




export const getAssignedComplaints = asynchandler(async (req, res) => {
  const complaints = await Complaint.find(
    {
      assignedTo: req.user._id,
      collegeId: req.user.collegeId
    },
    {
      title: 1,
      description: 1,
      category: 1,
      status: 1,
      priority: 1,
      assignedAt: 1,
      resolutionNote: 1,
      attachments: 1,  
      createdAt: 1
    }
  ).populate("createdBy", "name email");

  res.status(200).json(
    new ApiResponse(200, complaints, "Assigned complaints fetched")
  );
});


export const getAssignedComplaintById = asynchandler(async (req, res) => {
  const complaint = await Complaint.findOne({
    _id: req.params.id,
    assignedTo: req.user._id,
    collegeId: req.user.collegeId
  },
  {
      title: 1,
      description: 1,
      category: 1,
      status: 1,
      priority: 1,
      assignedAt: 1,
      resolutionNote: 1,
      attachments: 1,  
      createdAt: 1
    }
).populate("createdBy", "name email");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found or not assigned to you");
  }

  res.status(200).json(
    new ApiResponse(200, complaint, "Complaint fetched successfully")
  );
});


export const updateAssignedComplaintStatus = asynchandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // 🔐 SAFE college comparison (ObjectId or string both handled)
  const complaintCollege = String(complaint.collegeId);
  const userCollege = String(req.user?.collegeId);

  console.log("Complaint college:", complaintCollege);
  console.log("User college:", userCollege);

  if (!complaintCollege || !userCollege || complaintCollege !== userCollege) {
    throw new ApiError(403, "Unauthorized");
  }

  const updatedComplaint = await changeComplaintStatus({
    complaintId: req.params.id,
    status: req.body.status,
    resolutionNote: req.body.resolutionNote,
    user: req.user
  });

  // 🔔 Notify complaint owner
  await createNotification({
    userId: complaint.createdBy,   // correct owner field
    role: "USER",
    title: "Complaint Status Updated",
    message: `Your complaint is now ${req.body.status}`,
    complaintId: complaint._id
  });

  res.status(200).json(
    new ApiResponse(200, updatedComplaint, "Complaint status updated")
  );
});


// profileone
export const getStaffProfile = asynchandler(async (req, res) => {
  if (req.user.role !== "STAFF") {
    throw new ApiError(403, "Staff only");
  }

  res.status(200).json(
    new ApiResponse(200, {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      collegeId: req.user.collegeId,
      createdAt: req.user.createdAt
    }, "Staff profile fetched successfully")
  );
});


// optional vala request vala dal rha ho check kr lete ha 
export const requestReassignment = asynchandler(async (req, res) => {
  const { reason } = req.body;

  const complaint = await Complaint.findOne({
    _id: req.params.id,
    assignedTo: req.user._id
  });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.reassignmentRequested = true;
  complaint.reassignmentReason = reason || "No reason provided";

  await complaint.save();

  res.status(200).json(
    new ApiResponse(200, null, "Reassignment request sent to admin")
  );
});
