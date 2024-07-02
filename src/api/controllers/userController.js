const constants = require("../../helper/constants");
const User = require("../../models/userModel");
const bcrypt = require('bcryptjs');
const jwt =require ('jsonwebtoken');
const config = require('../../helper/config');
const moment = require('moment');


exports.getAllUser = async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const pageNumber = parseInt(page) || 1;
        const size = parseInt(pageSize) || 10;
        const search = req.query.search || '';
        const todayUserString = req.query.todayUser || '';  
        const searchQuery = {
          IsDeleted: false,
            $or: [
                { FirstName: { $regex: search, $options: 'i' } }, 
            ]
        };
      
        if(todayUserString == 'yes'){
                 const startOfToday = moment().startOf('day').toDate();
                 const endOfToday = moment().endOf('day').toDate();
                 searchQuery.CreatedDate = { $gte: startOfToday, $lt: endOfToday }
               }
        const users = await User.find(searchQuery)
          .populate('Roles')
          .sort({ CreatedDate: -1 })
          .skip((pageNumber - 1) * size)
          .limit(size)
          ;
          const records = users.filter(user => {
            const roles = user.Roles.map(role => role.Role);
            return !roles.includes('Admin');
          //  return !(roles.length === 1 && roles.includes('Admin'))
          })

        const totalCount = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCount / size);

        return res.status(constants.status_code.header.ok).send({
          statusCode: 200,
          data: records,
          success: true,
          totalCount: totalCount>0 ? totalCount-1:totalCount,
          count: records.length,
          pageNumber: pageNumber,
          totalPages: totalPages,
        });
      } catch (error) {
        res
          .status(constants.status_code.header.server_error)
          .send({ statusCode: 500, error: error.message, success: false });
      }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('Roles');
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", success: false });
    }
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: user, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
exports.getUserFullDetailsById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id).populate('Roles');
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", success: false });
    }
    const properties = await Property.find({IsDeleted:false,CreatedBy:req.params.id}).populate({path:"Facing",select:"_id Titile Facing"})
    const enquiries = await ProjectEnquiry.find({IsDeleted:false,"AllowedUser.UserId":req.params.id}).populate({path:"PropertyId",select:"_id Titile"})
    
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: {user,properties,enquiries}, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", success: false });
    }
    res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, message: constants.curd.update, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
exports.updatePassword = async (req, res) => {
  const { OldPassword, NewPassword } = req.body;
  try {
    const userData = await User.findById(req.params.id);
    if (!userData) {
      return res.status(404).json({ error: "User not found", success: false });
    }

        const decoded = jwt.verify(req.token, config.JWT_KEY);
        
        const login = await Login.findById(decoded._id);
  
    const isMatch = await bcrypt.compare(OldPassword, login.Password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password does not match", success: false });
    }

    login.Password = NewPassword;

    await login.save();

    res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      message: constants.curd.update,
      success: true,
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      error: error.message,
      success: false,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('Roles')
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", success: false });
    }
    const roleNames = user.Roles.map(role => role.Role)
    if (roleNames.includes('Developer')) {
      const developers = await Developer.findOne({ UserId: req.params.id });
      await Developer.updateMany({ UserId: req.params.id }, { IsDeleted: true });
      await Property.updateMany({ Builder: developers._id  }, { IsDeleted: true });
    }
    user.IsDeleted = true;
    await user.save();
    res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, message: constants.curd.delete, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
exports.getUserEnquiry = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", success: false });
    }
    
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, IsEnquiryVisiable: user.IsEnquiryVisiable, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
 
