const multer = require("multer");
const express = require("express");

const controller = require("../controllers/raceManagement.controller");
const { authenticate } = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./upload");
  },
  filename(req, file, cb) {
    const fileExtension = file.mimetype.split("/")[1];
    cb(null, `1${Date.now()}.${fileExtension}`);
  },
});
const upload = multer({ storage, dest: "./upload" });

const router = express.Router();

router.route("/findStage").post(authenticate, controller.index);

router.route("/submitStage").post(authenticate, controller.submitStage);

router.route("/getSingle/:id").get(authenticate, controller.getSingleDetail);

router.route("/checkIn").post(authenticate, controller.submitCheckIn);

router
  .route("/getSingleMain/:id")
  .get(authenticate, controller.getSingleDetailMain);

router.route("/list/all").post(authenticate, controller.getAllGroups);

router
  .route("/raceFeedBackSubmit")
  .post(authenticate, controller.raceFeedBackSubmit);

router.route("/progressUser").post(authenticate, controller.progressUser);

router
  .route("/progressUserListing")
  .post(authenticate, controller.progressUserListing);

router
  .route("/locationStageDetails")
  .post(authenticate, controller.locationStageDetails);

router.route("/locationDetails").post(authenticate, controller.locationDetails);


router.route("/Stage/userDetail").post(authenticate, controller.StageUserDetails);


router.route("/progressUser/max").post(authenticate, controller.progressUserMax);


router.route("/progressUser/min").post(authenticate, controller.progressUserMin);

router.route("/update/duration").post(authenticate, controller.updateDuration);



module.exports = router;
