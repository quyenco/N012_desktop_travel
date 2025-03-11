import React, {useState, useRef, useEffect} from 'react';
import {faGripLinesVertical} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import Header from './header';
import './index.css';

const Dashboard: React.FunctionComponent = () => {
  const {t} = useTranslation();
  const [width, setWidth] = useState(240);
  const resizerRef = useRef<HTMLDivElement>(null);
  const maxWidth = 300;
  const minWidth = 200;

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

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header />

      <div className="flex w-full h-[90%]">
        <div className="bg-gray-800 text-white p-4 m-1 rounded-lg" style={{width}}>
          <h2 className="text-2xl mb-4">Thanh Quản Lý</h2>
          <ul>
            <li className="mb-2">Trang 1</li>
            <li className="mb-2">Trang 2</li>
            <li className="mb-2">Trang 3</li>
          </ul>
        </div>

        <div className="resizer" ref={resizerRef} onMouseDown={onMouseDown}>
          <FontAwesomeIcon icon={faGripLinesVertical} size={'sm'} opacity={0.5} />
        </div>

        <div className="flex-1 bg-gray-100 p-6 m-1 rounded-lg overflow-y-scroll">
          <h1 className="text-3xl mb-4">Nội Dung Trang</h1>
          <p>{t('title')}</p>
          <h1>Todo Data</h1>
          {error && <p>Error: {error}</p>}
          {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
