const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = async function convertWebmToMp4(req, res, next) {
  const filename = req.file.filename;
  console.log(filename);
  if (filename && filename.endsWith('.mp4')) {
    next();
    return;
  }

  try {
    const pathToSourceDir = path.join(__dirname, '../upload');
    const pathToSourceFile = path.join(pathToSourceDir, filename);
    const readStream = fs.createReadStream(pathToSourceFile);
    const writeStream = fs.createWriteStream(`${pathToSourceDir}/${filename.replace(/.webm$/, '.mp4')}`);

    ffmpeg(readStream)
      .addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
      .format('mp4')
      .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error, stdout, stderr) {
        console.log({ TranscodingError: error, stdout, stderr });
        next();
      })
      .on('end', function (stdout, stderr) {
        console.log('Transcoding succeeded!');
        console.log({ stdout, stderr });

        req.file.filename = filename.replace(/.webm$/, '.mp4');
        deleteFile(pathToSourceFile);
        next();
      })
      .pipe(writeStream);
  } catch (error) {
    console.log({ error });
  }
};

function deleteFile(filePath) {
  fs.unlink(filePath, () => {
    console.log(`${filePath} was deleted`);
  });
}
