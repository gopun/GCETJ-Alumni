const {
  searchFolder,
  saveFile,
  createFolder,
  CERTIFICATE_FOLDER,
  PROFILE_PIC_FOLDER,
  saveOrUpdateFile,
} = require("../config/drive");
const fs = require("fs");
const User = require("../schema/user");
const { uploadFile } = require("../config/cloudinary");

module.exports = {
  getUserData: async (req, res) => {
    try {
      return res.status(200).json({ user: req.session.user });
    } catch (error) {
      console.error("Error getting user:", error.message);
      return res.status(500).send(error);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const files = req.files;
      const fileConfig = {
        saveResp: { profile: "", degree: "" },
        foldername: { profile: PROFILE_PIC_FOLDER, degree: CERTIFICATE_FOLDER },
      };

      for (const fieldName of Object.keys(files)) {
        const file = files[fieldName][0];
        if (file) {
          const filePath = file.path;
          const fileName =
            req.session.user.regNumber +
            "." +
            (file.mimetype.endsWith("pdf") ? "pdf" : file.mimetype.slice(6));

          const folderName = fileConfig.foldername[fieldName];

          try {
            const cloudinaryUploadResult = await uploadFile(
              filePath,
              folderName,
              fileName
            );

            fileConfig.saveResp[fieldName] = cloudinaryUploadResult.secure_url;
          } catch (error) {
            console.error(
              `Cloudinary upload failed for field ${fieldName}:`,
              error
            );
          } finally {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`Failed to delete file ${filePath}:`, err);
              }
            });
          }
        }
      }

      const updateRecord = {
        email: req.body.email,
        name: req.body.name,
        mobileNumber: req.body.mobileNumber,
        certificateImage:
          fileConfig.saveResp.degree || req.session.user.certificateImage,
        userImage: fileConfig.saveResp.profile || req.session.user.userImage,
      };

      const updatedUser = await User.findOneAndUpdate(
        { regNumber: req.session.user.regNumber },
        updateRecord,
        { new: true }
      );
      const finalUser = updatedUser.toJSON();
      delete finalUser.password;
      req.session.user = { ...req.session.user, ...finalUser };
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
      });
      return res.success(finalUser);
    } catch (error) {
      console.error("Error saving file:", error);
      return res.status(500).send(error);
    }
  },
};
