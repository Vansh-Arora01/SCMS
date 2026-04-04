import mongoose from "mongoose";
const calculatePriority = (voteCount) => {
  if (voteCount > 10) return "critical";
  if (voteCount > 5) return "high";
  if (voteCount > 2) return "medium";
  return "low";
};

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5
    },

    description: {
      type: String,
      required: true,
      minlength: 10
    },

    category: {
      type: String,
      enum: ["INFRASTRUCTURE", "HOSTEL", "ACADEMIC", "OTHER"],
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS","ASSIGNED", "RESOLVED", "REJECTED", "ESCALATED"],
      default: "OPEN",
      index: true
    },

    assignedTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

assignedAt: {
  type: Date
},


    /**
     * System-driven priority score
     * NOT editable by admin
     */
    priorityScore: {
      type: Number,
      default: 0,
      index: true
    },


  priority: {
  type: String,
  enum: ["low", "medium", "high", "critical"],
  default: "low"
},

    /**
     * Anonymous complaint support
     */
    isAnonymous: {
      type: Boolean,
      default: false
    },

    /**
     * Nullable to allow anonymous complaints
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    /**
     * Tenant isolation (SaaS core)
     */
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true
    },

    /**
     * Voting system support
     */
    voteCount: {
      type: Number,
      default: 0
    },
    eligibleforVote:{
      type:Boolean,
      default:false
    },

    /**
     * Media attachments (Phase 5 ready)
     */
    attachments: [
      {
        url: {
          type: String,
          required: true
        },
        fileType: {
          type: String,
          enum: ["IMAGE", "PDF", "OTHER"]
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    // OR KUCH BHI BDA RHA HO JISSE STAFF REQUEST KR SKE RE ASSIGNING KI 
    reassignmentRequested:{
      type:Boolean,
      default:false

    },
    reassignmentReason:{
      type:String
    },
    // 🔁 Reassignment System (Production Level)
reassignmentRequested: {
  type: Boolean,
  default: false
},

reassignmentReason: {
  type: String
},

reassignmentStatus: {
  type: String,
  enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
  default: "NONE",
  index: true
},

reassignmentRequestedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

reassignmentHandledBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

reassignmentRequestedAt: {
  type: Date
},

reassignmentHandledAt: {
  type: Date
},

previousAssignedTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

    complaintNumber: {
  type: String,
  unique: true,
  index: true
},

escalatedAt: {
  type: Date
},
    /**
     * Admin resolution note (optional)
     */
    resolutionNote: {
      type: String,
      trim: true
    }
  },
  
  
  { timestamps: true }
);


complaintSchema.pre("save", async function () {
  if (!this.complaintNumber) {
    const count = await mongoose.model("Complaint").countDocuments();
    this.complaintNumber = `SCMS-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
  }

  this.priority = calculatePriority(this.voteCount);
});

export const Complaint = mongoose.model("Complaint", complaintSchema);
