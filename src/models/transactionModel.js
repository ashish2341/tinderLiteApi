const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  amount: { type: Number },
  time: { type: Date, default: Date.now },
  how: { type: String },
  in_out: { type: String, enum: ["Debit", "Credit"] },
  transaction_type: { type: String },
  payment_method: { type: String },
  status: { type: String },
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model("Transaction", transactionSchema);
