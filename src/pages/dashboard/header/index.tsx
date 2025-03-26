import { faBell, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Dropdown, Button } from "antd";
import Avatar from "../../../components/avatar";
import avatarImg from "../../../assets/images/anh-avatar-cute-58.jpg";
import logoImg from "../../../assets/images/logo.png";
import "./index.css";

const Header: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Menu dropdown khi click vào avatar
  const avatarMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        🚪 Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="flex h-[10%] bg-custom justify-between items-center rounded-lg mt-1 mx-1 px-4">
      <div className="flex items-center">
        <img src={logoImg} alt="Logo" className="h-10 w-auto" />
        <h1
          className="text-2xl font-bold text-gray-700"
          style={{ fontFamily: "Dancing Script, cursive" }}
        >
          TADA
        </h1>
      </div>

      <div className="flex items-center">
        <div className="px-3" onClick={() => alert("Thông báo")}>
          <FontAwesomeIcon icon={faBell} />
        </div>

        <div className="px-3" onClick={() => alert("Đổi ngôn ngữ")}>
          <FontAwesomeIcon icon={faLanguage} />
        </div>

        {/* Avatar + Menu dropdown */}
        <Dropdown overlay={avatarMenu} trigger={["click"]} visible={menuVisible} onVisibleChange={setMenuVisible}>
          <button className="px-3">
            <Avatar src={avatarImg} height={40} width={40} />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
