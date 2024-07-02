const mongoose = require('mongoose')
 
const userSchema = mongoose.Schema({
    FirstName: {
        type: String,
        required: true,
        trim: true
    },
    LastName: {
        type: String,
        trim: true
    },
    Age: Number,
    Gender: {
        type: String,
        enum: ['Male', "Female", "Other"]
    },
    Mobile: {
        type: String,
        required: true,
        unique:true,
    },
    Phone: String,
    Area: String,
    City: String,
    State: String,
    Country: String,
    PinCode: String,
    Roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
    }],

    IsEnabled: {
        type: Boolean,
        default: true
    },
    CreatedDate: {
        type: Date,
        default: Date.now()
    },
    UpdatedDate: {
        type: Date,
        default: Date.now()
    },
    IsDeleted: {
        type: Boolean,
        default: false
    },
    IsEnquiryVisiable: {
        type: Boolean,
        default: false
    },
    CreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    UpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    ProfilePhoto: String,

    EmailId: {
        type: String,
        required: true,
        lowercase: true,
        unique:true,
    },

},)

const User = mongoose.model('User', userSchema)

module.exports = User