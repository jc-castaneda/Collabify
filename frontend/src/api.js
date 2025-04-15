const API_URL = "http://127.0.0.1:8000/api/";

/*export const fetchProfiles = async () => {
  try {
    const response = await fetch(`${API_URL}profiles/`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching profiles:", error);
  }
};*/


// Mock functions for friend requests (to be connected to real API later)
export const fetchProfiles = async () => {
  try {
    // If the backend API isn't working yet, use mock data
    // Remove this mock data once your backend is working
    return [
      { 
        id: 1, 
        username: "JazzMaster", 
        bio: "Jazz pianist and composer with 10+ years experience",
        user_type: "2", // Musician
        interests: ["Jazz", "Blues", "Composition"] 
      },
      { 
        id: 2, 
        username: "BeatProducer", 
        bio: "Hip-hop and R&B producer looking for vocalists",
        user_type: "1", // Producer
        interests: ["Hip-Hop", "R&B", "Beats"] 
      },
      { 
        id: 3, 
        username: "VocalQueen", 
        bio: "Soul and R&B vocalist seeking producers for collaboration",
        user_type: "3", // Singer
        interests: ["Soul", "R&B", "Vocal Arrangement"] 
      }
    ];
    
    // When ready to use the real API, uncomment this:
    // const response = await fetch(`${API_URL}profiles/`);
    // return await response.json();
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return []; // Return empty array instead of undefined on error
  }
};

export const fetchFriends = async () => {
  // Mock data - replace with actual API call later
  return [
    { id: 4, username: "singer1", user_type: "3", bio: "Professional vocalist" },
    { id: 5, username: "musician2", user_type: "2", bio: "Guitarist and songwriter" }
  ];
};

export const sendFriendRequest = async (userId) => {
  // Mock implementation - replace with actual API call later
  console.log(`Sending friend request to user ${userId}`);
  return { success: true, message: "Friend request sent" };
};

export const acceptFriendRequest = async (requestId) => {
  // Mock implementation - replace with actual API call later
  console.log(`Accepting friend request ${requestId}`);
  return { success: true, message: "Friend request accepted" };
};

export const rejectFriendRequest = async (requestId) => {
  // Mock implementation - replace with actual API call later
  console.log(`Rejecting friend request ${requestId}`);
  return { success: true, message: "Friend request rejected" };
};

export const fetchFriendRequests = async () => {
  // Mock data - replace with actual API call later
  return [
    {
      id: 10,
      from: {
        id: 6,
        username: "DrummerDude",
        user_type: "2",
        bio: "Session drummer looking to join a band",
      },
    },
    {
      id: 11,
      from: {
        id: 7,
        username: "SynthWizard",
        user_type: "1",
        bio: "Synthwave producer into retro vibes",
      },
    },
  ];
};
 