module.exports.home = function (req, res) {
  // return res.end("<h1>Hello Akhilesh controller home is running fine </h1>");

  return res.render("home", {
    title: "Home",
  });
};

// module.export.actionName = function(req, res){} // syntax
