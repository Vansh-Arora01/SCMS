import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import {ApiError} from "../Utils/apierror.js";
import {User} from "../Models/User.model.js"
import { Complaint } from "../Models/Complain.model.js";
import {validateStatusTransition} from "../Middlewares/complaint.middleware.js"

export const changeComplaintStatus = async ({
  complaintId,
  status,
  resolutionNote,
  assignedTo,
  user
}) => {
  const complaint = await Complaint.findById(complaintId)
    .populate("createdBy", "name email");

  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (complaint.collegeId !== user.collegeId)
    throw new ApiError(403, "Unauthorized");

  if (["RESOLVED", "REJECTED"].includes(complaint.status))
    throw new ApiError(400, "Complaint already closed");

  const isValidTransition = validateStatusTransition(
    complaint.status,
    status
  );

  if (!isValidTransition)
    throw new ApiError(400, "Invalid status transition");

  // Assignment logic
  if (status === "ASSIGNED") {
    if (!assignedTo)
      throw new ApiError(400, "assignedTo required");

    const assignee = await User.findById(assignedTo);
    if (!assignee || !["ADMIN", "STAFF"].includes(assignee.role))
      throw new ApiError(400, "Invalid assignee");

    complaint.assignedTo = assignedTo;
    complaint.assignedAt = new Date();
  }

  complaint.status = status;

  if (resolutionNote) {
    complaint.resolutionNote = resolutionNote;
  }

  await complaint.save();

  // Email trigger (single source of truth)
  const emailEvents = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "ESCALATED"];

  if (emailEvents.includes(status) && complaint.createdBy) {
    await sendEmail({
      email: complaint.createdBy.email,
      subject: `Complaint ${status}`,
      mailgenContent: complaintLifecycleMailgenContent({
        username: complaint.createdBy.username,
        complaintId: complaint._id,
        event: status,
        remarks: resolutionNote || ""
      })
    });
  }

  return complaint;
};
