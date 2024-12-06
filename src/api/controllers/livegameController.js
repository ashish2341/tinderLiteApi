const constants = require("../../helper/constants");
const LiveGame = require("../../models/livegameModel");
const User = require("../../models/userModel");
const axios = require("axios");
const cloudinary = require('cloudinary').v2;
require("dotenv").config();

const DYTE_API_KEY = process.env.DYTE_API_KEY;
const DYTE_ORG_ID = process.env.DYTE_ORG_ID;

const API_HASH = Buffer.from(
  `${DYTE_ORG_ID}:${DYTE_API_KEY}`,
  "utf-8"
).toString("base64");

const DyteAPI = axios.create({
  baseURL: "https://api.dyte.io/v2",
  headers: {
    Authorization: `Basic ${API_HASH}`,
  },
});

cloudinary.config({
  cloud_name: "dxjyglb16",
  api_key: "731694561994395",
  api_secret: "JevKs_V4azMgBJC0la5bIWJHcZU",
});

// console.log("DyteAPI", DyteAPI);
// console.log("API_HASH", API_HASH);

exports.addUserInMeeting = async (req, res) => {
  try {
    const { userId, gameId } = req.body;

    let liveGame = await LiveGame.findOne({ gameId });
    const user = await User.findById(userId);

    if (!liveGame) {
      return res.status(404).json({ error: "LiveGame not found" });
    }

    let meeting = liveGame.meetings.find((m) => m.participants.length < 2);

    if (!meeting) {
      const createMeetingResponse = await DyteAPI.post("/meetings", {
        title: "Tinder Lite App",
      });

      //console.log('Dyte create meeting response:', createMeetingResponse.data);

      if (!createMeetingResponse.data.success) {
        return res
          .status(createMeetingResponse.status)
          .json({ error: "Failed to create a new Dyte meeting" });
      }
      //bbb057a6-15a5-4ae8-93de-15adec89156e

      const newMeeting = createMeetingResponse.data.data;
      //console.log("newMeeting.id", newMeeting.id);

      meeting = {
        meetingId: newMeeting.id,
        participants: [],
      };

      liveGame.meetings.push(meeting);
    }

    // let name = "Mary Sue";
    // let picture = "https://i.imgur.com/test.jpg";
    // let preset_name = "livestream_viewer";
    // let custom_participant_id = "string";
    // console.log(meeting.meetingId);
    // const dyteResponse = await DyteAPI.post(
    //   `/meetings/${meeting.meetingId}/participants`,
    //   {
    //     name,
    //     picture,
    //     preset_name,
    //     custom_participant_id,
    //   }
    // );

    // console.log("Dyte add participant response:", dyteResponse.data);

    // if (!dyteResponse.data.success) {
    //   return res
    //     .status(dyteResponse.status)
    //     .json({ error: "Failed to add user to the Dyte meeting" });
    // }

    meeting.participants.push({ userId, name: user.user_name });
    liveGame.updatedAt = Date.now();

    await liveGame.save();

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      meetingId: meeting.meetingId,
      data: liveGame,
      success: true,
      message: "User added to the meeting successfully",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.createLiveGame = async (req, res) => {
  try {
    const { gameId, gameName } = req.body;

    const newLiveGame = new LiveGame({
      gameId,
      gameName,
      meetings: [],
    });

    await newLiveGame.save();

    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: newLiveGame, success: true, message: "Game created successfully..!" });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getAllGames = async (req, res) => {
  try {

    const liveGame = await LiveGame.find()

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: liveGame,
      success: true,
      message: "Games fetched successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const gameId = req.params.id;

    const liveGame = await LiveGame.findById(gameId);

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: liveGame,
      success: true,
      message: "Game fetched successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.leftParticipant = async (req, res) => {
  try {
    const { participant, meeting } = req.body;

    const liveGame = await LiveGame.findOne({ "meetings.meetingId": meeting.id });

    if (!liveGame) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const miting = liveGame.meetings.find(
      (m) => m.meetingId === meeting.id
    );

    if (!miting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const participantIndex = miting.participants.findIndex(
      (p) => p.name === participant.userDisplayName
    );

    if (participantIndex === -1) {
      return res.status(404).json({ error: "Participant not found in the meeting" });
    }

    miting.participants.splice(participantIndex, 1);

    await liveGame.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Participant removed successfully",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.updateLiveGame = async (req, res) => {
  try {
    const { gameId } = req.params; 
    const {
      gameName,
      levels,
      game_description,
      how_to_play,
      rules,
      top_players,
      challenges,
      live_game_details,
      teams,
      locked,
      genre
    } = req.body;

    const updateFields = {
      ...(gameName && { gameName }),
      ...(levels && { levels }),
      ...(game_description && { game_description }),
      ...(how_to_play && { how_to_play }),
      ...(rules && { rules }),
      ...(top_players && { top_players }),
      ...(challenges && { challenges }),
      ...(live_game_details && { live_game_details }),
      ...(teams && { teams }),
      ...(locked !== undefined && { locked }),
      ...(genre && { genre }),
      updatedAt: Date.now(),
    };

    if (req.files && req.files.game_images) {
      const gameImages = Array.isArray(req.files.game_images)
        ? req.files.game_images
        : [req.files.game_images];

      const uploadedImages = await Promise.all(
        gameImages.map(async (file) => {
          const uploadResponse = await cloudinary.uploader.upload(file.tempFilePath);
          return uploadResponse.secure_url;
        })
      );
      updateFields.game_images = uploadedImages;
    }

    if (req.files && req.files.game_bg_image) {
      const bgImage = req.files.game_bg_image;
      const uploadResponse = await cloudinary.uploader.upload(bgImage.tempFilePath);
      updateFields.game_bg_image = uploadResponse.secure_url;
    }

    const updatedGame = await LiveGame.findOneAndUpdate({ gameId }, updateFields, { new: true });

    if (!updatedGame) {
      return res.status(constants.status_code.header.server_error).send({
        statusCode: constants.status_code.header.server_error,
        success: false,
        message: 'Live game not found.',
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: constants.status_code.header.ok,
      success: true,
      message: 'Live game updated successfully.',
      data: updatedGame,
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ 
        statusCode: constants.status_code.header.server_error, 
        error: error.message, 
        success: false 
      });
  }
};
