const express = require("express");
const port = 8000; // default app run on port 80
const path = require("path");
const app = express();

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
