const mongoose = require("mongoose");
const transactionSchema = require("./transactionModel");

const walletSchema = new mongoose.Schema({
  available_amount: { type: Number },
  history: [transactionSchema.schema],
  currency: {
    name: { type: String },
    sign: { type: String }
  }
});

module.exports = mongoose.model("Wallet", walletSchema);
