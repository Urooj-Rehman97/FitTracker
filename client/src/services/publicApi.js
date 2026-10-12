
const API_BASE_URL = "https://fittracker-4ifk.onrender.com/api";

const publicRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Public API request failed (${response.status})`
    );
  }

  return data;
};

export const getPublicHome = async () => {
  return publicRequest("/public/home");
};

export default publicRequest;
