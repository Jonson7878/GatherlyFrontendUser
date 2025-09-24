import React from 'react';
import '../App.css';
import logo from '../assets/logo.png';

const FormContainer = ({ children }) => {
  return (
    <div className="container">
      <div className="left-side">
        <img src={logo} alt="Company Logo" className="company-logo" />
      </div>
      <div className="right-side">{children}</div>
    </div>
  );
};

export default FormContainer;
