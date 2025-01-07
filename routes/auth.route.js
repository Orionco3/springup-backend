const express = require("express");

const controller = require("../controllers/auth");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.route("/login").post(controller.login);
router.route("/signup").post(controller.signup);

router.route("/userRegister").post(controller.userRegister);

router
  .route("/emailVerification/:emailToken")
  .get(controller.emailVerification);

router.route("/change-password").post(authenticate, controller.changePassword);

router.route("/forgot-password").post(controller.forgotPassword);
router.route("/changePassword/:token").post(controller.setPassword);

router.route("/createSingleTeam").post(controller.createSingleTeam);

router.route("/list/all").post(authenticate, controller.getAllUsers);

//Contact Us

router.route("/signUpNewUser").post(controller.signUpNewUser);

module.exports = router;
