import API from "./api";

export const registerUser = async (userData) => {
  try {
    const response = await API.post("/user/register", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/user/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
