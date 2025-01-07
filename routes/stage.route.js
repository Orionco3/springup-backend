const express = require("express");

const controller = require("../controllers/stage.controller");

const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.route("/create-edit").post(authenticate, controller.Create);

router.route("/getSingle/:id").get(authenticate, controller.getSingleDetail);

router.route("/index").post(authenticate, controller.index);

router.route("/list/all").post(authenticate, controller.getAllGroups);

router
  .route("/list/allRace/:raceId")
  .post(authenticate, controller.getAllRaceStages);

router.route("/deleting/:id/:raceId").get(authenticate, controller.delete);

module.exports = router;
