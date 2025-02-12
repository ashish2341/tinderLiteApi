const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/role");

const {
  deleteAllChats,
  deleteChat,
  getAllChats,
  getRecentChats,
  sendMessage,
  getAllChatListByUserId
} = require("../controllers/chatsController");

router.post("/sendMessage", verifyToken, sendMessage);
router.get("/getAllChats/:targetId", verifyToken, getAllChats);
router.delete("/deleteChat/:chatId", verifyToken, deleteChat);
router.get("/getRecentChats", verifyToken, getRecentChats);
router.get("/getAllChatList", verifyToken, getAllChatListByUserId);
router.delete("/deleteAllChats", verifyToken, deleteAllChats);

module.exports = router;
