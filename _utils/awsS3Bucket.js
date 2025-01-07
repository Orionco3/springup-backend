const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

const { awsS3 } = require("../config/vars");

const s3 = new AWS.S3({
  accessKeyId: "AKIARIXC3ATS64CI44NS",
  secretAccessKey: "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",
});

exports.uploadFileToS3Bucket = async function uploadFileToS3Bucket(
  fileName,
  ContentType
) {
  // create absolute path to the image file
  const filePath = path.join(__dirname, `../upload/${fileName}`);

  // create a read stream to read the image file
  const fileStream = fs.createReadStream(filePath);

  // create a promise that resolves when the file is uploaded to the S3 bucket
  const params = {
    Bucket: "gameappbucket",
    Key: fileName,
    Body: fileStream,
    ContentType,
  };

  try {
    const uploadPromise = s3.upload(params).promise();
    const uploadResponse = await uploadPromise;

    // upload is successful, delete the local copy of file
    deleteFile(filePath);

    // return the AWS file URL
    return uploadResponse.Location;
  } catch (error) {
    console.error({ S3FileUploadError: error });
    return Promise.reject(error);
  }
};

function deleteFile(filePath) {
  fs.unlink(filePath, () => {
    console.log(`${filePath} was deleted`);
  });
}
