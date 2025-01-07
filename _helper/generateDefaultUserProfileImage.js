const path = require("path");
const { createWriteStream } = require("fs");
const { finished: streamFinished } = require("stream");
const { promisify } = require("util");

const axios = require("axios").default;
const { ObjectId } = require("mongoose").Types;

const { uploadFileToS3Bucket } = require("../_utils/awsS3Bucket");

const streamFinishedPromise = promisify(streamFinished);

/**
 * a helper function to download and save the user profile image
 * @param {String} fileUrl The URL from where the image will be downloaded
 * @param {String} outputLocationPath The path where the image will be saved
 * @returns Promise that resolves when the image is downloaded
 */
async function getUserProfileImage(fileUrl, outputLocationPath) {
  // create a write stream to store the downloaded image at the output location
  const writer = createWriteStream(outputLocationPath);

  try {
    // send the HTTP request to download the image
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    });

    // pipe the response to the writer stream
    response.data.pipe(writer);

    // Finally, return a promise that resolves when the download is complete.
    return streamFinishedPromise(writer);
  } catch (error) {
    console.error({ GenerateUserProfileImageError: error });
    return Promise.reject(false);
  }
}

/**
 * a helper function to generate the default user profile image using the user's name initials, and storing the generated image on S3 bucket
 * @param {String} userName The full name of the user
 * @returns {String} The image URL pointing to the user's profile image stored on S3 bucket
 */
module.exports = async function generateDefaultUserProfileImage(userName) {
  // generate a random filename for the user profile image
  const filename = new ObjectId().toString();
  const filenameWithExtension = `${filename}.png`;
  let imageUrl = "";

  // create the download URL and output location path for the user profile image
  const imageGenerationUrl = `https://ui-avatars.com/api/?name=${userName}&size=512&background=random`;
  const downloadLocation = path.join(
    __dirname,
    `../upload/${filenameWithExtension}`
  );

  try {
    // download and save the image to the upload folder
    await getUserProfileImage(imageGenerationUrl, downloadLocation);

    // also, upload the image to the S3 bucket and get its remote URL
    imageUrl = await uploadFileToS3Bucket(filenameWithExtension, "image/png");
  } catch {
    // if there is an error, return the default image URL
    imageUrl = "placeholder.png";
  }

  // finally, return the URL for the user profile image
  return imageUrl;
};
