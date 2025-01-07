const { uploadFileToS3Bucket } = require("../_helper/awsS3Bucket");

exports.newMultiple = async function (req, res) {
  var filesArray = [];
  // console.log(req.files);
  if (req.files.length > 0) {
    for (var i = 0; i < req.files.length; i++) {
      filesArray.push(req.files[i].filename);
      await uploadFileToS3Bucket(req.files[i].filename);
    }
    res.status(200).json({
      success: true,
      message: "File Uploaded!",
      filesArray: filesArray,
    });
  }
};

exports.newSingle = async function (req, res) {
  await uploadFileToS3Bucket(req.file.filename);
  res.status(200).json({
    success: true,
    message: "File Uploaded!",
    name: req.file.filename,
  });
};
