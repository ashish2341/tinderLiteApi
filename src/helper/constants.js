 

module.exports = {
    enum: {
        role: {
            shipper: 'shipper',
            driver: 'driver',
            admin: 'admin',
            sub_admin: 'sub-admin',
        }, 
    },
    auth: {
        not_authorize: 'Not authorized to access this resource',
        login_error: 'Mobile/Email or Password does not match.',
        login_status: 'User status is {status}',
        login_verification_status: 'User verification status is {status}, Please contact to Administrator',
        register_success: 'You have been registered successfully',
        noaccount_error: 'No account with that user exists.',
    },
    user: {
        noaccount_error: 'No account with that user exists.',
        update_profile_image_error: 'Image update failed',
        update_profile_image_success: 'Image update succssfully',
        change_password_error: 'Invalid Old Password',
        change_password_success: 'Your password has been successfully changed',
      
        logout: 'User logout successfully',
        login: 'User login successfully',
    },
    admin: {
        logout: 'Admin logout successfully'
    },
    curd: {
        generate: 'Records generated successfully',
        add: 'Record inserted successfully',
        update: 'Record updated successfully',
        delete: 'Record deleted successfully',
        invalid_image_dimensions: 'Invalid image dimensions',
        no_record: 'No record found',
        image_required: 'Image Required',
        
    },
    model: {
        user: {
            email_invalid: 'Invalid Email address',
            role_invalid: '{VALUE} is not a valid user role!',
            mobile_number_invalid: '{VALUE} is not a valid 10 digit number!'
        }
    },
  
   
    status_code: {
        header: {
            ok: 200,
            unauthorized: 200,
            server_error: 200
        },
        body: {
            ok: 200,
            unauthorized: 401,
            server_error: 500
        }
    },
    dbCollectionName:{
        facings:'facings',
        propertyOwnerShips:"propertyownerships",
        propertyStatus:"propertystatuses",
        preferences:"preferences",
        soils:"soils",
        propertyWithSubTypes:"propertywithsubtypes",
        features:"features",
        aminities:"aminities",
        fencings:"fencings",
        floorings:"floorings",
        furnishedes:"furnishedes",
        builtAreaTypes:"builtareatypes",
        area:"areas",
        areaUnits:"areaunits",
        blogTypes:"blogtypes",
        banks:"banks",
        bhkTypes:"bhktypes",
        possessiones:"possessiones"
    }
}