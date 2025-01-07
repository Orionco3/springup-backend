const cron = require('node-cron');
const autoStageComplete = require('./autoStageComplete');

cron.schedule('*/4 * * * * *', async () => {
    await autoStageComplete();
});