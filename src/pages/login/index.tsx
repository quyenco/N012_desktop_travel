import React, {useEffect, useState} from 'react';
import TextInput from '../../components/text-input';
import BG from '../../assets/images/background.png';
import Divider from '../../components/divider';
import {login} from '../../api/auth';
import LoadingSpinner from '../../components/loading-spinner';
import {useDispatch} from 'react-redux';
import {setUserInfo} from '../../redux/slices/userInfoSlice';
import Cookies from 'js-cookie';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import { ipcRenderer } from 'electron';

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isFilled, setIsFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setIsFilled(!!phone && !!password);
  }, [phone, password]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await login({ email: phone, password });
      
      if (res) {
        
        const { accessToken, refreshToken, user } = res;
        console.log("api user:", user);
        console.log("role:", user.role);
        console.log("status:", user.status);

        if ((user.role?.toUpperCase() === "ADMIN" || user.role?.toUpperCase() === "EMPLOYEE") && user.status?.toUpperCase() === "ACTIVE") {
          console.log("sau if");
          dispatch(setUserInfo(user));
          Cookies.set('accessToken', accessToken, { expires: 1 / 24, secure: true });
          Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true });
          Cookies.set('userRole', user.role, { expires: 1 / 24 });
          Cookies.set('userId', user.userId, { expires: 1 / 24 });
          toast.success("Đăng nhập thành công!");
          localStorage.setItem("userRole", user.role);
          navigate('/dashboard');
        } else {
          toast.error('Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa!');
        }
      } else {
        toast.error('Sai tài khoản hoặc mật khẩu!');
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      toast.error('Có lỗi xảy ra! Vui lòng thử lại.');
    }

    setIsLoading(false);
  };

  return (
    <div
      className="relative w-full h-screen flex justify-center items-center bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${BG})`,
      }}
    >
      <div className="flex items-center bg-white flex-col px-6 py-8 rounded-xl shadow-xl">
        <p className="text-black font-bold text-2xl">LOGIN</p>
        <Divider size={20} />
        <TextInput value={phone} className="w-[250px]" changeText={setPhone} placeholder="Tên đăng nhập" type="text" />
        <Divider size={20} />
        <TextInput
          value={password}
          className="w-[250px]"
          changeText={setPassword}
          placeholder="Mật khẩu"
          type="password"
        />

        <Divider size={20} />
        <button
          className={`bg-blue-500 text-white w-[250px] h-[40px] rounded-xl`}
          disabled={!isFilled}
          onClick={(e) => handleLogin(e)}
        >
          {isLoading ? <LoadingSpinner /> : 'Đăng nhập'}
        </button>
      </div>

      <div className="absolute bottom-2 text-white">Version: 1.0.0 {API_URL ?? ''}</div>
    </div>
  );
};

export default Login;
