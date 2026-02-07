import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true
    }
  },
  { timestamps: true }
);

// One user can vote only once per complaint
voteSchema.index({ userId: 1, complaintId: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);
