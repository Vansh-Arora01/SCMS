import mongoose from "mongoose";

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
      type: String,
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
    complaintNumber: {
  type: String,
  unique: true,
  index: true
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
complaintSchema.pre("save", async function (next) {
  if (!this.complaintNumber) {
    const count = await mongoose.model("Complaint").countDocuments();
    this.complaintNumber = `SCMS-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
  }
  // next();
});
export const Complaint = mongoose.model("Complaint", complaintSchema);
