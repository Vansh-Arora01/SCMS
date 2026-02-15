import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import { ApiError } from "../../Utils/apierror.js";
import { Complaint } from "../../Models/Complain.model.js";
import { changeComplaintStatus } from "../../services/complaint.service.js";
import { createNotification } from "../../services/notification.service.js";

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

  const { assignedTo } = req.body;

  const staff = await User.findById(assignedTo);

  if (!staff || staff.role !== "STAFF") {
    throw new ApiError(400, "Invalid staff");
  }

  if (staff.collegeId !== req.user.collegeId) {
    throw new ApiError(403, "Staff not in same college");
  }

  const complaint = await changeComplaintStatus({
    complaintId: req.params.id,
    status: "ASSIGNED",
    assignedTo,
    user: req.user
  });

  await createNotification({
    userId: assignedTo,
    role: "STAFF",
    title: "New Complaint Assigned",
    message: `Complaint #${complaint.complaintNumber} assigned to you`,
    complaintId: complaint._id
  });

  res.status(200).json(
    new ApiResponse(200, complaint, "Complaint assigned successfully")
  );
});



// reassigning 

export const reassignComplaint = asynchandler(async (req, res) => {
  const { assignedTo } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (complaint.collegeId !== req.user.collegeId) {
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



//one more sorted view one 
export const getComplaintsSortedByDepartment = asynchandler(async (req, res) => {
  const complaints = await Complaint.find(
    { collegeId: req.user.collegeId },
    {
      title: 1,
      description: 1,
      category: 1,   // ✅ fixed
      status: 1,
      priority: 1,
      assignedTo: 1,
      createdAt: 1
    }
  )
    .populate("createdBy", "name email enrollment")
    .populate("assignedTo", "name email role enrollment")
    .sort({ category: 1, createdAt: -1 });  // ✅ fixed

  res.status(200).json(
    new ApiResponse(
      200,
      complaints,
      "Complaints fetched and sorted by category"
    )
  );
});

