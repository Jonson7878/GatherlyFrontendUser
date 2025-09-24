import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import sidebarImage from '../assets/dashboard.png';


const CommonSidebar = ({ imageSrc, title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <img
        src={logo}
        alt="Company Logo"
        className="company-logo"
        onClick={() => navigate('/')}
      />
      <h2>{title || 'Hi, Welcome back'}</h2>
      <p>{subtitle || 'More effectively with optimized workflows.'}</p>

      {/* eslint-disable-next-line */}
      <img
        src={imageSrc || sidebarImage}
        alt="Sidebar Image"
        className="sidebar-image"
      />
    </div>
  );
};

export default CommonSidebar;
