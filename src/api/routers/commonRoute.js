const express = require('express')
const commonController = require('../controllers/commonController')
const router = express.Router()

 const {uploadSingleFile,handleFileUpload} = require('../../helper/imgUpload')

 
router.post('/upload',handleFileUpload(uploadSingleFile.single('profilePic')),commonController.uploadSingleImage)
router.post('/uploadMultipleFiles', handleFileUpload(uploadSingleFile.array('multipleFiles')),commonController.uploadMultipleFile)
 
 

module.exports = router