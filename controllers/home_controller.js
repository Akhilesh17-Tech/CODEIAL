const Post = require("../models/post");
const User = require("../models/user");

module.exports.home = function (req, res) {
  // console.log(req.cookies);
  // res.cookie('user_id', 25);

  // Post.find({}, function(err, posts){
  //     return res.render('home', {
  //         title: "Codeial | Home",
  //         posts:  posts
  //     });
  // });

  // populate the user of each post
  Post.find({})
    .populate("user")
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    })
    .exec(function (err, posts) {
      User.find({}, function (err, users) {
        return res.render("home", {
          title: "Codeial | Home",
          posts: posts,
          all_users: users,
        });
      });
    });
};

// // async await for cleaner code structure with error handling

// module.exports.home = async function (req, res) {
//   try {
//     let posts = await Post.find({})
//       .populate("user")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "user",
//         },
//       });

//     let users = await User.find({});
//     return res.render("home", {
//       title: "Codeial | Home",
//       posts: posts,
//       all_users: users,
//     });
//   } catch (err) {
//     console.log("Error : ", err);
//   }
// };

// // module.exports.actionName = function(req, res){}

// // using then
// // post.find({}).populate("comment").then(function());

// // using promises
// //  let post = post.find({}).populate("comment").exec();
// // post.then();
