const cons = require('consolidate');
const path = require('path');

const emailTemplatesPath = path.join(__dirname, '../emailTemplate');

async function generateHtmlBodyContent(filename, data) {
    try {
        return cons.swig(path.join(emailTemplatesPath, filename), data);
    } catch (err) {
        console.error({ AddDataInHtmlError: err });
        return false;
    }
}

module.exports = {
    generateHtmlBodyContent,
};
