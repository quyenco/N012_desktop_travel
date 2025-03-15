import React, {useState, useRef, useEffect} from 'react';
import {faGripLinesVertical} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import Header from './header';
import './index.css';
import Cookies from 'js-cookie';
import { Outlet, useNavigate } from 'react-router-dom';



const userRole = Cookies.get('userRole');
const userId = Cookies.get('userId');

console.log('Role:', userRole);
console.log('UserId:', userId);







const Dashboard: React.FunctionComponent = () => {
  const {t} = useTranslation();
  const [width, setWidth] = useState(240);
  const resizerRef = useRef<HTMLDivElement>(null);
  const maxWidth = 300;
  const minWidth = 200;

  // navigate
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');



  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    const startX = e.clientX;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = width + e.clientX - startX;
      if (newWidth > maxWidth || newWidth < minWidth) {
        return;
      }
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };



// 
const menuItems = [
  { key: 'home', label: 'Trang chủ', path: 'home' },
  { key: 'tours', label: 'Quản lý tour', path: 'tours' },
  { key: 'employees', label: 'Quản lý nhân viên', path: 'employees' },
  { key: 'discounts', label: 'Quản lý khuyến mãi', path: 'discounts' },
  { key: 'customers', label: 'Quản lý khách hàng', path: 'customers' },
  { key: 'reports', label: 'Thống kê', path: 'reports' },
];

const handleMenuClick = (key: string, path: string) => {
  setActiveMenu(key);
  navigate(path);
};




  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
        setData(response);
      } catch (err) {
        setError(err);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);




  useEffect(() => {
    navigate("home"); // 🔥 Load mặc định "home" khi vào Dashboard
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header />

      <div className="flex w-full h-[90%]">
        <div className="bg-gray-800 text-white p-4 m-1 rounded-lg" style={{width}}>
          <h2 className="text-2xl mb-4">Thanh Quản Lý</h2>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.key}
                className={`mb-2 p-2 cursor-pointer rounded-md text-center transition-colors ${
                  activeMenu === item.key
                    ? 'bg-green-500 text-white'
                    : 'hover:bg-green-300'
                }`}
                onClick={() => handleMenuClick(item.key, item.path)}
              >
                {item.label}
              </li>
            ))}
          </ul>
          {/* <ul>
            <li className="mb-2">Trang chủ</li>
            <li className="mb-2">Quản lý tour</li>
            <li className="mb-2">Quản lý nhân viên</li>
            <li className="mb-2">Quản lý khuyến mãi</li>
            <li className="mb-2">Quản lý khách hàng</li>
            <li className="mb-2">Thống kê</li>
          </ul> */}
        </div>

        <div className="resizer" ref={resizerRef} onMouseDown={onMouseDown}>
          <FontAwesomeIcon icon={faGripLinesVertical} size={'sm'} opacity={0.5} />
        </div>

        {/* <div className="flex-1 bg-gray-100 p-6 m-1 rounded-lg overflow-y-scroll">
          <h1 className="text-3xl mb-4">Nội Dung Trang</h1>
          <p>{t('title')}</p>
          <h1>Todo Data</h1>
          {error && <p>Error: {error}</p>}
          {data ? <pre>{JSON.stringify(data.data, null, 2)}</pre> : <p>Loading...</p>}
        </div> */}

        <div className="flex-1 bg-gray-100 p-6 m-1 rounded-lg overflow-y-scroll">
          <Outlet />

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
