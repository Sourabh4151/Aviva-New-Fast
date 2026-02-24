import axios from "axios";

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8000",
});

// Add interceptor to include the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = "Bearer " + localStorage.getItem("TOKEN");
    return config;
  },
  (error) => Promise.reject(error)
);

export const get_application_data_api = async () => {
  try {
    console.log("getting data");
    const response = await axiosInstance.get("/dataset/get-application-data/");
    console.log("data received" + response.data);
    return response.data;
  } catch (error) {
    console.log("error - " + error.response.data.error);
    throw error.response.data.error || "Not Found";
  }
};

export const get_payment_screen = async () => {
  try {
    console.log("getting data");
    const response = await axiosInstance.get("/payment");
    console.log("data received" + response.data);
    // return response.data;
  } catch (error) {
    console.log("error - " + error.response.data.error);
    throw error.response.data.error || "Not Found";
  }
};

export const get_all_district_data = async () => {
  try {
    console.log("getting data get_all_district_data");
    const response = await axiosInstance.get("/districts");
    return response.data;

  } catch (error) {
    console.log("error - " + error.response.data.error);
    throw error.response.data.error || "Not Found";
  }
};

export const get_all_university_data = async () => {
  try {
    console.log("getting data get_all_university_data");
    const response = await axiosInstance.get("/universities");
    return response.data;
    
  } catch (error) {
    console.log("error - " + error.response.data.error);
    throw error.response.data.error || "Not Found";
  }
};

export const update_application_data_api = async (data) => {
  try {
    console.log("getting data");
    const fileFields = [
      "passport_photo", "aadhar_front", "aadhar_back", "pan_card",
      "ug_certificate", "pg_certificate", "resume"
    ];
    const formData = new FormData();
    console.log("data", data["data"]);
    for (const key in data["data"]) {
      if(key in fileFields) continue; // skip file fields for now
      console.log("key", key, "value",  data["data"][key]);

      if ( data["data"][key] !== null &&  data["data"][key] !== undefined) {
        formData.append(key, data["data"][key]);
      }
    }

   
    fileFields.forEach((field) => {
      const file = data["data"]?.[field];
      if (file && file instanceof File) {
        console.log("key", field, "value", file);
        formData.append(field, file);
      }
    });
    
    console.log("FormData:", formData);
    const axiosInstanceMulti = axios.create({
      baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8000",
    });
    const response = await axiosInstanceMulti.post("/dataset/update-application-data/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization":  "Bearer " + localStorage.getItem("TOKEN") 
      }
    });

    console.log("data received", response.data);
    return response.data;

  } catch (error) {
    console.log("error - " + error?.response?.data?.error);
    throw error?.response?.data?.error || "Not Found";
  }
};
