const complaintLifecycleMailgenContent = ({
  username,
  complaint,
  event
}) => {

  const eventMessages = {
    REGISTERED: {
      intro: "Your complaint has been successfully registered in the system.",
      subject: "Complaint Registered Successfully"
    },
    ASSIGNED: {
      intro: "Your complaint has been assigned to a staff member for review.",
      subject: "Complaint Assigned"
    },
    IN_PROGRESS: {
      intro: "Your complaint is currently being worked on by our team.",
      subject: "Complaint In Progress"
    },
    ESCALATED: {
      intro: "Your complaint has been escalated due to high priority or demand.",
      subject: "Complaint Escalated"
    },
    RESOLVED: {
      intro: "Good news! Your complaint has been successfully resolved.",
      subject: "Complaint Resolved"
    },
    REJECTED: {
      intro: "Your complaint has been closed after administrative review.",
      subject: "Complaint Closed"
    }
  };

  const current = eventMessages[event];

  const addField = (label, value) =>
    value !== undefined && value !== null && value !== ""
      ? { key: label, value }
      : null;

  return {
    subject: `${current.subject} | ${complaint.complaintNumber || ""}`,
    body: {
      name: username,
      intro: current.intro,
      table: {
        data: [
          addField("Complaint Number", complaint.complaintNumber),
          addField("Title", complaint.title),
          addField("Category", complaint.category),
          addField("Status", complaint.status),
          // addField("Priority", complaint.priority),
          // addField("Priority Score", complaint.priorityScore),
          addField("Assigned To", complaint.assignedTo?.name),
          addField("Total Votes", complaint.voteCount),
          addField("College", complaint.collegeId?.name || "Not Available"),
          addField("Resolution Note", complaint.resolutionNote),
          addField(
            "Created On",
            complaint.createdAt
              ? new Date(complaint.createdAt).toLocaleString()
              : null
          )
        ].filter(Boolean)
      },
      outro: "You can track your complaint status anytime from your SCMS dashboard."
    }
  };
};

export { complaintLifecycleMailgenContent };