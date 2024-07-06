const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: { type: String, required: true },
  expireDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  creationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Coupon", couponSchema);
