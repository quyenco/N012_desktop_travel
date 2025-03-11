import axios, {AxiosResponse} from 'axios';
import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL;

export interface CustomAxiosResponse<T = any> extends AxiosResponse<T> {
  statusCode?: number;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 phút
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${accessToken ?? ''}`,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('accessToken');
    config.headers.Authorization = `Bearer ${accessToken ?? ''}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // xử lý response trước khi trả về
    // console.log('response', response);

    if (response.status === 200) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Xử lý lỗi toàn cục
    // Nếu lỗi 401 và không phải là request để làm mới token
    // if (error.response.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true; // Đánh dấu để không lặp lại việc làm mới token
    //   try {
    //     const refreshToken = Cookies.get('refreshToken');
    //     const refreshResponse = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
    //       refreshToken: refreshToken,
    //     });
    //     console.log('refreshResponse ở file config: ', refreshResponse);
    //     const newAccessToken = refreshResponse.data.accessToken;
    //     Cookies.set('accessToken', newAccessToken); // Cập nhật accessToken mới vào cookie
    //     // Cập nhật header Authorization với accessToken mới
    //     axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
    //     originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    //     // Thực hiện lại request ban đầu với accessToken mới
    //     return axiosInstance(originalRequest);
    //   } catch (err) {
    //     // Nếu làm mới token thất bại, điều hướng về trang login hoặc xử lý phù hợp
    //     console.error('Làm mới token thất bại:', err);
    //     Cookies.remove('accessToken');
    //     Cookies.remove('refreshToken');
    //   }
    // }

    return Promise.reject(error); // Trả về lỗi nếu không phải lỗi 401 hoặc đã xử lý hết
  }
);

export default axiosInstance;
