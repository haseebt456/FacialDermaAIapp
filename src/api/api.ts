import axios from "axios";

// ✅ Replace this with your actual backend URL
const BASE_URL = "http://10.0.2.2:5000/api"; // or localhost if using emulator

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    console.log("API response:", response.data);
    return response.data; // expected: { token, user }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    } else {
      throw new Error("Network error, please try again");
    }
  }
};
