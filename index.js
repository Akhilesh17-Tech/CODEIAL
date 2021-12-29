const express = require("express");
const port = 8000; // default app run on port 80
const app = express();

app.listen(port, function (err) {
  if (err) {
    console.log(`error in express : ${err}`);
    return;
  }
  console.log(`express running fine on port : ${port}`);
});