const express = require("express");
const { route } = require(".");

const passport = require("passport");

const router = express.Router();

const usersController = require("../controllers/users_controller");
router.get("/profile", usersController.profile);

router.get("/sign-in", usersController.signin);

router.get("/sign-up", usersController.signup);

router.post("/create", usersController.create);

router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);

module.exports = router;
