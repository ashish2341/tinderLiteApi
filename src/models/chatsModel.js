var mongoose = require("mongoose");

var chatSchema = new mongoose.Schema(
  {
    content: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    target: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chatName: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("chats", chatSchema);
