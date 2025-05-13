const apiUrl = "https://v2.api.noroff.dev/auction/listings";

/**
 * Initializes the "Create Listing" modal and form submission
 */
export function initializeCreateListingModal() {
  const modal = document.getElementById("createListingModal");
  const openModalButton = document.getElementById("openCreateListingModal");
  const closeModalButton = document.getElementById("closeCreateListingModal");
  const createListingForm = document.getElementById("createListingForm");

  // Open the modal
  openModalButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close the modal
  closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Handle form submission
  createListingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("listingTitle").value.trim();
    const description = document.getElementById("listingDescription").value.trim();
    const deadlineInput = document.getElementById("listingDeadline").value;
    const deadline = new Date(deadlineInput).toISOString();
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    // Validate deadline
    if (new Date(deadlineInput) <= now) {
      alert("The deadline must be a future date.");
      return;
    }

    if (new Date(deadlineInput) > oneYearFromNow) {
      alert("The deadline cannot be more than one year from now.");
      return;
    }

    // Validate and prepare the media field
    const mediaInput = document.getElementById("listingMedia").value;
    const media = mediaInput
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url && isValidUrl(url))
      .map((url) => ({ url })); // Convert each URL into an object with a "url" property

    if (media.length === 0) {
      alert("Please provide at least one valid media URL.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      console.log("Access Token:", accessToken); // Debugging log
      console.log("Authorization Header:", `Bearer ${accessToken}`);
      if (!accessToken) {
        alert("You must be logged in to create a listing.");
        return;
      }

      const requestBody = {
        title,
        description,
        endsAt: deadline,
        media, // Media array
      };
      console.log("Request Body:", requestBody); // Debugging log

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
          },
          body: JSON.stringify(requestBody),
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error Response Data:", errorData); // Debugging log
          alert(`Error: ${errorData.errors.map((err) => err.message).join(", ")}`);
          throw new Error(`Failed to create listing: ${response.statusText}`);
        }
      
        const data = await response.json();
        console.log("API Response Data:", data); // Debugging log

        // Fetch the created listing to verify the seller
        const listingId = data.data.id;
        const listingResponse = await fetch(`${apiUrl}/${listingId}?_seller=true`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
          },
        });

        if (!listingResponse.ok) {
          throw new Error(`Failed to fetch created listing: ${listingResponse.statusText}`);
        }

        const listingData = await listingResponse.json();
        console.log("Fetched Created Listing:", listingData); // Debugging log
        console.log("Seller/Owner of the Listing:", listingData.data.seller);

        alert("Listing created successfully!");
        modal.style.display = "none"; // Close the modal

        // Clear the form
        createListingForm.reset();
      } catch (error) {
        console.error("Error creating listing:", error);
        alert("Failed to create listing. Please try again.");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    }
  });

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}