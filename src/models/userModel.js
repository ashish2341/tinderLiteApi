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
  BFFs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  scoreboard: { type: Number, default: 0 },
  interest_in_gender: { type: String },
  follows: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  token: { type: String },
  whatsappNotify: { type: Boolean },
  interests: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  wallet: walletSchema,
  instaUrl: { type: String },
  twitterUrl: { type: String },
  occupation: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
