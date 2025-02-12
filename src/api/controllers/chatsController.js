const User = require("../../models/userModel");
const constants = require("../../helper/constants");
const Chats = require("../../models/chatsModel");
const mongoose = require("mongoose");

exports.getChats = async function (req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    const username = user.user_name;

    const groupedChats = await Chats.aggregate([
      {
        $match: {
          $or: [{ sender: username }, { target: username }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", username] },
              then: "$target",
              else: "$sender",
            },
          },
          latestMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "user_name",
          as: "targetInfo",
        },
      },
      {
        $project: {
          _id: 0,
          targetInfo: { $arrayElemAt: ["$targetInfo", 0] },
          latestMessage: 1,
        },
      },
      {
        $sort: { "latestMessage.timestamp": -1 },
      },
    ]);

    //console.log(groupedChats);
    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: groupedChats,
      success: true,
      message:
        "Grouped chats for the whole conversation with target information",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, target, chatName } = req.body;
    const sender =  req.user.userId;

    const newChat = new Chats({
      content,
      sender,
      target,
      chatName,
    });

    await newChat.save();

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: newChat,
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getAllChats = async (req, res) => {
  try {
    const { targetId } = req.params;
    const userId = req.user.userId;

    const chats = await Chats.find({
      $or: [
        { sender: userId, target: targetId },
        { sender: targetId, target: userId },
      ],
    }).sort({ createdAt: -1 });

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: chats,
      success: true,
      message: "Chats fetched successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getAllChatListByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("user",userId);

    const chats = await Chats.aggregate([
      {
        $match: {
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { target: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderDetails"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "target",
          foreignField: "_id",
          as: "targetDetails"
        }
      },
      { $unwind: "$senderDetails" },
      { $unwind: "$targetDetails" },
      {
        $project: {
          _id: 1,
          chatName: 1,
          content: 1,
          createdAt: 1,
          sender: {
            _id: "$senderDetails._id",
            full_name: "$senderDetails.full_name",
            user_name: "$senderDetails.user_name",
            // profile_image: "$senderDetails.profile_image"
          },
          target: {
            _id: "$targetDetails._id",
            full_name: "$targetDetails.full_name",
            user_name: "$targetDetails.user_name",
            // profile_image: "$targetDetails.profile_image"
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: chats,
      success: true,
      message: "Chat list fetched successfully.",
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      error: error.message,
      success: false,
    });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chats.findByIdAndDelete(chatId);

    if (!chat) {
      return res.status(constants.status_code.header.not_found).send({
        statusCode: 404,
        success: false,
        message: "Chat not found.",
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getRecentChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const recentChats = await Chats.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { target: userId }],
        },
      },
      {
        $group: {
          _id: { chatName: "$chatName" },
          lastMessage: { $last: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: recentChats,
      success: true,
      message: "Recent chats fetched successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.deleteAllChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Chats.deleteMany({ $or: [{ sender: userId }, { target: userId }] });

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "All chats of user deleted successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
