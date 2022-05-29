const User = require('../models/user');
const Message = require('../models/message');
const fs = require('fs');
const path = require('path');
const PasswordToken = require('../models/reset_password_token');
const resetLinkMailer = require('../mailers/forgot_password_mailer');
const crypto = require('crypto');

// let's keep it same as before
module.exports.profile = async function (req, res) {
  try {
    let user = await User.findById(req.params.id).populate({
      path: 'posts',
      populate: {
        path: 'user comments',
        populate: {
          path: 'user',
        },
      },
      options: {
        sort: { createdAt: -1 },
      },
    });

    let currUser = await User.findById(req.user._id);

    let isFriend = user.friends.indexOf(currUser._id) == -1 ? false : true;
    let sentRequest =
      user.sentRequests.indexOf(currUser._id) == -1 ? false : true;
    let recievedRequest =
      user.recievedRequests.indexOf(currUser._id) == -1 ? false : true;

    return res.render('user_profile', {
      title: 'Connecti | User Profile',
      profile_user: user,
      isFriend: isFriend,
      acceptOrRejectRequest: sentRequest,
      awaitingResponse: recievedRequest,
      isFollowed: true,
    });
  } catch (err) {
    console.log('Error occured in profile controller!');
    return;
  }
};

module.exports.update = async function (req, res) {
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log('>>>>>>Multer error', err);
        }
        // console.log(req.file)
        user.name = req.body.name;
        user.email = req.body.email;
        user.about = req.body.about;
        if (req.file) {
          if (
            user.avatar &&
            fs.existsSync(path.join(__dirname, '..', user.avatar))
          ) {
            fs.unlinkSync(path.join(__dirname, '..', user.avatar));
          }
          user.avatar = User.avatarPath + '/' + req.file.filename;
        }
        user.save();
        return res.redirect('back');
      });
    } catch (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
  } else {
    req.flash('error', 'Unauthorized!');
    return res.status(401).send('Unauthorized');
  }
};

// render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/profile');
  }

  return res.render('user_sign_up', {
    title: 'Codeial | Sign Up',
  });
};

// render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/profile');
  }
  return res.render('user_sign_in', {
    title: 'Codeial | Sign In',
  });
};

// get the sign up data
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('back');
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      req.flash('error', err);
      return;
    }

    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          req.flash('error', err);
          return;
        }

        return res.redirect('/users/sign-in');
      });
    } else {
      req.flash('success', 'You have signed up, login to continue!');
      return res.redirect('back');
    }
  });
};

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash('success', 'Logged in Successfully');
  return res.redirect('/');
};

module.exports.destroySession = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You have logged out!');
    return res.redirect('/');
  });
};

module.exports.forgotPassword = function (req, res) {
  return res.render('user_forgot_password', {
    title: 'Codieal | Forgot Password',
  });
};

module.exports.createResetPasswordToken = async function (req, res) {
  try {
    let reqUser = await User.findOne({ email: req.body.email });
    if (reqUser) {
      let passwordToken = await PasswordToken.create({
        user: reqUser._id,
        accessToken: crypto.randomBytes(20).toString('hex'),
        isValid: true,
      });
      passwordToken = await passwordToken.populate('user', 'email');
      resetLinkMailer.newResetLink(passwordToken);
      req.flash('success', 'Reset Link sent! to your registered mail');
      return res.redirect('back');
    } else {
      req.flash('error', 'Email does not exist!');
      return res.render('user_sign_in', {
        title: 'Codeial | Sign in',
      });
    }
  } catch (err) {
    console.log('Error in creating reset token', err);
  }
};

module.exports.resetPassword = async function (req, res) {
  try {
    let passwordToken = await PasswordToken.findOne({
      accessToken: req.params.access_token,
    });
    let id = passwordToken.user.toString();
    let user = await User.findById(id);
    return res.render('user_reset_password', {
      title: 'Codeial | Reset Password',
      password_token: passwordToken,
      user: user,
    });
  } catch (err) {
    console.log('Error in accessing reset token!', err);
    return;
  }
};

module.exports.updatePassword = function (req, res) {
  PasswordToken.findOneAndUpdate(
    { accessToken: req.params.access_token },
    { isValid: false },
    function (err, passwordToken) {
      if (passwordToken.isValid == true) {
        if (req.body.password != req.body.confirm_password) {
          req.flash('error', "Passwords don't match!");
          return res.redirect('back');
        }
        User.findByIdAndUpdate(
          passwordToken.user,
          { password: req.body.password },
          function (err, user) {
            if (err) {
              console.log('Error while resetting the password');
              return;
            }
            req.flash('sucess', 'Password updated successfully!');
            return res.redirect('/users/sign-in');
          }
        );
      }
    }
  );
};

module.exports.sendFriendRequest = async function (req, res) {
  try {
    let toUser = await User.findById(req.params.id);
    let fromUser = await User.findById(req.user._id);

    let indexOne = toUser.recievedRequests.indexOf(fromUser._id);
    let indexTwo = fromUser.sentRequests.indexOf(toUser._id);
    let indexThree = toUser.friends.indexOf(fromUser._id);

    if ((indexOne != -1 && indexTwo != -1) || indexThree != -1) {
      return res.redirect('back');
    }

    toUser.recievedRequests.push(fromUser);
    fromUser.sentRequests.push(toUser);

    toUser.save();
    fromUser.save();

    console.log(toUser);
    console.log(fromUser);
    return res.redirect('back');
  } catch {
    console.log('Error in sendFriendRequest controller!');
  }
};

module.exports.acceptFriendRequest = async function (req, res) {
  try {
    let acceptingUser = await User.findById(req.user._id);
    let sendingUser = await User.findById(req.params.id);

    let indexOne = acceptingUser.recievedRequests.indexOf(sendingUser._id);
    let indexTwo = sendingUser.sentRequests.indexOf(acceptingUser._id);
    let indexThree = sendingUser.friends.indexOf(acceptingUser._id);

    if (indexOne == -1 || indexTwo == -1 || indexThree != -1) {
      return res.redirect('back');
    }

    acceptingUser.friends.push(sendingUser);
    sendingUser.friends.push(acceptingUser);
    // await Message.create({
    //   roomId: `${acceptingUser.email}${sendingUser.email}`,
    //   messages: [],
    // });
    // acceptingUser.chatRooms.push({
    //   user: sendingUser._id,
    //   roomId: `${acceptingUser.email}${sendingUser.email}`,
    // });
    // sendingUser.chatRooms.push({
    //   user: acceptingUser._id,
    //   roomId: `${acceptingUser.email}${sendingUser.email}`,
    // });

    acceptingUser.recievedRequests.splice(indexOne, 1);
    sendingUser.sentRequests.splice(indexTwo, 1);

    acceptingUser.save();
    sendingUser.save();

    return res.redirect('back');
  } catch {
    console.log('Error in acceptFriendRequest controller!');
  }
};

module.exports.rejectFriendRequest = async function (req, res) {
  try {
    let acceptingUser = await User.findById(req.user._id);
    let sendingUser = await User.findById(req.params.id);

    let indexOne = acceptingUser.recievedRequests.indexOf(sendingUser._id);
    let indexTwo = sendingUser.sentRequests.indexOf(acceptingUser._id);
    let indexThree = sendingUser.friends.indexOf(acceptingUser._id);

    if (indexOne == -1 || indexTwo == -1 || indexThree != -1) {
      return res.redirect('back');
    }

    acceptingUser.recievedRequests.splice(indexOne, 1);
    sendingUser.sentRequests.splice(indexTwo, 1);

    acceptingUser.save();
    sendingUser.save();

    return res.redirect('back');
  } catch {
    console.log('Error in acceptFriendRequest controller!');
  }
};

module.exports.unfriend = async function (req, res) {
  let userOne = await User.findById(req.user._id);
  let userTwo = await User.findById(req.params.id);

  let indexOne = userOne.friends.indexOf(userTwo._id);
  let indexTwo = userTwo.friends.indexOf(userOne._id);

  if (indexOne == -1 || indexTwo == -1) {
    return res.redirect('back');
  }

  userOne.friends.splice(indexOne, 1);
  userTwo.friends.splice(indexTwo, 1);
  let newArrayOne = [];
  let newArrayTwo = [];
  for (let room of userOne.chatRooms) {
    if (
      room.roomId != userOne.email + userTwo.email &&
      room.roomId != userTwo.email + userOne.email
    ) {
      newArrayOne.push(room);
    }
  }
  for (let room of userTwo.chatRooms) {
    if (
      room.roomId != userOne.email + userTwo.email &&
      room.roomId != userTwo.email + userOne.email
    ) {
      newArrayTwo.push(room);
    }
  }
  userOne.chatRooms = newArrayOne;
  userTwo.chatRooms = newArrayTwo;
  let message = await Message.findOneAndDelete({
    roomId: userOne.email + userTwo.email,
  });
  if (!message) {
    message = await Message.findOneAndDelete({
      roomId: userTwo.email + userOne.email,
    });
  }
  userOne.save();
  userTwo.save();
  return res.redirect('back');
};
