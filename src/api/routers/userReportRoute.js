const express = require("express");

const router = express.Router();

const {
  createReport, deleteReport, getAllReports, getReportById, updateReportStatus
} = require("../controllers/userReportController");

router.post("/createReport", createReport);
// router.post("/createLiveGame", createLiveGame);
// router.get("/getAllGames", getAllGames);
// router.get("/getGameById/:id", getGameById);
// router.post("/leftParticipant", leftParticipant);
// router.put("/updateLiveGame/:gameId", updateLiveGame);

module.exports = router;
