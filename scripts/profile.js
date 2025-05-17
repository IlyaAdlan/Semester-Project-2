const apiUrl = "https://v2.api.noroff.dev/social/profiles";

/**
 * Fetches a user's profile data
 * @async
 * @param {string} userName - Username to fetch
 * @returns {Promise<Object|null>} Profile data or null
 */
export async function fetchProfile(userName) {
  const apiUrl = "https://v2.api.noroff.dev/auction/profiles";
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token found. Please log in.");
  }

  try {
    const response = await fetch(`${apiUrl}/${userName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

/**
 * Updates a user's profile data
 * @async
 * @param {Object} profileData - Data to update (e.g., avatar, banner)
 * @returns {Promise<Object|null>} Updated profile data or null
 */
export async function updateProfile(profileData) {
  try {
    const token = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName");

    if (!token || !userName) {
      throw new Error("No access token or username found. Please log in.");
    }

    console.log("Authorization Header:", `Bearer ${token}`);
    console.log("Profile Data:", profileData);

    const response = await fetch(`${apiUrl}/${userName}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`, // Add the Authorization header
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294", // Corrected the closing quote
      },
      body: JSON.stringify(profileData), // Ensure profileData is serialized as JSON
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Profile updated successfully:", data); // Debugging log
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

/**
 * Fetches the user's listings
 * @async
 * @returns {Promise<Array>} User's listings or an empty array
 */
export async function fetchMyListings() {
  const apiUrl = "https://v2.api.noroff.dev/auction/profiles";
  const userName = localStorage.getItem("userName");
  const accessToken = localStorage.getItem("accessToken");

  console.log("Fetching listings for user:", userName); // Debugging log

  try {
    const response = await fetch(`${apiUrl}/${userName}/listings`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const { data } = await response.json();
    console.log("Fetched Profile Data:", data); // Debugging log
    console.log("User Listings:", data || "No listings found"); // Debugging log

    return data || []; // Return an empty array if listings are undefined
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return [];
  }
}