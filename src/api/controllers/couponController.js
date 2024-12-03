const constants = require("../../helper/constants");
const Coupon = require("../../models/couponModel");

exports.addCoupon = async (req, res) => {
  try {
    const { name, expireDate, amount } = req.body;
    const coupon = new Coupon({ name, expireDate, amount });
    await coupon.save();
    const message = "Coupon created successfully..!";
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: coupon, success: true, message: message });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page == 1) {
      var pageSkip = 0;
    } else {
      pageSkip = (page - 1) * limit;
    }
    const result = await Coupon.find().skip(pageSkip).limit(limit);
    
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: result, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const userId = req.params.id;
    const coupon = await Coupon.findById(userId);
    return res
      .status(constants.status_code.header.ok)
      .send({ statusCode: 200, data: coupon, success: true });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.updateCouponById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, expireDate, amount } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      userId,
      { name, expireDate, amount },
      { new: true }
    );
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: coupon,
        success: true,
        message: "Coupon updated successfuly..!",
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.deleteCouponById = async (req, res) => {
  try {
    const userId = req.params.id;
    const coupon = await Coupon.findByIdAndDelete(userId);
    return res
      .status(constants.status_code.header.ok)
      .send({
        statusCode: 200,
        data: coupon,
        success: true,
        message: "Coupon deleted successfully..!",
      });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
