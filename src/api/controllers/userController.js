const constants = require("../../helper/constants");
const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../helper/config");
const moment = require("moment");
const UserService = require("../services/userService");
const mongoose = require('mongoose');
const Community = require("../../models/communityModel");
const cloudinary = require('cloudinary').v2;
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
      bio,
      role,
      whatsappNotify,
      //location
    } = req.body;

    const file = req.files.profile_image;    

    const profileImageUrl = await cloudinary.uploader.upload(file.tempFilePath);

    let userData = new User({
      full_name: full_name,
      user_name: user_name,
      email: email,
      phone: phone,
      gender: gender,
      dob: dob,
      bio: bio,
      role: role,
      profile_image: profileImageUrl.secure_url, 
      whatsappNotify: whatsappNotify,
      // location: {
      //   type: "Point",
      //   coordinates: location.coordinates
      // }
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
    const { phone } = req.body;
    //let password = req.body.password;
    //const match = await bcrypt.compare(password, userData.password)
    const userData = await User.findOne({ phone: phone });
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
    let phone = req.body.phone;
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
     console.log("users",users)

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
      role,
      whatsappNotify,
      fcmToken,
      BFFs,
      location
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
    if (role) updateUser.role = role;
    if (whatsappNotify !== undefined) updateUser.whatsappNotify = whatsappNotify;
    if (fcmToken) updateUser.fcmToken = fcmToken;
    if (BFFs) updateUser.BFFs = BFFs;
    if (location) {
      updateUser.location = {
        type: "Point",
        coordinates: location.coordinates
      };
    }

    const updatedUser = await UserService.updateUser(userId, updateUser);

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
