module.exports.profile = function (req, res) {
  return res.end("<h1> User Profile </h1>");
};

module.exports.edit = function (req, res) {
  return res.end("<h1>user can edit his profile </h1>");
};
