import axios from "axios";

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL:process.env.REACT_APP_BASE_URL || "http://localhost:8000",
});

// Add interceptor to include the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = process.env.REACT_APP_JWT_TOKEN;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Register a new user
 * @param {string} username - User's name
 * @param {string} role - User's role
 * @param {string} password - User's password
 * @returns {Promise<object>} Response data
 */

const saveToken = async (data) => {
  console.log("Saving data: ", data);
  localStorage.setItem("TOKEN", data.token);
  localStorage.setItem("USER_NAME", data.username);
  console.log("Saved data: ", data);
}

export const registerUser = async (name, email, mobile, otp) => {
  try {
    const response = await axiosInstance.post("/auth/register/", {
      "name": name,
      "email": email,
      "mobile": mobile,
      "otp": otp,
    });
    await saveToken(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration failed";
  }
};

export const sendCallbackUser = async (mobile, otp) => {
  try {
    const response = await axiosInstance.post("/auth/callback/", {
      "mobile": mobile,
      "otp": otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Callback failed";
  }
};

export const sendRegisterUserOtp = async (name, email, mobile) => {
  try {
    const response = await axiosInstance.post("/auth/registerOtp/", {
      "name": name,
      "email": email,
      "mobile": mobile,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration OTP failed";
  }
};

export const sendCallbackUserOtp = async (name, email,city,mobile) => {
  try {
    const response = await axiosInstance.post("/auth/callbackOtp/", {
      "name": name,
      "email": email,
      "city": city,
      "mobile": mobile,
    });
    console.log("Response from sendCallbackUserOtp:", response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration OTP failed";
  }
};

/**
 * Login a user
 * @param {string} username - User's name
 * @param {string} password - User's password
 * @returns {Promise<object>} Response data
 */
export const loginUser = async (phone, otp) => {
  try {
    const response = await axiosInstance.post("/auth/login/", {
      "mobile": phone,
      "otp": otp,
    });
    await saveToken(response.data);
    return response.data; // Return the response data to the component
  } catch (error) {
    throw error.response.data?.message || "Login failed";
  }
};

export const sendLoginUserOtp = async (phone) => {
  try {
    const response = await axiosInstance.post("/auth/loginOtp/", {
      "mobile": phone
    });
    return response.data; // Return the response data to the component
  } catch (error) {
    throw error.response.data?.message || "Login Otp failed";
  }
};

export const sendCallbackDetailAPI = async (first_name,last_name,email,phone) => {
  try {
    console.log(first_name,last_name,email,phone)
    const response = await axiosInstance.post("/auth/callback/", {
     "fname": first_name,
     "lname": last_name,
      "email": email,
      "mobile": phone,
    });
    return response.data; // Return the response data to the component
  } catch (error) {
    throw error.response.data || "Login Otp failed";
  }
};


export const logoutUser = async () => {
  try {
    localStorage.clear();
  } catch (error) {
    throw error.response?.data?.message || "Logout failed";
  }
};