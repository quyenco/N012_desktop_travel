import {faBell, faLanguage, faMessage} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import Avatar from '../../../components/avatar';
import avatarImg from '../../../assets/images/anh-avatar-cute-58.jpg';
import logoImg from '../../../assets/images/logo.png';
import './index.css';

interface HeaderProps {}

const Header: React.FC = () => {
  return (
    <div className="flex h-[10%] bg-custom justify-between items-center rounded-lg mt-1 mx-1 px-4">
      <div className="flex items-center">
        <img src={logoImg} alt="Logo" className="h-10 w-auto" />
        <h1 className="text-2xl font-bold text-gray-700" style={{fontFamily: 'Dancing Script, cursive'}}>TADA
        </h1>
      </div>
      <div className="flex items-center">
        {/* <div className="px-3" onClick={() => alert('ATin nhắnT')}>
          <FontAwesomeIcon icon={faMessage} />
        </div> */}
        <div className="px-3" onClick={() => alert('Thong báo')}>
          <FontAwesomeIcon icon={faBell} />
        </div>
        <div className="px-3" onClick={() => alert('AVT')}>
          <FontAwesomeIcon icon={faLanguage} />
        </div>
        <button className="px-3" onClick={() => alert('AVT')}>
          <Avatar src={avatarImg} height={40} width={40} />
        </button>
      </div>
    </div>
  );
};

export default Header;
