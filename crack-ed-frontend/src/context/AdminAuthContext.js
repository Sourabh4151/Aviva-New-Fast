import React, { createContext, useState, useEffect } from "react";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    const role = localStorage.getItem("admin_role");
    
    if (token && user && role) {
      setIsAdminAuthenticated(true);
      setAdminUser(JSON.parse(user));
    }
    setAdminLoading(false);
  }, []);

  const login = (token, user) => {
    try {
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(user));
      localStorage.setItem("admin_role", user.role);
      setIsAdminAuthenticated(true);
      setAdminUser(user);
      setAdminError(null);
      return true;
    } catch (error) {
      console.error("Error in admin login:", error);
      setAdminError("Login failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_role");
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setAdminError(null);
  };

  const updateUser = (updatedUser) => {
    setAdminUser(updatedUser);
    localStorage.setItem("admin_user", JSON.stringify(updatedUser));
  };

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
        adminUser, 
        adminLoading, 
        adminError, 
        login, 
        logout, 
        updateUser,
        setAdminError 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}; 