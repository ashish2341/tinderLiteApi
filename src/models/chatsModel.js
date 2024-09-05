var mongoose = require('mongoose')

var chatSchema = new mongoose.Schema({
        content: {type:String},
        sender: {type:String},
        target: {type:String},
        chatName:{type:String},
        timestamp:{ type: Date, default: Date.now }
})

module.exports = mongoose.model('chats',chatSchema)