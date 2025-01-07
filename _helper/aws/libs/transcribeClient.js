const { TranscribeClient } = require('@aws-sdk/client-transcribe');
const { awsS3 } = require('../../../config');

// Set the AWS Region.
const REGION = 'us-east-2';

// Set the credentials
const credentials = {
  accessKeyId: awsS3.accessKeyId,
  secretAccessKey: awsS3.secretAccessKey,
};

// Create an Amazon Transcribe service client object.
const transcribeClient = new TranscribeClient({ region: REGION, credentials });

module.exports = { transcribeClient };
