const apiUrl = "https://v2.api.noroff.dev/auction/listings";

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Move this OUTSIDE so it's always the same reference!
async function handleCreateListingSubmit(event) {
  event.preventDefault();

  const modal = document.getElementById("createListingModal");
  const createListingForm = document.getElementById("createListingForm");

  const title = document.getElementById("listingTitle").value.trim();
  const description = document.getElementById("listingDescription").value.trim();
  const deadlineInput = document.getElementById("listingDeadline").value;
  const deadline = new Date(deadlineInput).toISOString();
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  if (new Date(deadlineInput) <= now) {
    alert("The deadline must be a future date.");
    return;
  }

  if (new Date(deadlineInput) > oneYearFromNow) {
    alert("The deadline cannot be more than one year from now.");
    return;
  }

  const mediaInput = document.getElementById("listingMedia").value;
  const media = mediaInput
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url && isValidUrl(url))
    .map((url) => ({ url }));

  if (media.length === 0) {
    alert("Please provide at least one valid media URL.");
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must be logged in to create a listing.");
      return;
    }

    const requestBody = {
      title,
      description,
      endsAt: deadline,
      media,
    };

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
      alert(`Error: ${errorData.errors.map((err) => err.message).join(", ")}`);
      throw new Error(`Failed to create listing: ${response.statusText}`);
    }

    const data = await response.json();

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

    alert("Listing created successfully!");
    modal.style.display = "none";
    createListingForm.reset();
  } catch (error) {
    console.error("Error creating listing:", error);
    alert("Failed to create listing. Please try again.");
  }
}

export function initializeCreateListingModal() {
  const modal = document.getElementById("createListingModal");
  const openModalButton = document.getElementById("openCreateListingModal");
  const closeModalButton = document.getElementById("closeCreateListingModal");
  const createListingForm = document.getElementById("createListingForm");

  if (!modal || !openModalButton || !closeModalButton || !createListingForm) {
    console.warn("Create Listing modal elements not found on this page.");
    return;
  }

  openModalButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Remove and add the event listener with the same function reference
  createListingForm.removeEventListener("submit", handleCreateListingSubmit);
  createListingForm.addEventListener("submit", handleCreateListingSubmit);
}