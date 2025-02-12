const express = require("express");

const userRoutes = require("./userRoute");
const adminRoutes = require("./adminRoute");
const couponRoutes = require("./couponRoute");
const commonRoutes = require("./commonRoute");
const liveGameRoutes = require("./livegameRoute");
const chatsRoutes = require("./chatsRoute");
const communityRoutes = require("./communityRoute");
const userReportRoutes = require("./userReportRoute");

const allRouters = express.Router();

allRouters.use("/user", userRoutes);
allRouters.use("/admin", adminRoutes);
allRouters.use("/coupon", couponRoutes);
allRouters.use("/common", commonRoutes);
allRouters.use("/liveGame", liveGameRoutes);
allRouters.use("/chats", chatsRoutes);
allRouters.use("/community", communityRoutes);
allRouters.use("/userReport", userReportRoutes);

module.exports = allRouters;
