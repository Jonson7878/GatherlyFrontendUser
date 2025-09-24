import React from 'react';
import logo from '../assets/logo.png';
import sidebarImage from '../assets/forget.jpg';

const ForgotPasswordSidebar = () => {

  return (
    <div className="sidebar">
        <div>
      <img
        src={logo}
        alt="Company Logo"
        className="company-logo"
      />
      </div>
      <h2>Forgot Password</h2>
      <p>We'll help you reset it quickly.</p>

      <img
        src={sidebarImage}
        alt="Sidebar Visual"
        className="sidebar-image"
      />
    </div>
  );
};

export default ForgotPasswordSidebar;
