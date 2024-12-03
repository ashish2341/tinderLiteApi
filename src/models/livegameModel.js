const mongoose = require("mongoose");

const liveGameSchema = new mongoose.Schema({
  gameId: { type: String },
  gameName: { type: String, required: true },
  levels: { type: Number },
  game_images: [{ type: String }],
  game_description: { type: String },
  how_to_play: [String],
  rules: [String],
  top_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  challenges: [{ type: String }],
  live_game_details: {
    teams_details: [{ type: String }],
    game_metadata: mongoose.Schema.Types.Mixed
  },
  teams: [
    {
      team_name: { type: String },
      team_members: [
        {
          member_name: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          in_time: { type: Date },
          out_time: { type: Date },
          role: { type: String },
          status: { type: String },
          turns: { type: Number }
        }
      ],
      subtitle: { type: String },
      created_at: { type: Date, default: Date.now },
      image: { type: String }
    }
  ],
  game_bg_image: { type: String },
  locked: { type: Boolean, default: true },
  genre: { type: String },
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
