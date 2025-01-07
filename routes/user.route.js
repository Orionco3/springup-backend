const express = require("express");

const controller = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth");
const router = express.Router();

//  Get User Detail
router.route("/update").post(authenticate, controller.updateUser);

router
  .route("/updateAdminUser")
  .post(authenticate, controller.updateSingleUserAdminPanel);

router.route("/getSingleData").post(authenticate, controller.getSingleUser);


router.route("/getSingle/:id").get(authenticate, controller.getSingleData);


router.route("/deleting/:id").get(authenticate, controller.delete);

module.exports = router;
