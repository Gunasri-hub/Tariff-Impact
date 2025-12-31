const express = require('express');
const routers = express.Router();

 
const metadataRoutes = require("./metadata");
 
  
routers.use("/metadata", metadataRoutes);
 

module.exports = routers;