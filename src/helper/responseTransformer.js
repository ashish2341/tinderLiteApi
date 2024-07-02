 

const errorResponse = (error) => {
  let errorMsg=''
  if (error?.code === 11000 && error?.errmsg.indexOf('dup key') > -1) {
   return errorMsg = Object.keys(error.keyPattern)[0] + ' is already in use'
    
}
else if (error?.errors?.role?.properties?.message) {
  return errorMsg = error.errors.role.properties.message
    
}
else {
    errorMsg = error.message
}
  return errorMsg
};

module.exports = {
    errorResponse
  };
