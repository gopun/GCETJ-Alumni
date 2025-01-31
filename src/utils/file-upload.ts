import moment from 'moment';

const FOLDER_NAME = {
  profile: 'Profile-Pics',
  degree: 'Certificates',
};

export const uploadFile = async (
  file: File,
  selectedFolder: 'profile' | 'degree',
  fileName: string,
) => {
  if (file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append('cloud_name', cloudName);
    formData.append('folder', FOLDER_NAME[selectedFolder]);
    formData.append(
      'public_id',
      `${FOLDER_NAME[selectedFolder]}/${fileName}-${moment().format('YYYY-MM-DD HH:mm:ss')}`,
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return { error };
    }
  }
};
