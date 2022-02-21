const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const PasswordToken = require("../models/reset_password_token");
const resetLinkMailer = require("../mailers/forgot_password_mailer");
const crypto = require("crypto");

// let's keep it same as before
module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    return res.render("user_profile", {
      title: "User Profile",
      profile_user: user,
    });
  });
};

module.exports.update = async function (req, res) {
  // if (req.user.id == req.params.id) {
  //   User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
  //     req.flash("success", "Updated!");
  //     return res.redirect("back");
  //   });
  // } else {
  //   req.flash("error", "Unauthorized!");
  //   return res.status(401).send("Unauthorized");
  // }
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log(">>>>>>Multer error", err);
        }
        // console.log(req.file)
        user.name = req.body.name;
        user.email = req.body.email;
        if (req.file) {
          if (user.avatar) {
            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
          }
          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorized!");
    return res.status(401).send("Unauthorized");
  }
};

// render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }

  return res.render("user_sign_up", {
    title: "Codeial | Sign Up",
  });
};

// render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_in", {
    title: "Codeial | Sign In",
  });
};

// get the sign up data
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Passwords do not match");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      req.flash("error", err);
      return;
    }

    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          req.flash("error", err);
          return;
        }

        return res.redirect("/users/sign-in");
      });
    } else {
      req.flash("success", "You have signed up, login to continue!");
      return res.redirect("back");
    }
  });
};

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have logged out!");

  return res.redirect("/");
};

module.exports.forgotPassword = function (req, res) {
  return res.render("user_forgot_password", {
    title: "Codieal | Forgot Password",
  });
};

module.exports.createResetPasswordToken = async function (req, res) {
  try {
    let reqUser = await User.findOne({ email: req.body.email });
    if (reqUser) {
      let passwordToken = await PasswordToken.create({
        user: reqUser._id,
        accessToken: crypto.randomBytes(20).toString("hex"),
        isValid: true,
      });
      passwordToken = await passwordToken.populate("user", "email");
      resetLinkMailer.newResetLink(passwordToken);
      req.flash("success", "Reset Link sent! to your registered mail");
      return res.redirect("back");
    } else {
      req.flash("error", "Email does not exist!");
      return res.render("user_sign_in", {
        title: "Codeial | Sign in",
      });
    }
  } catch (err) {
    console.log("Error in creating reset token", err);
  }
};

module.exports.resetPassword = async function (req, res) {
  try {
    let passwordToken = await PasswordToken.findOne({
      accessToken: req.params.access_token,
    });
    let id = passwordToken.user.toString();
    let user = await User.findById(id);
    return res.render("user_reset_password", {
      title: "Codeial | Reset Password",
      password_token: passwordToken,
      user: user,
    });
  } catch (err) {
    console.log("Error in accessing reset token!", err);
    return;
  }
};

module.exports.updatePassword = async function (req, res) {
  try {
    let passwordToken = await PasswordToken.findOneAndUpdate(
      { accessToken: req.params.access_token },
      { isValid: false }
    );
    if (passwordToken.isValid) {
      if (req.body.password != req.body.confirm_password) {
        req.flash("error", "Password doesn't match!");
        return res.redirect("back");
      }
      let user = User.findOneAndUpdate(passwordToken.user, {
        password: req.body.password,
      });
      if (!user) {
        console.log("Error while resetting the password");
        return;
      }
      req.flash("sucess", "Password updated successfully!");
      return res.redirect("/users/sign-in");
    }
  } catch (err) {
    console.log("Error in updating password", err);
    return res.redirect("back");
  }
};
