const express = require("express");

const router = express.Router();
const { uploadSingleFile, handleFileUpload } = require("../../helper/imgUpload");

// const { validate } = require('../../helper/customValidation');
// const auth = require('../middleware/auth');
// const { getRecordsSchema, idSchema } = require('../validators/commonValidator');
//const { getUserById, getAllUser, updateUser, deleteUser, updatePassword, getUserEnquiry, getUserFullDetailsById } = require('../controllers/userController');
const {
  addUser,
  login,
  loginUserData,
  updateUsers,
  getAllUsers,
  getUserById,
  deleteUser,
  nearbyUser,
  addWallet,
  updateScoreboard,
  getNextProfiles,
  likeProfile,
  getHomeData,
  getPlayData,
} = require("../controllers/userController");
const { getChats } =  require("../controllers/chatsController");
const { createCommunity, getAllCommunities, updateCommunity } = require("../controllers/communityController")
const { verifyToken } = require("../middleware/role");
// const validateRole = require('../middleware/role');
// const { registerUpdateSchema, passwordSchema } = require('../validators/authValidator');

router.post("/addUser", addUser);
router.post("/login", login);
router.get("/loginUserData", verifyToken, loginUserData);
router.get("/getAllUsers", getAllUsers);
router.put("/updateUser/:id", updateUsers);
router.get("/getUserById/:id", getUserById);
router.delete("/deleteUser/:id", deleteUser);
router.post("/connect-nearby-users", nearbyUser);
router.post("/addWallet/:id", addWallet);
router.put("/updateScoreboard/:id", updateScoreboard);
router.get("/getChats/:id", getChats);
router.post("/createCommunity", createCommunity);
router.put("/updateCommunity/:id", updateCommunity);
router.get("/getAllCommunities", getAllCommunities);
router.get("/getNextProfiles", getNextProfiles);
router.post("/likeProfile", likeProfile);
router.get("/getHomeData", verifyToken, getHomeData);
router.get("/getPlayData/:id", getPlayData);
// router.get('/allUser',auth,validate(getRecordsSchema,'query'),validateRole(["Admin"]),getAllUser)
// router.get('/user/:id',auth,validate(idSchema,'params'),getUserById)
// router.get('/userFullDetails/:id',auth,validate(idSchema,'params'),getUserFullDetailsById)
// router.patch('/updateUser/:id',validate(idSchema,'params'),validate(registerUpdateSchema,'body'),auth,updateUser)
// router.delete('/deleteUser/:id',auth,validate(idSchema,'params'),validateRole(["Admin"]),deleteUser)
// router.patch('/updatePassword/:id',validate(idSchema,'params'),validate(passwordSchema,'body'),auth,updatePassword)
// router.get('/userEnquiry',auth,getUserEnquiry)

module.exports = router;
