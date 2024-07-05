const constants = require("../../helper/constants");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    let phone = req.body.phone;
    let password = req.body.password;

    // console.log(match + "gghjh")
    if (phone == "8840916053" && password == "8840916053") {
      let message = "Login Success";
      let payload = { phone: phone };
      let token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "3d",
      });

      return res.status(constants.status_code.header.ok).send({
        statusCode: 200,
        data: token,
        success: true,
        message: message,
      });
    } else {
      let message = "password not match";
      return res
        .status(constants.status_code.header.server_error)
        .send({ statusCode: 500, error: message, success: false });
    }
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};
exports.getDataForAdmin = async (req, res) => {
  try {

    

    const TotalUser = await User.find({ IsDeleted: false })
    

   
 

   
    
   
  

    return res.status(200).send({
      statusCode: 200,
      totalUser: TotalUser.length,
      todayUsers: TodayUsers.length,
      totalProperty: TotalProperty.length,
      success: true
    });

  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      error: error.message,
      success: false
    });
  }
};
