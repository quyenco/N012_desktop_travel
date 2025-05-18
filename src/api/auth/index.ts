import axios, {CustomAxiosResponse} from '../axiosConfig';
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://18.138.107.49:8080";

export const LOCAL_STORAGE_TOKEN = 'TOKEN';
export const LOCAL_STORAGE_REFRESHTOKEN = 'REFRESHTOKEN';
export const LOCAL_STORAGE_TOKEN_EXPIRES_IN = 'TOKEN_EXPIRES_IN';
export const LOCAL_STORAGE_USER_INFO = 'user_info';

interface ILoginRequest {
  email: string;
  password: string;
}

export const login = async (data: ILoginRequest): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, null, {
      params: {
        email: data.email,
        password: data.password,
      },
    });

    if (res.status === 200) {
      const { token, refreshToken, user } = res.data;

      localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_REFRESHTOKEN, refreshToken);
      localStorage.setItem(LOCAL_STORAGE_USER_INFO, JSON.stringify(user));

      toast.success('Đăng nhập thành công!');
      window.location.href = '/dashboard';
    }
    return res;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
  }
};

// export const login = async (data: ILoginRequest): Promise<CustomAxiosResponse<any> | undefined> => {
//   try {
//     // console.log("API URL:", `${API_URL}/api/users/login`);
//     // const res = await axios.post(`${API_URL}/api/users/login`, data);
//     const res = await axios.post(`${API_URL}/api/auth/login`, null, { 
//       params: { 
//         email: data.email, 
//         password: data.password 
//       }
//     });
//     return res;
//   } catch (error:any) {
//     toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
//   }
// };

// export const getInfo = async (): Promise<CustomAxiosResponse<any> | undefined> => {
//   try {
//     const res = await axios.get('/api/v1/users/get-profile');
//     return res;
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getInfo = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/users/get-profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN)}` },
    });
    return res;
  } catch (error) {
    console.log('Lỗi lấy thông tin:', error);
  }
};


export const logout = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESHTOKEN);
    const res = await axios.post(`${API_URL}/api/v1/auth/logout`, { refreshToken });

    localStorage.removeItem(LOCAL_STORAGE_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_REFRESHTOKEN);
    localStorage.removeItem(LOCAL_STORAGE_USER_INFO);

    toast.success('Đăng xuất thành công!');
    window.location.href = '/login';
    return res;
  } catch (error) {
    console.log('Lỗi khi đăng xuất:', error);
  }
};


export const refreshToken = async (): Promise<void> => {
  try {
    const currentRefreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESHTOKEN);
    const res = await axios.post(`${API_URL}/api/auth/refreshToken`, { refreshToken: currentRefreshToken });

    if (res.status === 200) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN, res.data.token);
      localStorage.setItem(LOCAL_STORAGE_REFRESHTOKEN, res.data.refreshToken);
    }
  } catch (error) {
    console.log('Lỗi làm mới token:', error);
    localStorage.clear();
    window.location.href = '/login';
  }
};

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshToken();
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);
