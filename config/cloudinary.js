const cloudinary = require("cloudinary").v2;

const PARENT_FOLDER = "GCETJ Alumni";
const CERTIFICATE_FOLDER = PARENT_FOLDER + "/" + "Certificates";
const PROFILE_PIC_FOLDER = PARENT_FOLDER + "/" + "Profile-Pics";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (filePath, folderName, fileName) => {
  return new Promise((resolve, reject) => {
    const publicId = `${folderName}/${fileName}`;

    cloudinary.uploader.upload(
      filePath,
      { public_id: publicId },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

module.exports = {
  cloudinary,
  uploadFile,
  CERTIFICATE_FOLDER,
  PROFILE_PIC_FOLDER,
};
