const jwt = require("jsonwebtoken");
const sendEmail = require("../config/mailer");
const User = require("../schema/user");
const { splitRegNumber } = require("../services/utils");

module.exports = {
  signup: async (req, res) => {
    try {
      const savePayload = {
        ...req.body,
        batch: splitRegNumber(req.body.regNumber, "batch"),
        department: splitRegNumber(req.body.regNumber, "dept"),
        status: "Active",
      };
      const user = new User(savePayload);
      await user.save();
      req.session.user = { ...user.toJSON(), password: undefined };
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).send("Failed to save session");
        }
        return res.success(req.session.user);
      });
    } catch (error) {
      console.error("Error creating user:", error.message);
      return res.status(500).send(error);
    }
  },
  login: async (req, res) => {
    try {
      const userData = await User.findOne({
        regNumber: req.body.regNumber,
        status: {
          $ne: "Inactive",
        },
      });
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await userData.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = { ...userData.toJSON(), password: undefined };
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).send("Failed to save session");
        }
        return res.success({
          message: "Login successful",
          user: req.session.user,
        });
      });
    } catch (error) {
      console.error("Error Login user:", error.message);
      return res.status(500).send(error);
    }
  },
  logout: async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        return res.success("Logged out successfully");
      });
    } catch (error) {
      console.error("Error logout user:", error.message);
      return res.status(500).send(error);
    }
  },
  sendPasswordLink: async (req, res) => {
    try {
      const userData = await User.findOne({ regNumber: req.body.regNumber });
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
      const resetToken = jwt.sign(
        { email: userData.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      const resetLink = `${process.env.FRONT_END_URL}/auth/reset-password/${resetToken}`;

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userData.email,
        subject: "Password Reset",
        text: `Click the link to reset your password: ${resetLink}`,
      };
      await sendEmail(mailOptions);
      return res.success("Successfully sent");
    } catch (error) {
      console.error("Error sending email to user:", error);
      return res.status(500).send(error);
    }
  },
  restPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const updatedUser = await User.findOneAndUpdate(
        { email: decoded.email },
        { password: req.body.password },
        { new: true }
      );
      console.log("\n updatedUser..", updatedUser.toJSON());

      return res.success("Password has been reset successfully");
    } catch (error) {
      return res.status(400).send("Invalid or expired reset token");
    }
  },
};
