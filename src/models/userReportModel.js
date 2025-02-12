const mongoose = require("mongoose");
const userReportSchema = new mongoose.Schema(
  {
    reportedOn: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    whoReported: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportDescription: {
      type: String,
      required: true,
    },
    status: String,
    reportDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserReport", userReportSchema);
