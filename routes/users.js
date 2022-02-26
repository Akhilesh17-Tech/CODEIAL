const express = require("express");
const router = express.Router();
const passport = require("passport");

const usersController = require("../controllers/users_controller");

router.get(
  "/profile/:id",
  passport.checkAuthentication,
  usersController.profile
);
router.post(
  "/update/:id",
  passport.checkAuthentication,
  usersController.update
);

router.get("/sign-up", usersController.signUp);
router.get("/sign-in", usersController.signIn);

router.post("/create", usersController.create);

// use passport as a middleware to authenticate
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);
router.get("/sign-out", usersController.destroySession);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);

router.get("/forgot_password", usersController.forgotPassword);
router.post("/create_reset_token", usersController.createResetPasswordToken);
router.get("/reset_password/:access_token", usersController.resetPassword);
router.post("/update-password/:access_token", usersController.updatePassword);
router.get("/send-friend-request/:id", usersController.sendFriendRequest);
router.get("/accept-friend-request/:id", usersController.acceptFriendRequest);
router.get("/reject-friend-request/:id", usersController.rejectFriendRequest);
router.get("/remove-friend/:id", usersController.unfriend);

module.exports = router;
