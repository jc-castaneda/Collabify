const API_URL = "http://127.0.0.1:8000/api/";

export const fetchProfiles = async () => {
  try {
    const response = await fetch(`${API_URL}profiles/`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching profiles:", error);
  }
};
