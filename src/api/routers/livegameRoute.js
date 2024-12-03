const express = require("express");

const router = express.Router();

const {
  addUserInMeeting,
  createLiveGame,
  leftParticipant,
  getAllGames,
  getGameById,
  updateLiveGame
} = require("../controllers/livegameController");

router.post("/addUserToGame", addUserInMeeting);
router.post("/createLiveGame", createLiveGame);
router.get("/getAllGames", getAllGames);
router.get("/getGameById/:id", getGameById);
router.post("/leftParticipant", leftParticipant);
router.put("/updateLiveGame/:gameId", updateLiveGame);

module.exports = router;
