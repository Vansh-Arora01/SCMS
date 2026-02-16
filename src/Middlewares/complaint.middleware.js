export const validateStatusTransition = (currentStatus, newStatus) => {
  const transitions = {
    OPEN: ["IN_PROGRESS", "ESCALATED"],
    IN_PROGRESS: ["RESOLVED", "ESCALATED"],
    RESOLVED: [],
    REJECTED: [],
    ESCALATED: []
  };

  return transitions[currentStatus]?.includes(newStatus);
};
export const checkComplaintCollege = (complaint, user) => {
  return complaint.collegeId?.toString() === user.collegeId?.toString();
};
