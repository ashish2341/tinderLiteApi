const express = require('express')
 
const router = express.Router()

 
const { validate } = require('../../helper/customValidation');
const auth = require('../middleware/auth');
const { getRecordsSchema, idSchema } = require('../validators/commonValidator');
const { getUserById, getAllUser, updateUser, deleteUser, updatePassword, getUserEnquiry, getUserFullDetailsById } = require('../controllers/userController');
const validateRole = require('../middleware/role');
const { registerUpdateSchema, passwordSchema } = require('../validators/authValidator');

router.get('/allUser',auth,validate(getRecordsSchema,'query'),validateRole(["Admin"]),getAllUser)
router.get('/user/:id',auth,validate(idSchema,'params'),getUserById)
router.get('/userFullDetails/:id',auth,validate(idSchema,'params'),getUserFullDetailsById)
router.patch('/updateUser/:id',validate(idSchema,'params'),validate(registerUpdateSchema,'body'),auth,updateUser)
router.delete('/deleteUser/:id',auth,validate(idSchema,'params'),validateRole(["Admin"]),deleteUser)
router.patch('/updatePassword/:id',validate(idSchema,'params'),validate(passwordSchema,'body'),auth,updatePassword)
router.get('/userEnquiry',auth,getUserEnquiry)
module.exports = router