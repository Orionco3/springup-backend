const axios = require("axios");

const apiUrl = "https://api.brevo.com/v3/smtp/email";
const apiKey =
  "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"; // Replace with your actual API key

exports.SendEmail = (to, subject, html) => {
  try {
    const requestData = {
      sender: {
        name: "Spring Hunts",
        email: "app@springhunts.com",
      },
      to: [
        {
          email: to.email,
          name: to.name,
        },
      ],
      subject: subject,
      htmlContent: html,
    };

    const headers = {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    };

    axios
      .post(apiUrl, requestData, { headers })
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } catch (error) {
    // console.error(error);
    console.error(error.response.body.errors);
  }
};
