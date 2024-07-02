const express = require('express');

const userRoutes = require('./userRoute');

const allRouters = express.Router();

allRouters.use('/user',userRoutes);

module.exports =  allRouters;