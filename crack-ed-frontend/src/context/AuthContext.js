import React, { createContext, useState, useEffect } from "react";
import { loginUser,registerUser,logoutUser,sendLoginUserOtp,sendRegisterUserOtp,sendCallbackDetailAPI ,sendCallbackUserOtp,sendCallbackUser } from '../controllers/authController';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [isStaff, setIsStaff] = useState(false);
  const [authLoading, setLoading] = useState(true);  // Loading state
  const [authError, setAuthError] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false); // ✅ Done checking
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    console.log(token);
    if(token!==null){
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [isAuthenticated]);


  const login = async (phone, otp) => {
    setLoading(true);
    try {
      const response = await loginUser(phone, otp);
      setIsAuthenticated(true);
      setLoading(false);
      // Set application_id if present
      if (response && response.application_id) {
        localStorage.setItem('application_id', response.application_id);
      }
      return true;
    } catch (error){
      setLoading(false);
      if(error){
        setAuthError({"type":"error","message":error});
      }else{
        setAuthError({"type":"error","message":"Error While Login"});
      }
      console.log("Error in login",error);
      return false;
    }
  };
  const sendLoginOtp = async (phone) => {
    setLoading(true);
    try {
      const response = await sendLoginUserOtp(phone); 
      setLoading(false);
      setAuthError({"type":"success","message":"Otp Sent Successfully"}); // Set the success state
      return true;
    } catch (error){
      setLoading(false);
      if(error){
        setAuthError({"type":"error","message":error}); // Set the error state
      }else{
        setAuthError({"type":"error","message":"Error Sending OTP"}); // Set the error state
      }
      console.log("Error in login otp",error);
      return false;
    }
  };

  const logout = () => {
    setLoading(true);
    logoutUser();
    setIsAuthenticated(false);
    setAuthError({"type":"success","message":"Logout Success"}); // Set the success state
    setLoading(false);
  };  



  const register = async (name,email,mobile,otp) => {
    setLoading(true);
    try{
      const resp=await registerUser(name,email,mobile,otp);
      setIsAuthenticated(true);
      setLoading(false);
      // Set application_id if present
      if (resp && resp.application_id) {
        localStorage.setItem('application_id', resp.application_id);
      }
      console.log("sending auth success");
      return true;
    }catch(error){
      setLoading(false);
      if(error){
        setAuthError({"type":"error","message":error});
      }else{
        setAuthError({"type":"error","message":"Error in register "});
      }
      console.log("Error in register",error);
      return false;
    }
  }; 
  
  const addCallback = async (mobile,otp) => {
    setLoading(true);
    try{
      const resp=await sendCallbackUser(mobile,otp);
      setLoading(false);
      console.log("sending auth success");
      // setAuthError({"type":"success","message":"Register Successfully"}); // Set the success state
      return true;
    }catch(error){
      setLoading(false);
      if(error){
        setAuthError({"type":"error","message":error}); // Set the error state
      }else{
        setAuthError({"type":"error","message":"Error in register "}); // Set the error state
      }
      console.log("Error in register",error);
      return false;
    }
  }; 
  
  const sendRegisterOtp = async (name,email,mobile) => {

    setLoading(true);
    try{
      const resp=await sendRegisterUserOtp(name,email,mobile);
      setLoading(false);
      setAuthError({"type":"success","message":"OTP Sent Successfully"}); 
      return true;
    }catch(error){
      setLoading(false);
      if(error){
        setAuthError({"type":"error","message":error}); // Set the error state
      }else{
        setAuthError({"type":"error","message":"Error sending OTP!!"}); // Set the error state
      }
      console.log("Error in register otp",error);
      return false;

    }
    setLoading(false);
  }; 
  
  const sendCallbackOtp = async (name,email,city,mobile) => {
    setLoading(true);
    try{
      const resp=await sendCallbackUserOtp(name,email,city,mobile);
      setLoading(false);
      setAuthError({"type":"success","message":"OTP Sent Successfully"}); 
      return true;
    }catch(error){
      setLoading(false);
      if(error){
        setAuthError({"type":"error","message":error}); // Set the error state
      }else{
        setAuthError({"type":"error","message":"Error sending OTP!!"}); // Set the error state
      }
      console.log("Error in register otp",error);
      return false;

    }
    setLoading(false);
  }; 
  
  const sendCallbackDetails = async (first_name,last_name,email,phone) => {
    setLoading(true);
    try{
      const resp=await sendCallbackDetailAPI(first_name,last_name,email,phone);
      setLoading(false);
      setAuthError({"type":"success","message":"We will get back to you soon"}); // Set the success state

      return resp;
    }catch(error){
      setLoading(false);
      setAuthError({"type":"error","message":"Error sending details"}); // Set the error state

      console.log("Error in callback details",error);
    }
    setLoading(false);
  };
  // if (loading) {
  //   return <div>Loading...</div>;  // Show a loading indicator until auth status is determined
  // }

  return (
    <AuthContext.Provider value={{ isAuthenticated,authLoading,login,logout,register,sendLoginOtp,sendCallbackOtp,sendRegisterOtp,sendCallbackDetails,addCallback, authError, setAuthError}}>
      {children}
    </AuthContext.Provider>
  );
};