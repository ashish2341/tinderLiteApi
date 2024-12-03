var admin = require("firebase-admin");
var serviceAccount = require("../../helper/hunch-firebase.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports= admin
