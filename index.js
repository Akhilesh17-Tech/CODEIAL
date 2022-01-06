const express = require("express");
const port = 8000; // default app run on port 80
const path = require("path");
// setup mongoDB
const db = require("./config/mongoose");

const app = express();

// setup static files folder
app.use(express.static("./assets"));

// setting up layouts
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

//extracting styles and scripts from sub pages into the layouts
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// use express router
app.use("/", require("./routes"));

// set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.listen(port, function (err) {
  if (err) {
    console.log(`error in express : ${err}`);
    return;
  }
  console.log(`express running fine on port : ${port}`);
});
