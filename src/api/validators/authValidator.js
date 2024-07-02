
const Joi = require('joi');

const registerSchema =  Joi.object().keys({
        FirstName: Joi.string().required().error(new Error('First Name is required')),
        LastName: Joi.string().optional(),
        Age: Joi.number().positive().optional(),
        Gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
        Mobile: Joi.string().pattern(/^[0-9]{10}$/).required().error(new Error('Mobile number is required and should be 10 digits')),
        Phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
        Area: Joi.string().optional(),
        City: Joi.string().optional(),
        State: Joi.string().optional(),
        Country: Joi.string().optional(),
        PinCode: Joi.string().optional(),
        Role: Joi.string().valid("Buyer","Developer","Client","Agent").required(), // Assuming RoleId is a string
        IsEnabled: Joi.boolean().default(true),
        IsDeleted: Joi.boolean().default(false),
        ProfilePhoto: Joi.string().optional(),
        Password: Joi.string().required().error(new Error('Password is required')),
        EmailId: Joi.string().email().required().error(new Error('Email is required and should be valid')),
    })

    const registerUpdateSchema =  Joi.object().keys({
      FirstName: Joi.string(),
      LastName: Joi.string().optional(),
      Age: Joi.number().positive().optional(),
      Gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
      Mobile: Joi.string().pattern(/^[0-9]{10}$/).error(new Error('Mobile number should be 10 digits')),
      Phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
      Area: Joi.string().optional(),
      City: Joi.string().optional(),
      State: Joi.string().optional(),
      Country: Joi.string().optional(),
      PinCode: Joi.string().optional(),
      Role: Joi.string().valid("Buyer","Developer","Client","Agent"), // Assuming RoleId is a string
      IsEnabled: Joi.boolean().default(true),
      IsDeleted: Joi.boolean().default(false),
      IsEnquiryVisiable:Joi.boolean(),
      ProfilePhoto: Joi.string().optional(),
      EmailId: Joi.string().email(),
  })


const loginSchema = Joi.object().keys({
         Mobile: Joi.string().pattern(/^[0-9]{10}$/).required().error(new Error('Mobile number is required and should be 10 digits')),
        Password: Joi.string().required().error(new Error('Password is required')),
        
    })
const passwordSchema = Joi.object().keys({
    OldPassword: Joi.string().required().error(new Error('Old Password is required')),
    NewPassword: Joi.string().required().error(new Error('New Password is required')),
     
 })
    const roleSchema = Joi.object().keys({
        Role: Joi.string().valid("Buyer","Developer","Agent","Client").required(),
        
    })
 
      const sendOtpSchema = Joi.object({
        Mobile: Joi.string().pattern(/^[0-9]{10}$/).required().error(new Error('Mobile number is required and should be 10 digits')),
       
      });
      const imageSchema = Joi.object({
        profilePic: Joi.string(),
       
      });
      const verifyOtpSchema = Joi.object({
        Mobile: Joi.string().pattern(/^[0-9]{10}$/).required().error(new Error('Mobile number is required and should be 10 digits')),
       Otp:Joi.string().length(6).required()
      });
      const forgetSchema = Joi.object().keys({
        Mobile: Joi.string().pattern(/^[0-9]{10}$/).required().error(new Error('Mobile number is required and should be 10 digits')),
       NewPassword: Joi.string().required().error(new Error(' New Password is required')),
       
   })
module.exports = {
    registerSchema,
    registerUpdateSchema,
    passwordSchema,
    loginSchema,
    roleSchema,
    verifyOtpSchema,
    sendOtpSchema,
    forgetSchema,
    imageSchema
};
