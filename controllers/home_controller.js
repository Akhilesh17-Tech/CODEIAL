const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

module.exports.home = async function (req, res) {
  try {
    // CHANGE :: populate the likes of each post and comment
    let posts = await Post.find({})
      .sort('-createdAt')
      .populate('user')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
        },
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate('likes');

    let users = await User.find({});
    let curr_user;
    friendshipUser = [];
    if (req.user) {
      curr_user = await User.findById(req.user._id);
      for (let uid of curr_user.friends) {
        let friendsUser = await User.findById(uid);
        friendshipUser.push(friendsUser);
      }
    } else {
      friendsUser = [];
    }
    return res.render('home', {
      title: 'Codeial | Home',
      posts: posts,
      all_users: users,
      curr_user: curr_user,
      addedFriends: friendshipUser,
    });
  } catch (err) {
    console.log('Error', err);
    return;
  }
};

// module.exports.actionName = function(req, res){}
// using then
// Post.find({}).populate('comments').then(function());
// let posts = Post.find({}).populate('comments').exec();
// posts.then()

//  .populate({
//       path: 'friends',
//     })
//     .populate({
//       path: 'chatRooms',
//       populate: {
//         path: 'user',
//       },
//     });
