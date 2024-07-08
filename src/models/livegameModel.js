const mongoose = require("mongoose");

const liveGameSchema = new mongoose.Schema({
  gameId: { type: String },
  gameName: { type: String, required: true },
  meetings: [
    {
      meetingId: { type: String },
      participants: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          name: { type: String },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LiveGame", liveGameSchema);
