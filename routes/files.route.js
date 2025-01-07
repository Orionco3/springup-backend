const multer = require("multer");
const express = require("express");

const controller = require("../controllers/files");
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
  .route("/files")
  .post(authenticate, upload.array("fileToUpload[]"), controller.newMultiple);
router
  .route("/file")
  .post(authenticate, upload.single("avatar"), controller.newSingle);

module.exports = router;
