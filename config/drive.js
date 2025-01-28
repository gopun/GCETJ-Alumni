const { google } = require("googleapis");
const fs = require("fs");

const PARENT_FOLDER = "GCETJ Alumni";
const CERTIFICATE_FOLDER = PARENT_FOLDER + "/" + "Certificates";
const PROFILE_PIC_FOLDER = PARENT_FOLDER + "/" + "Profile-Pics";

const createDriveClient = (
  clientId,
  clientSecret,
  redirectUri,
  refreshToken
) => {
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  client.setCredentials({ refresh_token: refreshToken });

  return google.drive({
    version: "v3",
    auth: client,
  });
};

const createFolder = async (folderPath) => {
  const folders = folderPath.split("/");
  let parentId = null;

  try {
    for (let i = 0; i < folders.length; i++) {
      const folderName = folders[i];

      const folder = await searchFolderByName(folderName, parentId);

      if (!folder) {
        const createdFolder = await createNewFolder(folderName, parentId);
        parentId = createdFolder.id;
      } else {
        parentId = folder.id;
      }
    }

    return parentId;
  } catch (err) {
    throw new Error(err);
  }
};

const createNewFolder = (folderName, parentId = null) => {
  return new Promise((resolve, reject) => {
    driveClient.files.create(
      {
        resource: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: parentId ? [parentId] : [],
        },
        fields: "id, name",
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res.data);
      }
    );
  });
};

const searchFolderByName = (folderName, parentId = null) => {
  return new Promise((resolve, reject) => {
    const parentQuery = parentId ? `'${parentId}' in parents and ` : "";
    driveClient.files.list(
      {
        q: `${parentQuery}mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: "files(id, name)",
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res.data.files ? res.data.files[0] : null);
      }
    );
  });
};

const searchFolder = (folderPath) => {
  return new Promise(async (resolve, reject) => {
    const folders = folderPath.split("/");
    let parentId = null;

    try {
      for (let i = 0; i < folders.length; i++) {
        const folderName = folders[i];
        const folder = await searchFolderByName(folderName, parentId);
        if (!folder) {
          return resolve(null);
        }

        parentId = folder.id; // Set the parentId for the next iteration
      }
      resolve(parentId); // Return the final folder ID (child folder)
    } catch (err) {
      reject(err);
    }
  });
};

const saveFile = (fileName, filePath, fileMimeType, folderId = "") => {
  return driveClient.files.create({
    requestBody: {
      name: fileName,
      mimeType: fileMimeType,
      parents: folderId ? [folderId] : [],
    },
    media: {
      mimeType: fileMimeType,
      body: fs.createReadStream(filePath),
    },
  });
};

const saveOrUpdateFile = async (
  fileName,
  filePath,
  fileMimeType,
  folderId = ""
) => {
  try {
    const searchQuery = `'${folderId}' in parents and name='${fileName}' and trashed=false`;
    const existingFiles = await driveClient.files.list({
      q: searchQuery,
      fields: "files(id, name)",
    });

    let fileId;
    if (existingFiles.data.files.length > 0) {
      fileId = existingFiles.data.files[0].id;
    }

    if (fileId) {
      const updatedFile = await driveClient.files.update({
        fileId: fileId,
        media: {
          mimeType: fileMimeType,
          body: fs.createReadStream(filePath),
        },
        fields: "id, name",
      });
      return updatedFile.data;
    } else {
      const newFile = await driveClient.files.create({
        requestBody: {
          name: fileName,
          mimeType: fileMimeType,
          parents: folderId ? [folderId] : [],
        },
        media: {
          mimeType: fileMimeType,
          body: fs.createReadStream(filePath),
        },
        fields: "id, name",
      });
      return newFile.data;
    }
  } catch (error) {
    console.error("Error saving or updating file:", error);
    throw error;
  }
};

const searchFolderByPath = async (folderPath) => {
  const folderNames = folderPath.split("/");
  let parentId = null;

  for (const folderName of folderNames) {
    const folder = await searchFolder(folderName, parentId);
    parentId = folder.id;
  }

  return parentId;
};

const driveClient = createDriveClient(
  process.env.GOOGLE_DRIVE_CLIENT_ID || "",
  process.env.GOOGLE_DRIVE_CLIENT_SECRET || "",
  process.env.GOOGLE_DRIVE_REDIRECT_URI || "",
  process.env.GOOGLE_DRIVE_REFRESH_TOKEN || ""
);

module.exports = {
  CERTIFICATE_FOLDER,
  PROFILE_PIC_FOLDER,
  createFolder,
  searchFolder,
  saveFile,
  searchFolderByPath,
  saveOrUpdateFile,
};
