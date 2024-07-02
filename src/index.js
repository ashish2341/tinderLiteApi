const express = require('express');
const app = express();
let cors = require("cors");
require('dotenv').config()
const allRouters = require('./api/routers/routeIndex');
 
const path = require('path');
const { connectDB } = require('./db/db');


// db 
// Connect to MongoDB
connectDB().catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cors());

//routes
app.use("/v1", allRouters);


app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));






const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








