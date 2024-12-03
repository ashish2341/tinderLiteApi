const mongoose = require("mongoose");
const walletSchema = require("./walletModel").schema;

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  user_name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  profile_image: { type: String },
  deactiveAccount: {
    type: Boolean,
    default: false,
  },
  blockByAdmin: {
    type: Boolean,
    default: false
  },
  dob: { type: String },
  bio: { type: String },
  userType: { type: String, enum:["Player","Coach"],default:"Player" },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  relationship_status: { type: String },
  BFFs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  recentPlayGames:[{ type: mongoose.Schema.Types.ObjectId, ref: "LiveGame" }],
  scoreboard: {
    rank_level: {
      rank: { type: Number, default: 0 },
      rank_title: { type: String, default: "" },
      achievements: [{
        volume: { type: Number, default: 0 },
        type: { type: String, default: "" }
      }]
    },
    points: { type: Number, default: 0 },
    points_history: [{
      points: { type: Number, default: 0 },
      date: { type: Date, default: Date.now }
    }],
    user_progress: { type: Number, default: 0 },
    win_rate: { type: Number, default: 0 }
  },
  interest_in_gender: { type: String },
  // follows: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeProfile: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
    city: { type: String }
  },
  token: { type: String },
  fcmToken: { type: String },
  whatsappNotify: { type: Boolean },
  interests: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  wallet: [walletSchema],
  favourite_games: [{ type: mongoose.Schema.Types.ObjectId, ref: "LiveGame" }],
  social_links: [{
    url: { type: String },
    app_name: { type: String }
  }],
  occupation: { type: String },
  specialization: { type: String },
  experience: { type: Number, default: 0 },
  client_reviews: [{ type: String }],
  availability: { type: String },
  pricing: { type: Number },
  unlocked_games: [{ type: mongoose.Schema.Types.ObjectId, ref: "LiveGame" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
