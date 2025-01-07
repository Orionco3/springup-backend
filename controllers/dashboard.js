
const User = require('../models/user');
const { SendEmail } = require('../_utils/email_Send');
var mongoose = require('mongoose');
const { rejectJobEmail } = require('../emailTemplate/emailtemplate');
