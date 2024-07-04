const User = require("../../models/userModel");

exports.updateUser = async function (userId, updateData) {
    try {
        const user = await User.findByIdAndUpdate(userId,updateData,{new:true});
        if (!user) {
            throw new Error(`User with ID '${userId}' not found.`);
        }
        return user

    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};