const constants = require("../../helper/constants");
const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../helper/config");
const moment = require("moment");
const UserService = require("../services/userService");
//import httpStatus from "http-status";

exports.addUser = async (req, res) => {
  try {
    let {
      full_name,
      user_name,
      email,
      phone,
      gender,
      dob,
      bio,
      role,
      profile_image,
      whatsappNotify,
    } = req.body;

    let userData = new User({
      full_name: full_name,
      email: email,
      phone: phone,
      dob: dob,
      user_name: user_name,
      bio: bio,
      gender: gender,
      role: role,
      profile_image: profile_image,
      whatsappNotify: whatsappNotify,
    });

    let payload = { userId: userData._id, phone: userData.phone };
    userData.token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "360000s",
    });
    let message = "signup success";
    let result = await userData.save();
    console.log(result)
    // const mailData = {
    //   name: fullName,
    //   email: email,
    //   subject: "Welcome to EduHunch! ",
    //   message:
    //     "Welcome aboard to EduHunch, your trusted companion in the journey of education discovery!",
    // };
    // await UserService.sendWelcomeMail(mailData);
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: result, success: true, message: message });
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
      profile_image,
      whatsappNotify,
    } = req.body;

    if (user_name) {
      const existingUser = await User.findOne({ user_name: user_name });
      if (existingUser) {
        const msg = `Username '${user_name}' already exists in the database.`;
        return res
          .status(constants.status_code.header.server_error)
          .send({ statusCode: 500, error: msg, success: false });
      }
    }
    const updateUser = {
      full_name,
      user_name,
      email,
      phone,
      gender,
      dob,
      bio,
      role,
      profile_image,
      whatsappNotify,
    };
    const result = await UserService.updateUser(userId, updateUser);
    //clear cache
    // if (cache.has(userId)) {
    //   cache.del(userId);
    // }
    let message = "User Updated Successfully";
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: result,
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
