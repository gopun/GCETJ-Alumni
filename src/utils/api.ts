import axios from 'axios';

type RequestData = Record<string, string | number | boolean>;
type FileData = { file: File; name: string };

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    console.error(
      `API Error [${status}]: ${error.response?.data?.message || error.message}`,
    );
    return Promise.reject(error);
  },
);

const sendFormData = async (
  url: string,
  data: RequestData,
  files: FileData[],
  method: 'post' | 'put' | 'patch',
  setLoading?: (loading: boolean) => void, // Optional callback
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  files.forEach((file) => {
    formData.append(file.name, file.file);
  });

  try {
    if (setLoading) setLoading(true); // Start loading
    const response = await apiClient[method](url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error while uploading file:', error);
    throw error;
  } finally {
    if (setLoading) setLoading(false); // End loading
  }
};

const uploadFiles = async (
  url: string,
  data: RequestData,
  files: FileData[],
  method: 'post' | 'put' | 'patch' = 'post',
  setLoading?: (loading: boolean) => void, // Optional callback
) => sendFormData(url, data, files, method, setLoading);

export { sendFormData, uploadFiles };
export default apiClient;
