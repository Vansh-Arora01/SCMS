import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import { Complaint } from "../../Models/Complain.model.js";
import { User } from "../../Models/User.model.js";

export const getAdminDashboardStats = asynchandler(async (req, res) => {

  const collegeId = req.user.collegeId;

  const totalComplaints = await Complaint.countDocuments({
    collegeId
  });

  const resolvedComplaints = await Complaint.countDocuments({
    collegeId,
    status: "RESOLVED"
  });

  const pendingComplaints = await Complaint.countDocuments({
    collegeId,
    status: { $nin: ["RESOLVED", "REJECTED"] }
  });

  const unassignedComplaints = await Complaint.countDocuments({
    collegeId,
    status: "OPEN",
    $or: [
      { assignedTo: null },
      { assignedTo: { $exists: false } }
    ]
  });

  const totalStaff = await User.countDocuments({
    role: "STAFF",
    collegeId
  });
  const complaintsByCategory = await Complaint.aggregate([
    {
     $match: { collegeId: req.user.collegeId }
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        unassignedComplaints,
        totalStaff,
        complaintsByCategory
      },
      "Admin dashboard stats fetched"
    )
  );
});