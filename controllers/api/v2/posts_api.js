module.exports.index = function (req, res) {
  return res.json(200, {
    message: "List of Posts",
    version: "v2",
    posts: [],
  });
};
