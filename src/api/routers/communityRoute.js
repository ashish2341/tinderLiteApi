const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/role");

const {
  getCommunitiesByToken
} = require("../controllers/communityController");

router.get("/getCommunitiesByToken", verifyToken, getCommunitiesByToken);

module.exports = router;
