module.exports.home = function (req, res) {
  // return res.end("<h1>Hello Akhilesh controller home is running fine </h1>");

  console.log(req.cookies); // cookie from the browser
  res.cookie("user_id", 02); // we can change the cookie in response

  return res.render("home", {
    title: "Home",
  });
};

// module.export.actionName = function(req, res){} // syntax
