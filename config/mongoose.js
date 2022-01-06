const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/codeial_development");

// mongoose.connection();

console.log("mongoose loaded");
