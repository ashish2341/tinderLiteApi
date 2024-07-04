const express = require('express');

const userRoutes = require('./userRoute');
const adminRoutes = require('./adminRoute');

const allRouters = express.Router();

allRouters.use('/user',userRoutes);
allRouters.use('/admin',adminRoutes);

module.exports =  allRouters;