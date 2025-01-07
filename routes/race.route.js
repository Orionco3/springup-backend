const multer = require("multer");
const express = require("express");

const controller = require("../controllers/race.controller.js");
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

router
  .route("/create-edit")
  .post(authenticate, upload.array("fileToUpload[]"), controller.Create);

router.route("/getSingle/:id").get(authenticate, controller.getSingleDetail);

router
  .route("/getSingleMain/:id")
  .get(authenticate, controller.getSingleDetailMain);

router.route("/index").post(authenticate, controller.index);

router.route("/list/all").post(authenticate, controller.getAllGroups);

router.route("/deleting/:id").get(authenticate, controller.delete);

router.route("/copy/:id").get(authenticate, controller.copy);




module.exports = router;
