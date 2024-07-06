const express = require("express");

const router = express.Router();

const { addUserInMeeting, createLiveGame } = require("../controllers/livegameController")

router.post('/addUserToGame', addUserInMeeting);
router.post('/createLiveGame', createLiveGame);

module.exports = router;