const User = require("../../models/userModel");
const constants = require("../../helper/constants");
const Chats = require("../../models/chatsModel");

exports.getChats = async function (req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    const username = user.user_name;

    
    const groupedChats = await Chats.aggregate([
      {
        $match: {
          $or: [
            { sender: username },
            { target: username },
          ]
        }
      },
      {
        $sort: { timestamp: -1 } 
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", username] },
              then: "$target",
              else: "$sender"
            }
          },
          latestMessage: { $first: "$$ROOT" } 
        },
      },
      {
        $lookup: {
          from: "users", 
          localField: "_id",
          foreignField: "user_name",
          as: "targetInfo"
        }
      },
      {
        $project: {
          _id: 0,
          targetInfo: { $arrayElemAt: ["$targetInfo", 0] },
          latestMessage: 1
        }
      },
      {
        $sort: { "latestMessage.timestamp": -1 } 
      }
    ]);

    //console.log(groupedChats);
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: groupedChats, success: true, message: "Grouped chats for the whole conversation with target information" });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
