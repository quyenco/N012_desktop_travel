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
    if (phone && password) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  }, [phone, password]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    // setIsLoading(true);
    // const res = await login({username: phone, password: password});
    // if (res?.statusCode === 200) {
    //   console.log('res', res.data.user);
    //   dispatch(setUserInfo(res.data.user));
    //   Cookies.set('accessToken', res.data.accessToken, {expires: 1 / 24, secure: true});
    //   Cookies.set('refreshToken', res.data.refreshToken, {expires: 7, secure: true});
    //   setIsLoading(false);
    // }

    setIsLoading(true);
    try {
      const res = await login({email: phone, password: password});

      const parsedRes = typeof res === "string" ? JSON.parse(res) : res;

      console.log('api nhận được:', parsedRes);

      
      if (parsedRes.role?.trim().toUpperCase() === "ADMIN") {
        const user = res;
        // Lưu thông tin và token
        // Cookies.set('accessToken', parsedRes.accessToken, {expires: 1 / 24});
        Cookies.set('userRole', parsedRes.role, { expires: 1 / 24 });
      Cookies.set('userId', parsedRes.userId, { expires: 1 / 24 });


        
        // toast.success("Đăng nhập thành công!", {
        //   onClose: () => navigate("/dashboard"),
        // });
        window.location.href= '/dashboard';
        
        console.log('sau navigate');
      } else {
        console.log('sai tài khoản')
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
