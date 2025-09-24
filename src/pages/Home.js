import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';

function Home() {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="company-logo" 
          onClick={() => navigate('/')} 
        />
        <button className="sign-in-button" onClick={handleSignInClick}>Sign In</button>
      </header>

      {/* Main Section */}
      <main className="home-main">
        <h1>Welcome to <span className="highlight">Company Management</span></h1>
        <p>Effortlessly manage your company operations and employees with our powerful platform.</p>
      </main>
    </div>
  );
}

export default Home;