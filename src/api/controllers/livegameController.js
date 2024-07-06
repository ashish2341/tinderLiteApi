const constants = require("../../helper/constants");
const LiveGame = require("../../models/livegameModel");
const axios = require("axios");
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

// console.log("DyteAPI", DyteAPI);
// console.log("API_HASH", API_HASH);

exports.addUserInMeeting = async (req, res) => {
  try {
    const { userId, gameId } = req.body;

    let liveGame = await LiveGame.findOne({ gameId });

    if (!liveGame) {
      return res.status(404).json({ error: "LiveGame not found" });
    }

    let meeting = liveGame.meetings.find((m) => m.participants.length < 2);

    if (!meeting) {
      const createMeetingResponse = await DyteAPI.post('/meetings', {
        title: "Tinder Lite App"
      });

      //console.log('Dyte create meeting response:', createMeetingResponse.data);

      if (!createMeetingResponse.data.success) {
        return res
          .status(createMeetingResponse.status)
          .json({ error: 'Failed to create a new Dyte meeting' });
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
    
        let name = "Mary Sue";
        let picture = "https://i.imgur.com/test.jpg";
        let preset_name = "livestream_viewer";
        let custom_participant_id = "string";
        console.log(meeting.meetingId);
    const dyteResponse = await DyteAPI.post(
      `/meetings/${meeting.meetingId}/participants`,
      {
        name,
        picture,
        preset_name,
        custom_participant_id
      }
    );

    console.log('Dyte add participant response:', dyteResponse.data);

    if (!dyteResponse.data.success) {
      return res
        .status(dyteResponse.status)
        .json({ error: 'Failed to add user to the Dyte meeting' });
    }

    meeting.participants.push(userId);

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
        meetings: []
      });
  
      await newLiveGame.save();
      res.status(201).json(newLiveGame);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };