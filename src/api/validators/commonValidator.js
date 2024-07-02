const Joi = require('joi');
const getRecordsSchema = Joi.object({
    page: Joi.number().integer().min(1).required(),
    pageSize: Joi.number().integer().min(1).required(),
    search: Joi.string().allow(''),
    isEnable:Joi.boolean().optional(),
    todayBuilder: Joi.string().allow(''),
    todayProperty: Joi.string().allow(''),
    todayUser: Joi.string().allow(''),
    type: Joi.string().allow(''),
  });
  const idSchema = Joi.object({
    id: Joi.string().required().length(24).error(new Error('Id is inValid')),
   
  });
module.exports = {getRecordsSchema,idSchema}