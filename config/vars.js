require("dotenv").config();

console.log(process.env.baseURL);
module.exports = {
  // 1. MongoDB
  mongo: {
    uri: process.env.MONGO_URI,
  },

  // 2. JWT
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,

  baseURL: process.env.baseURL,
  serverURL: process.env.serverURL,

  // 3. Express Server Port
  LISTEN_PORT: process.env.PORT,

  // AWS S3
  awsS3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  stripeKey: {
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },

  googleClientID: process.env.googleClientID,
  googleClientSecret: process.env.googleClientSecret,
  googleClientCallback: process.env.googleClientCallback,

  linkedinClientID: process.env.linkedinClientID,
  linkedinClientSecret: process.env.linkedinClientSecret,
  linkedinCallbackURL: process.env.linkedinCallbackURL,
};
