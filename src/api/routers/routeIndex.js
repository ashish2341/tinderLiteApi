const express = require("express");

const userRoutes = require("./userRoute");
const adminRoutes = require("./adminRoute");
const couponRoutes = require("./couponRoute");
const commonRoutes = require('./commonRoute');

const allRouters = express.Router();

allRouters.use("/user", userRoutes);
allRouters.use("/admin", adminRoutes);
allRouters.use("/coupon", couponRoutes);
allRouters.use('/common',commonRoutes);

module.exports = allRouters;
