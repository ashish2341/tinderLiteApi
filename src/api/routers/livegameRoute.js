const express = require("express");

const router = express.Router();

const { addUserInMeeting, createLiveGame, leftParticipant } = require("../controllers/livegameController")

router.post('/addUserToGame', addUserInMeeting);
router.post('/createLiveGame', createLiveGame);
router.post('/leftParticipant', leftParticipant);

module.exports = router;