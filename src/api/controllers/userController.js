const constants = require("../../helper/constants");
const User = require("../../models/userModel");
const LiveGame = require("../../models/livegameModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../helper/config");
const moment = require("moment");
const UserService = require("../services/userService");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const cloudinary = require('cloudinary').v2;
const Chat = require("../../models/chatsModel");
//import httpStatus from "http-status";
cloudinary.config({
  cloud_name: "dxjyglb16",
  api_key: "731694561994395",
  api_secret: "JevKs_V4azMgBJC0la5bIWJHcZU",
});

exports.addUser = async (req, res) => {
  try {
    const { 
      full_name,
      user_name,
      email,
      phone,
      gender,
      dob,
    } = req.body;  

    let userData = new User({
      full_name: full_name,
      user_name: user_name,
      email: email,
      phone: phone,
      gender: gender,
      dob: dob
    });

    let payload = { userId: userData._id, phone: userData.phone };
    userData.token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "360000s",
    });

    let result = await userData.save();

    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: result, success: true, message: "signup success" });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phoneOremail } = req.body;
    //let password = req.body.password;
    //const match = await bcrypt.compare(password, userData.password)
    const userData = await User.findOne({
      $or: [{ phone: phoneOremail }, { email: phoneOremail }]
    });
    if (!userData) {
      throw new Error("User not found");
    } else if (userData.blockByAdmin == true) {
      throw new Error(
        "Your account has been suspended due to violation of community guidelines"
      );
    } else {
      let message = "Login Success";
      let payload = { userId: userData._id, phone: userData.phone };
      let token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "360000s",
      });
      //userData.logindata[userData.logindata.length] = loginData;
      const a = await userData.save();
      //userData.logindata[userData.logindata.length-1] = loginData;
      let updateUser = {
        token: token,
        deactiveAccount: false,
      };
      const userId = userData._id;
      const result = await UserService.updateUser(userId, updateUser);
      return res
        .status(constants.status_code.header.ok)
        .send({
          statusCode: 200,
          data: result,
          success: true,
          message: message,
        });
    }
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.loginUserData = async (req, res) => {
  try {
    let phone = req.user.phone;
    //const token = req.body.token;
    const userData = await User.findOne({ phone: phone });
    if (!userData) {
      throw { code: httpStatus.NOT_FOUND, message: "User not found" };
    }
    if (userData.blockByAdmin) {
      throw {
        code: httpStatus.FORBIDDEN,
        message:
          "Your account has been suspended due to violation of community guidelines",
      };
    }
    // if (token !== userData.token) {
    //   throw {
    //     code: httpStatus.UNAUTHORIZED,
    //     message: "You are already logged in on another device",
    //   };
    // }
    let message = "Current User Data";
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: userData,
        success: true,
        message: message,
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const pageNumber = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const search = req.query.search || '';
    const searchQuery = {
      deactiveAccount: false,
        $or: [
            { full_name: { $regex: search, $options: 'i' } }, 
        ]
    };
  
   if(req.query.type){
    searchQuery.userType = req.query.type
   }
    const users = await User.find(searchQuery)
      // .populate('Roles')
      .sort({ CreatedDate: -1 })
      .skip((pageNumber - 1) * size)
      .limit(size)
      ;

    const totalCount = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCount / size);

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: users,
      success: true,
      totalCount: totalCount>0 ? totalCount-1:totalCount,
      count: users.length,
      pageNumber: pageNumber,
      totalPages: totalPages,
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.updateUsers = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      full_name,
      user_name,
      email,
      phone,
      gender,
      dob,
      bio,
      whatsappNotify,
      BFFs,
      location,
      recentPlayGames,
      occupation,
      specialization,
      experience,
      client_reviews,
      availability,
      pricing,
      deactiveAccount,
      blockByAdmin,
      interest_in_gender
    } = req.body;

    const updateUser = {};

    if (user_name) {
      const existingUser = await User.findOne({ user_name, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: `Username ${user_name} already exists.` });
      }
      updateUser.user_name = user_name;
    }

    let profileImageUrl;
    if (req.files && req.files.profile_image) {
      const file = req.files.profile_image;
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath);
      profileImageUrl = uploadResult.secure_url;
      updateUser.profile_image = profileImageUrl;
    }

    if (full_name) updateUser.full_name = full_name;
    if (email) updateUser.email = email;
    if (phone) updateUser.phone = phone;
    if (gender) updateUser.gender = gender;
    if (dob) updateUser.dob = dob;
    if (bio) updateUser.bio = bio;
    if (whatsappNotify !== undefined) updateUser.whatsappNotify = whatsappNotify;
    if (occupation) updateUser.occupation = occupation;
    if (specialization) updateUser.specialization = specialization;
    if (experience) updateUser.experience = experience;
    if (client_reviews) updateUser.client_reviews = client_reviews;
    if (availability) updateUser.availability = availability;
    if (pricing) updateUser.pricing = pricing;
    if (BFFs) updateUser.BFFs = BFFs;
    if (deactiveAccount) updateUser.deactiveAccount = deactiveAccount;
    if (blockByAdmin) updateUser.blockByAdmin = blockByAdmin;
    if (interest_in_gender) updateUser.interest_in_gender = interest_in_gender;
    
    if (location && location.coordinates) {
      updateUser.location = {
        type: "Point",
        coordinates: location.coordinates,
        city: location.city
      };
    }

    let updateQuery = {};
    if (recentPlayGames && recentPlayGames.length > 0) {
      updateQuery = { $addToSet: { recentPlayGames: { $each: recentPlayGames } } };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { ...updateUser, ...updateQuery }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    //clear cache
    // if (cache.has(userId)) {
    //   cache.del(userId);
    // }
    let message = "User Updated Successfully";
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: updatedUser,
        success: true,
        message: message,
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getUserById = async (req, res) => {
  try {
    let userId = req.params.id;
    //const token = req.body.token;
    const userData = await User.findById(userId);
    
    // if (token !== userData.token) {
    //   throw {
    //     code: httpStatus.UNAUTHORIZED,
    //     message: "You are already logged in on another device",
    //   };
    // }
    let message = "Current User Data";
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: userData,
        success: true,
        message: message,
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.deleteUser = async function (req, res) {
  try {
    const userId = req.params.id;
    
    let result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: "User Not Deleted..!", success: false });
    }
    //clear cache
    // if (cache.has(userId)) {
    //   cache.del(userId);
    // }
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: {},
        success: true,
        message: "User deleted successfully",
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.nearbyUser = async function (req, res) {
  try {
    const { userId, maxDistance } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userLocation = user.location.coordinates;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: userLocation,
          },
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
        },
      },
      {
        $match: { _id: { $ne: userObjectId } },
      },
    ]);

    if (nearbyUsers.length === 0) {
      return res.status(404).json({ error: "No nearby users found" });
    }

    const connectedUser = nearbyUsers[0];

    res.status(200).json({
      success: true,
      message: "Nearby user found and connected",
      data: {
        user: connectedUser,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.addWallet = async (req, res) => {
  try {
    const userId  = req.params.id;
    const { amount, currency, transaction_type, payment_method, status } = req.body;

    const user = await User.findById(userId);

    if (!user.wallet || user.wallet.length === 0) {
      user.wallet = [{
        available_amount: 0,
        history: [],
        currency: {
          name: currency.name,
          sign: currency.sign
        }
      }];
    }

    const wallet = user.wallet[0];  

    wallet.available_amount = wallet.available_amount + amount;
    
    const transaction = {
      amount: amount,
      time: new Date(),
      how: "Added through API",
      in_out: transaction_type,  
      transaction_type: "Add Money",
      payment_method: payment_method,
      status: status,
      metadata: {}
    };

    wallet.history.push(transaction);

    await user.save();

    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: user, success: true, message: "Money added to wallet successfully" });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.updateScoreboard = async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the request params
    const { scoreboard } = req.body; // Get the scoreboard data from the request body

    if (!scoreboard) {
      return res.status(400).json({ success: false, message: "No scoreboard data provided." });
    }

    // Retrieve the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Ensure that the scoreboard is initialized as an object if it's not already
    if (typeof user.scoreboard !== 'object' || !user.scoreboard) {
      user.scoreboard = {
        rank_level: {
          rank: 0,
          rank_title: '',
          achievements: []
        },
        points: 0,
        points_history: [],
        user_progress: 0,
        win_rate: 0
      };
    }

    // Update the scoreboard fields
    if (scoreboard.rank_level) {
      if (scoreboard.rank_level.rank !== undefined) {
        user.scoreboard.rank_level.rank = scoreboard.rank_level.rank;
      }
      if (scoreboard.rank_level.rank_title !== undefined) {
        user.scoreboard.rank_level.rank_title = scoreboard.rank_level.rank_title;
      }
      if (scoreboard.rank_level.achievements) {
        user.scoreboard.rank_level.achievements = scoreboard.rank_level.achievements.map(achievement => ({
          volume: achievement.volume || 0,
          type: achievement.type || ''
        }));
      }
    }

    if (scoreboard.points !== undefined) {
      user.scoreboard.points = scoreboard.points;
    }

    if (scoreboard.points_history) {
      scoreboard.points_history.forEach(history => {
        user.scoreboard.points_history.push({
          points: history.points,
          date: history.date || Date.now()
        });
      });
    }

    if (scoreboard.user_progress !== undefined) {
      user.scoreboard.user_progress = scoreboard.user_progress;
    }

    if (scoreboard.win_rate !== undefined) {
      user.scoreboard.win_rate = scoreboard.win_rate;
    }

    // Save the updated user
    const updatedUser = await user.save();

    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: updatedUser.scoreboard, success: true, message: "Scoreboard updated successfully." });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getNextProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;

    const skip = (page - 1) * limit;

    const profiles = await User.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    if (profiles.length === 0) {
      return res
        .status(constants.status_code.header.ok)
        .send({
          statusCode: 200,
          data: [],
          success: true,
          message: "No more profiles to fetch."
        });
    }

    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: profiles,
        success: true,
        currentPage: page,
        message: "Profiles fetched successfully."
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({
        statusCode: 500,
        error: error.message,
        success: false,
      });
  }
};

exports.likeProfile = async (req, res) => {
  try {
    const { userId, targetProfileId, action } = req.body;

    const user = await User.findById(userId);
    const targetProfile = await User.findById(targetProfileId);

    if (action === 'like') {
      const isMutualLike = targetProfile.likeProfile.includes(userId);

      if (isMutualLike) {
        if (!user.likeProfile.includes(targetProfileId)) {
          user.likeProfile.push(targetProfileId);
        }

        const newChat = new Chat({
          sender: user.user_name,
          target: targetProfile.user_name,
          content: "You've matched! Start chatting.",
          timestamp: Date.now(),
        });

        await user.save();
        await newChat.save();

        return res
          .status(constants.status_code.header.ok) 
          .send({
            statusCode: constants.status_code.header.ok,
            success: true,
            message: "It's a match! Chat has been initiated.",
          });
      }

      if (!targetProfile.likeProfile.includes(userId)) {
        user.likeProfile.push(targetProfileId);
        await user.save();
      }

      return res
        .status(constants.status_code.header.ok)
        .send({
          statusCode: constants.status_code.header.ok,
          success: true,
          message: "Profile liked.",
        });

    } else if (action === 'dislike') {
      return res
        .status(constants.status_code.header.ok)
        .send({
          statusCode: constants.status_code.header.ok,
          success: true,
          message: "Profile disliked.",
        });
    }

    return res
      .status(constants.status_code.header.bad_request) 
      .send({
        statusCode: constants.status_code.header.bad_request,
        success: false,
        message: "Invalid action. Use 'like' or 'dislike'.",
      });

  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({
        statusCode: constants.status_code.header.server_error,
        error: error.message,
        success: false,
      });
  }
};

exports.getHomeData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate({
        path: 'recentPlayGames', 
        select: 'gameName gameId updatedAt'
      })
      .select('recentPlayGames'); 

    if (!user) {
      return res
        .status(constants.status_code.header.not_found)
        .send({
          statusCode: constants.status_code.header.not_found,
          success: false,
          message: "User not found.",
        });
    }

    const recentPlays = user.recentPlayGames;

    const popularProfiles = await User.aggregate([
      {
        $project: {
          full_name: 1,
          profile_image: 1,
          likeProfileCount: { $size: { $ifNull: ["$likeProfile", []] } } 
        }
      },
      { $sort: { likeProfileCount: -1 } }, 
      { $limit: 10 } 
    ]);

    
    // const trendingLive = await LiveGame.find({ liveStatus: "active" }) 
    //   .sort({ updatedAt: -1 }) 
    //   .limit(10)  
    //   .select('gameName liveStatus updatedAt'); 

    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        success: true,
        message: "Home data fetched successfully.",
        data: {
          recentPlays,
          popularProfiles,
          // trendingLive,
        },
      });

  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({
        statusCode: 500,
        error: error.message,
        success: false,
      });
  }
};

exports.getPlayData = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Fetch the current user's profile for their location
    const user = await User.findById(userId).select('location');

    // Check if user location is valid and has coordinates
    // if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
    //   return res
    //     .status(constants.status_code.header.not_found)
    //     .send({
    //       statusCode: constants.status_code.header.not_found,
    //       success: false,
    //       message: "User location not found or invalid.",
    //     });
    // }

    const userLocation = user.location.coordinates; // [longitude, latitude]

    // Fetch popular games based on the number of meetings
    const popularGames = await LiveGame.aggregate([
      {
        $project: {
          gameId: 1,
          gameName: 1,
          numberOfMeetings: { $size: { $ifNull: ["$meetings", []] } } // Safely handle missing meetings
        }
      },
      {
        $sort: { numberOfMeetings: -1 }
      },
      { $limit: 4 } 
    ]);

    // Fetch neighbour profiles based on the user's location
    const neighbourProfiles = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point", // Ensure this is exactly "Point"
            coordinates: userLocation // [longitude, latitude]
          },
          distanceField: "distance", 
          spherical: true, // Perform spherical calculations
          key: "location" // Use the location field for the geospatial query
        }
      },
      {
        $match: { 
          _id: { $ne: new ObjectId(userId) }, // Exclude current user
          distance: { $lte: 5000 } // Limit to profiles within 5km distance
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          full_name: 1,
          profile_image: 1,
          location: 1,
          distance: 1
        }
      }
    ]);

    // Return the compiled play data
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        success: true,
        message: "Play data fetched successfully.",
        data: {
          popularGames,
          neighbourProfiles,
        },
      });

  } catch (error) {
    // Error handling
    return res
      .status(constants.status_code.header.server_error)
      .send({
        statusCode: 500,
        error: error.message,
        success: false,
      });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("followers");
    if (!user) {
      return res
        .status(constants.status_code.header.not_found)
        .send({
          statusCode: constants.status_code.header.not_found,
          success: false,
          message: "User not found.",
        });
    }

    const followers = await User.find({ _id: { $in: user.followers } }).select(
      "full_name user_name profile_image"
    );

    return res.status(constants.status_code.header.ok).send({
      statusCode: constants.status_code.header.ok,
      success: true,
      message: "Followers fetched successfully.",
      data: {
        followers
      },
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({
        statusCode: constants.status_code.header.server_error,
        error: error.message,
        success: false,
      });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("follows");
    if (!user) {
      return res
        .status(constants.status_code.header.not_found)
        .send({
          statusCode: constants.status_code.header.not_found,
          success: false,
          message: "User not found.",
        });
    }

    const following = await User.find({ _id: { $in: user.follows } }).select(
      "full_name user_name profile_image"
    );

    return res.status(constants.status_code.header.ok).send({
      statusCode: constants.status_code.header.ok,
      success: true,
      message: "Following fetched successfully.",
      data: {
        following
      },
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({
        statusCode: constants.status_code.header.server_error,
        error: error.message,
        success: false,
      });
  }
};

exports.getPopularProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const popularProfiles = await User.aggregate([
      {
        $project: {
          full_name: 1,
          user_name: 1,
          profile_image: 1,
          likeCount: { $size: { $ifNull: ["$likeProfile", []] } },
        },
      },
      { $sort: { likeCount: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    if (popularProfiles.length === 0) {
      return res.status(constants.status_code.header.not_found).send({
        statusCode: constants.status_code.header.not_found,
        success: false,
        message: "No popular profiles found.",
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: constants.status_code.header.ok,
      success: true,
      message: "Popular profiles fetched successfully.",
      data: popularProfiles,
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: constants.status_code.header.server_error,
      error: error.message,
      success: false,
    });
  }
};

exports.followUnfollow = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(constants.status_code.header.not_found).send({
        statusCode: 404,
        success: false,
        message: "User or target user not found.",
      });
    }

    if (action === "follow") {
      if (!user.follows.includes(targetUserId)) {
        user.follows.push(targetUserId);
        await user.save();
      }
      if (!targetUser.followers.includes(userId)) {
        targetUser.followers.push(userId);
        await targetUser.save();
      }

      return res.status(constants.status_code.header.ok).send({
        statusCode: 200,
        success: true,
        message: `You are now following ${targetUser.full_name}.`,
      });
    } else if (action === "unfollow") {
      user.follows = user.follows.filter((id) => id.toString() !== targetUserId);
      await user.save();

      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
      await targetUser.save();

      return res.status(constants.status_code.header.ok).send({
        statusCode: 200,
        success: true,
        message: `You have unfollowed ${targetUser.full_name}.`,
      });
    } else {
      return res.status(constants.status_code.header.bad_request).send({
        statusCode: 400,
        success: false,
        message: "Invalid action. Use 'follow' or 'unfollow'.",
      });
    }
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      error: error.message,
      success: false,
    });
  }
};

// exports.getAllUser = async (req, res) => {
//     try {
//         const { page, pageSize } = req.query;
//         const pageNumber = parseInt(page) || 1;
//         const size = parseInt(pageSize) || 10;
//         const search = req.query.search || '';
//         const todayUserString = req.query.todayUser || '';
//         const searchQuery = {
//           IsDeleted: false,
//             $or: [
//                 { FirstName: { $regex: search, $options: 'i' } },
//             ]
//         };

//         if(todayUserString == 'yes'){
//                  const startOfToday = moment().startOf('day').toDate();
//                  const endOfToday = moment().endOf('day').toDate();
//                  searchQuery.CreatedDate = { $gte: startOfToday, $lt: endOfToday }
//                }
//         const users = await User.find(searchQuery)
//           .populate('Roles')
//           .sort({ CreatedDate: -1 })
//           .skip((pageNumber - 1) * size)
//           .limit(size)
//           ;
//           const records = users.filter(user => {
//             const roles = user.Roles.map(role => role.Role);
//             return !roles.includes('Admin');
//           //  return !(roles.length === 1 && roles.includes('Admin'))
//           })

//         const totalCount = await User.countDocuments(searchQuery);
//         const totalPages = Math.ceil(totalCount / size);

//         return res.status(constants.status_code.header.ok).send({
//           statusCode: 200,
//           data: records,
//           success: true,
//           totalCount: totalCount>0 ? totalCount-1:totalCount,
//           count: records.length,
//           pageNumber: pageNumber,
//           totalPages: totalPages,
//         });
//       } catch (error) {
//         res
//           .status(constants.status_code.header.server_error)
//           .send({ statusCode: 500, error: error.message, success: false });
//       }
// };

// exports.getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).populate('Roles');
//     if (!user) {
//       return res
//         .status(404)
//         .json({ error: "User not found", success: false });
//     }
//     return res
//       .status(constants.status_code.header.ok)
//       .send({ statusCode: 200, data: user, success: true });
//   } catch (error) {
//     return res
//       .status(constants.status_code.header.server_error)
//       .send({ statusCode: 500, error: error.message, success: false });
//   }
// };
// exports.getUserFullDetailsById = async (req, res) => {
//   try {
//     let user = await User.findById(req.params.id).populate('Roles');
//     if (!user) {
//       return res
//         .status(404)
//         .json({ error: "User not found", success: false });
//     }
//     const properties = await Property.find({IsDeleted:false,CreatedBy:req.params.id}).populate({path:"Facing",select:"_id Titile Facing"})
//     const enquiries = await ProjectEnquiry.find({IsDeleted:false,"AllowedUser.UserId":req.params.id}).populate({path:"PropertyId",select:"_id Titile"})

//     return res
//       .status(constants.status_code.header.ok)
//       .send({ statusCode: 200, data: {user,properties,enquiries}, success: true });
//   } catch (error) {
//     return res
//       .status(constants.status_code.header.server_error)
//       .send({ statusCode: 500, error: error.message, success: false });
//   }
// };
// exports.updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ error: "User not found", success: false });
//     }
//     res
//       .status(constants.status_code.header.ok)
//       .send({ statusCode: 200, message: constants.curd.update, success: true });
//   } catch (error) {
//     return res
//       .status(constants.status_code.header.server_error)
//       .send({ statusCode: 500, error: error.message, success: false });
//   }
// };
// exports.updatePassword = async (req, res) => {
//   const { OldPassword, NewPassword } = req.body;
//   try {
//     const userData = await User.findById(req.params.id);
//     if (!userData) {
//       return res.status(404).json({ error: "User not found", success: false });
//     }

//         const decoded = jwt.verify(req.token, config.JWT_KEY);

//         const login = await Login.findById(decoded._id);

//     const isMatch = await bcrypt.compare(OldPassword, login.Password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Old password does not match", success: false });
//     }

//     login.Password = NewPassword;

//     await login.save();

//     res.status(constants.status_code.header.ok).send({
//       statusCode: 200,
//       message: constants.curd.update,
//       success: true,
//     });
//   } catch (error) {
//     return res.status(constants.status_code.header.server_error).send({
//       statusCode: 500,
//       error: error.message,
//       success: false,
//     });
//   }
// };
// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).populate('Roles')
//     if (!user) {
//       return res
//         .status(404)
//         .json({ error: "User not found", success: false });
//     }
//     const roleNames = user.Roles.map(role => role.Role)
//     if (roleNames.includes('Developer')) {
//       const developers = await Developer.findOne({ UserId: req.params.id });
//       await Developer.updateMany({ UserId: req.params.id }, { IsDeleted: true });
//       await Property.updateMany({ Builder: developers._id  }, { IsDeleted: true });
//     }
//     user.IsDeleted = true;
//     await user.save();
//     res
//       .status(constants.status_code.header.ok)
//       .send({ statusCode: 200, message: constants.curd.delete, success: true });
//   } catch (error) {
//     return res
//       .status(constants.status_code.header.server_error)
//       .send({ statusCode: 500, error: error.message, success: false });
//   }
// };
// exports.getUserEnquiry = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id)
//     if (!user) {
//       return res
//         .status(404)
//         .json({ error: "User not found", success: false });
//     }

//     return res
//       .status(constants.status_code.header.ok)
//       .send({ statusCode: 200, IsEnquiryVisiable: user.IsEnquiryVisiable, success: true });
//   } catch (error) {
//     return res
//       .status(constants.status_code.header.server_error)
//       .send({ statusCode: 500, error: error.message, success: false });
//   }
// };
