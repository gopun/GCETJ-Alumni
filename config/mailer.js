// mailer.js
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set the refresh token (you will get this after you authenticate)
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Cache for the access token
let cachedAccessToken = null;
let tokenExpiryTime = null;

// Function to refresh the token and cache it
async function refreshAccessToken() {
  try {
    const { token, expiry_date } = await oauth2Client.getAccessToken();
    cachedAccessToken = token;
    tokenExpiryTime = expiry_date;
    console.log("Access token refreshed");
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error; // Let the caller handle this error
  }
}

// Function to get the access token, refresh if needed
async function getAccessToken() {
  const currentTime = Date.now();
  if (!cachedAccessToken || currentTime >= tokenExpiryTime) {
    await refreshAccessToken(); // Refresh the token if expired or doesn't exist
  }
  return cachedAccessToken;
}

// Create a transporter object using OAuth2
async function sendEmail(mailOptions) {
  const accessToken = await getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken, // Access token obtained from OAuth2
    },
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
