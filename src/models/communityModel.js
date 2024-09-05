var mongoose = require('mongoose')

var communitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", }, 
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('community',communitySchema)