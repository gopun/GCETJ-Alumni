const sendEmail = require("../../config/mailer");
const Notification = require("../../schema/notification");
const User = require("../../schema/user");

module.exports = {
  uploadCertificate: async (req, res) => {
    try {
      if (!req.body.userId) {
        return res.status(422).send("Unable to send");
      }
      const userData = await User.findOne({ _id: req.body.userId });
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userData.email,
        subject: "Action Required - Complete Your Action",
        html: `
        <html>
        <head>
          <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Action Required</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f7fc;
                color: #333;
              }
              .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .email-header h1 {
                font-size: 24px;
              }
              .email-body {
                margin-bottom: 20px;
              }
              .email-body p {
                font-size: 16px;
                line-height: 1.5;
              }
              .action-button {
                display: inline-block;
                color: #ffffff;
                padding: 12px 20px;
                text-decoration: none;
                font-size: 16px;
                border-radius: 5px;
                text-align: center;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <h1>Action Required</h1>
              </div>
              <div class="email-body">
                <p>Dear User,</p>
                <p>Please upload your any certificate which contains your registration number:</p>
                <a href="${process.env.FRONT_END_URL}" class="action-button">Take Action</a>
              </div>
              <div class="footer">
                <p>If already uploaded, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
        `,
      };
      await sendEmail(mailOptions);
      const savePayload = {
        toUserId: req.session.user._id,
        fromUserId: userData._id,
        type: "CERTIFICATE_UPLOAD",
      };
      const notification = new Notification(savePayload);
      await notification.save();
      return res.success("Successfully sent");
    } catch (error) {
      console.error("Error uploadCertificate notification..", error);
      return res.status(500).send(error);
    }
  },
};
