// Import the required AWS SDK clients and commands for Node.js
const { StartTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { transcribeClient } = require('./libs/transcribeClient');

exports.startTranscriptionJob = async (jobName, srcLocation) => {
  // Set the parameters\
  console.log('Transcription job created, the details In:');
  const params = {
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US', // For example, 'en-US'
    // MediaFormat: 'mp4', // For example, 'wav'
    Media: {
      MediaFileUri: srcLocation,
      // For example, "https://transcribe-demo.s3-REGION.amazonaws.com/hello_world.wav"
    },
    OutputBucketName: '',
  };

  const transcribeCommand = new StartTranscriptionJobCommand(params);

  try {
    const transcribeResponse = await transcribeClient.send(transcribeCommand);
    console.log('Transcription job created, the details:');
    console.log(transcribeResponse.TranscriptionJob);

    return transcribeResponse; // For unit tests.
  } catch (err) {
    console.log('Transcription job created, the details err:');
    console.log('Error', err);
  }
};
