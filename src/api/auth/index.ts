import axios, {CustomAxiosResponse} from '../axiosConfig';
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ILoginRequest {
  email: string;
  password: string;
}

export const login = async (data: ILoginRequest): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    // console.log("API URL:", `${API_URL}/api/users/login`);
    const res = await axios.post(`${API_URL}/api/users/login`, data);
    return res;
  } catch (error:any) {
    toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
  }
};

export const getInfo = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get('/api/v1/users/get-profile');
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (refreshToken: string): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post('/api/v1/auth/logout', {refreshToken: refreshToken});
    return res;
  } catch (error) {
    console.log(error);
  }
};
