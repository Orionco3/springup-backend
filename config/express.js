const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const path = require('path');
const passport = require('passport');

global.appRoot = path.resolve(__dirname);

const app = express();
app.use(cors());
app.use('/api/static', express.static('public')); // Static public assets
app.use('/api', express.static('upload'));
app.use('/', express.static('upload'));


app.use(logger('dev'));
app.use(bodyParser.urlencoded({ limit: '5000mb', extended: true }));

// only use the bodyParser for routes other than webhooks
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
      next();
  } else {
      bodyParser.json({ limit: '20mb' })(req, res, next);
  }
});


module.exports = app;
