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
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [openSubMenuKey, setOpenSubMenuKey] = useState<string | null>(null);

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
  { key: 'categories', label: 'Quản lý danh mục', path: 'categories' },
  { key: 'bookings', label: 'Quản lý đơn đặt', path: 'bookings' },
  { key: 'employees', label: 'Quản lý nhân viên', path: 'employees' },
  { key: 'discounts', label: 'Quản lý khuyến mãi', path: 'discounts' },
  { key: 'customers', label: 'Quản lý khách hàng', path: 'customers' },

  // { key: 'reports', label: 'Thống kê', path: 'reports' },
  {
    key: 'reports',
    label: 'Thống kê',
    path: '',
    submenu: [
      { key: 'report-booking', label: 'Thống kê doanh thu', path: 'report-booking' },
      { key: 'report-revenue', label: 'Thống kê đơn đặt', path: 'report-revenue' },
    ],
  },
];

// const handleMenuClick = (key: string, path: string) => {
//   setActiveMenu(key);
//   navigate(path);
// };
const handleMenuClick = (key: string, path: string, hasSubmenu: boolean = false) => {
  if (hasSubmenu) {
    // Nếu submenu đang mở, nhấn lại sẽ đóng
    setOpenSubMenuKey(openSubMenuKey === key ? null : key);
  } else {
    setActiveMenu(key);
    navigate(path);
    setOpenSubMenuKey(null); // Ẩn submenu khi chuyển trang
  }
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
        className={`mb-2 p-2 cursor-pointer rounded-md text-left pl-2 text-bold transition-colors ${
          activeMenu === item.key ? 'bg-green-500 text-white' : 'hover:bg-green-300'
        }`}
        onClick={() => handleMenuClick(item.key, item.path, !!item.submenu)}
      >
        {item.label}

        {/* Hiển thị submenu khi openSubMenuKey === item.key */}
        {item.submenu && openSubMenuKey === item.key && (
          <ul className="mt-2 bg-gray-700 text-white shadow-md rounded-md">
            {item.submenu.map((subItem) => (
              <li
                key={subItem.key}
                className="px-4 py-2 hover:bg-green-400 cursor-pointer"
                onClick={() => handleMenuClick(subItem.key, subItem.path)}
              >
                {subItem.label}
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>

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
