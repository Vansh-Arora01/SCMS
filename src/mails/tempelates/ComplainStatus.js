const complaintLifecycleMailgenContent = ({
  username,
  complaintId,
  event,
  department,
  assignedTo,
  remarks
}) => {

  const eventMessages = {
    REGISTERED: {
      intro: "Your complaint has been successfully registered.",
      subject: "Complaint Registered"
    },
    ASSIGNED: {
      intro: "Your complaint has been assigned to a department.",
      subject: "Complaint Assigned"
    },
    IN_PROGRESS: {
      intro: "Your complaint is currently being worked on.",
      subject: "Complaint In Progress"
    },
    ESCALATED: {
      intro: "Your complaint has been escalated for higher priority.",
      subject: "Complaint Escalated"
    },
    RESOLVED: {
      intro: "Your complaint has been successfully resolved.",
      subject: "Complaint Resolved"
    },
    REJECTED: {
      intro: "Your complaint has been closed after review.",
      subject: "Complaint Closed"
    }
  }

  const current = eventMessages[event]

  return {
    subject: current.subject,
    body: {
      name: username,
      intro: current.intro,
      table: {
        data: [
          { key: "Complaint ID", value: complaintId },
          department && { key: "Department", value: department },
          assignedTo && { key: "Assigned To", value: assignedTo },
          remarks && { key: "Remarks", value: remarks }
        ].filter(Boolean)
      },
      outro: "Thank you for using the SCMS platform."
    }
  }
}

export { complaintLifecycleMailgenContent }
