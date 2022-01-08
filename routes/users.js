const express = require("express");
const { route } = require(".");

const router = express.Router();

const usersController = require("../controllers/users_controller");

router.get("/sign-in", usersController.signin);

router.get("/sign-up", usersController.signup);

router.post("/create", usersController.create);

module.exports = router;
