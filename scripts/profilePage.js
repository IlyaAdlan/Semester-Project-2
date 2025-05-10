import { fetchProfile, updateProfile } from "./profile.js";

console.log("profilePage.js loaded");

/**
 * Initializes the profile page with user data
 * @async
 * @returns {Promise<void>}
 */
export async function initializeProfile() {
  console.log("initializeProfile called");
  const userName = localStorage.getItem("userName");
  console.log("Stored userName:", userName);

  if (!userName) {
    console.error("No userName found in localStorage");
    window.location.href = "/pages/login.html";
    return;
  }

  try {
    const profile = await fetchProfile(userName);
    console.log("Fetched Profile:", profile);

    if (!profile) {
      throw new Error("Failed to fetch profile.");
    }

    // Populate profile data
    document.getElementById("profileName").textContent = profile.data.name;
    document.getElementById("profileEmail").textContent = profile.data.email;

    // Set avatar only if it exists
    if (profile.data.avatar) {
      document.getElementById("profileAvatar").src = profile.data.avatar;
    } else {
      document.getElementById("profileAvatar").removeAttribute("src");
    }

    document.getElementById("profileCredits").textContent =
      profile.data.credits || 0;

    // Handle avatar update
    const avatarForm = document.getElementById("avatarForm");
    avatarForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const avatarUrl = document.getElementById("avatarUrl").value.trim(); // Ensure it's a string

      try {
        console.log("Avatar URL:", avatarUrl); // Debugging log
        const updatedProfile = await updateProfile({ avatar: avatarUrl }); // Pass the URL as a string
        if (updatedProfile) {
          document.getElementById("profileAvatar").src = updatedProfile.avatar;
          alert("Avatar updated successfully!");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update avatar. Please try again.");
      }
    });

    // Handle logout
    const logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "/pages/login.html";
    });
  } catch (error) {
    console.error("Error initializing profile:", error);
    alert("Error loading profile. Please try again.");
  }
}

