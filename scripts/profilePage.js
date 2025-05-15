import { fetchProfile, fetchMyListings } from "./profile.js";
import { initializeCreateListingModal } from "./create-listing.js";

/**
 * Initializes the profile page with user data
 * @async
 * @returns {Promise<void>}
 */
export async function initializeProfile() {
  const userName = localStorage.getItem("userName");

  if (!userName) {
    console.error("No userName found in localStorage");
    window.location.href = "/pages/login.html";
    return;
  }

  try {
    const profile = await fetchProfile(userName);
    

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

export async function displayMyListings() {
  const myListingsContainer = document.getElementById("myListingsContainer");
  const listings = await fetchMyListings();

  if (!listings || listings.length === 0) {
    myListingsContainer.innerHTML = "<p>You have no listings.</p>";
    return;
  }

  myListingsContainer.innerHTML = ""; // Clear existing content

  listings.forEach((listing) => {
    const listingElement = document.createElement("div");
    listingElement.className = "listing";

    const mediaContent =
      listing.media && listing.media.length > 0
        ? `<img src="${listing.media[0].url}" alt="${listing.title}" style="max-width: 100px; max-height: 100px;" />`
        : "";

    listingElement.innerHTML = `
      <h3>${listing.title}</h3>
      ${mediaContent}
      <p>${listing.description || "No description available."}</p>
      <p>Ends At: ${new Date(listing.endsAt).toLocaleString()}</p>
      <p>Bids: ${listing._count?.bids || 0}</p>
      <button class="edit-listing-button" data-id="${listing.id}" data-listing='${JSON.stringify(
      listing
    )}'>Edit</button>
    `;

    myListingsContainer.appendChild(listingElement);
  });
}

export async function initializeEditModal() {
  const modal = document.getElementById("editListingModal");
  const closeModalButton = document.getElementById("closeEditListingModal");
  const editListingForm = document.getElementById("editListingForm");
  const deleteListingButton = document.getElementById("deleteListingButton");

  let currentListingId = null; // Store the ID of the listing being edited

  // Open the modal and populate it with the selected listing's data
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-listing-button")) {
      const listingId = event.target.dataset.id;
      currentListingId = listingId;

      // Fetch the listing data
      const listing = event.target.dataset.listing
        ? JSON.parse(event.target.dataset.listing)
        : null;

      if (listing) {
        document.getElementById("editListingTitle").value = listing.title;
        document.getElementById("editListingDescription").value = listing.description;
        document.getElementById("editListingDeadline").value = new Date(listing.endsAt)
          .toISOString()
          .slice(0, 16); // Format for datetime-local input
        document.getElementById("editListingMedia").value = listing.media
          .map((media) => media.url)
          .join(", ");
      }

      modal.style.display = "block";
    }
  });

  // Close the modal
  closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Handle form submission for editing the listing
  editListingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("editListingTitle").value.trim();
    const description = document.getElementById("editListingDescription").value.trim();
    const deadline = new Date(document.getElementById("editListingDeadline").value).toISOString();
    const mediaInput = document.getElementById("editListingMedia").value;
    const media = mediaInput
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url)
      .map((url) => ({ url }));

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiUrl = `https://v2.api.noroff.dev/auction/listings/${currentListingId}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
        },
        body: JSON.stringify({ title, description, endsAt: deadline, media }),
      });

      if (!response.ok) {
        throw new Error("Failed to update listing.");
      }

      alert("Listing updated successfully!");
      modal.style.display = "none";
      displayMyListings(); // Refresh the listings
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing. Please try again.");
    }
  });

  // Handle delete action
  deleteListingButton.addEventListener("click", async () => {
    if (!currentListingId) return;

    const confirmDelete = confirm("Are you sure you want to delete this listing?");
    if (!confirmDelete) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiUrl = `https://v2.api.noroff.dev/auction/listings/${currentListingId}`;

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing.");
      }

      alert("Listing deleted successfully!");
      modal.style.display = "none";
      displayMyListings(); // Refresh the listings
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("/pages/profile.html")) {
    initializeCreateListingModal(); // Initialize the "Create Listing" modal
  }
});


