
export const checkComplaintCollege = (complaint, user) => {
  return complaint.collegeId?.toString() === user.collegeId?.toString();
};
export const validateStatusTransition = (currentStatus, newStatus) => {
  const transitions = {
    OPEN: ["ASSIGNED", "IN_PROGRESS", "ESCALATED"],
    ASSIGNED: ["IN_PROGRESS", "ESCALATED"],
    IN_PROGRESS: ["RESOLVED", "ESCALATED"],
    RESOLVED: [],
    REJECTED: [],
    ESCALATED: []
  };

  return transitions[currentStatus]?.includes(newStatus);
};
