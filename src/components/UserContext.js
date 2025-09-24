import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Retrieved user from storage:", storedUser);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Checking for stored token:", token);
  
    if (token && !user) {
      console.log("Token found. Verifying user...");
      axios
        .get("http://localhost:4000/api/user/verify-user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("User verified:", res.data.user);
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch((err) => {
          console.error("User verification failed:", err);
          logout();
        });
    }
  
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error("Token expired. Redirecting to login.");
          logout();
        }
        return Promise.reject(error);
      }
    );
  
    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
    };
  
    // eslint-disable-next-line
  }, []);
  

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingOtp");
    setUser(null);
    navigate('/login');
    console.log("User logged out successfully.");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};