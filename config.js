module.exports = {

  // 1. MongoDB
  MONGO_URI: process.env.MONGO_URI,

  // 2. JWT
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES || 1440,

  baseUrl: process.env.baseUrl,

  serverURL: process.env.serverURL,

  google_config: {
    client_ID: '54318990685-fgr5csnvec7taedte8rha2l9fetiev2l.apps.googleusercontent.com',
    client_secret: 'y7IeFAPp68Ez5VFHaV5pebHO',
    // callbackURL: "https://snap-hire.com/api/google/callback",
    callbackURL: 'http://localhost:8080/api/google/callback',
  },

  // AWS S3
  awsS3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // 3. Express Server Port
  LISTEN_PORT: process.env.LISTEN_PORT || 3000,
};
