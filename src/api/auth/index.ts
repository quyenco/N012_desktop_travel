import axios, {CustomAxiosResponse} from '../axiosConfig';

interface ILoginRequest {
  username: string;
  password: string;
}

export const login = async (data: ILoginRequest): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post('/api/v1/auth/login', data);
    return res;
  } catch (error) {
    console.log(error);
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
