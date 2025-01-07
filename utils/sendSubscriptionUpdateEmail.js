const { DateTime } = require('luxon');

const User = require('../models/user');
const Subscription = require('../models/subscription');

const { SendEmail } = require('../_utils/email_Send');
const { generateHtmlBodyContent } = require('./AddDataInHtml');

const TEST_EMAIL_ADDRESS = process.env.TESTING_EMAIL_ADDRESS;
const SUBSCRIPTION_EMAILS_ENABLED = process.env.SEND_SUBSCRIPTION_EMAILS === 'true';

function formatPrice(amount) {
    const price = (amount / 100).toFixed(0);
    return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

exports.sendSubscriptionUpdateEmail = async function sendSubscriptionUpdateEmail(userId, subscriptionId, update) {
    if (!SUBSCRIPTION_EMAILS_ENABLED) {
        console.log('Sending subscription emails is not enabled in the .env file. Returning...');
        return;
    }

    const user = await User.findById(userId).exec();
    if (!user) {
        return;
    }

    const subscription = await Subscription.findOne({ userId, stripeSubscriptionId: subscriptionId }).sort({ _id: -1 }).populate('subscriptionId').exec();
    if (!subscription) {
        return;
    }

    // Calculate the subscription price
    const billingPeriod = subscription.type.replace('ly', '');

    const basePrice = subscription.subscriptionId?.pricing || 0;
 

    const emailData = {
        name: user.userName,
        planName: subscription.subscriptionId.title,
        startDate: DateTime.fromJSDate(subscription.periodStart).toLocaleString(DateTime.DATE_SHORT),
        endDate: DateTime.fromJSDate(subscription.periodEnd).toLocaleString(DateTime.DATE_SHORT),
        price: formatPrice(basePrice),
        billingPeriod,
    };

    let template = '';
    let subject = '';
  if (update === 'purchased') {
        template = 'new-subscription.html';
        subject = 'New Subscription Purchased';
    } else if (update === 'renewed') {
        template = 'subscription-renew.html';
        subject = 'Subscription Renewed Automatically';
    }

    const recipientEmailAddress = process.env.SERVER_ENV === 'production' ? user.email : TEST_EMAIL_ADDRESS;
    const emailBody = await generateHtmlBodyContent(template, emailData);
    SendEmail(recipientEmailAddress, subject, emailBody);
};
