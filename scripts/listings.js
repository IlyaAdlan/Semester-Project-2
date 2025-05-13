import { initializeSearch } from "./search.js";

const apiUrl = "https://v2.api.noroff.dev/auction/listings";

export async function fetchListings(fetchAll = false, limit = 10, page = 1) {
  try {
    const url = fetchAll
      ? `${apiUrl}?_bids=true` // Fetch all listings with bids
      : `${apiUrl}?limit=${limit}&page=${page}&_bids=true`; // Fetch paginated listings with bids

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const { data, meta } = await response.json();
    console.log("Fetched Listings with Bids:", data); // Debugging log
    return { data, meta };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: [], meta: { nextPage: null, previousPage: null, totalCount: 0 } };
  }
}

export function renderListings(listings) {
  const listingsContainer = document.getElementById("listingsContainer");

  if (!Array.isArray(listings)) {
    console.error("Expected an array for listings, but got:", listings);
    listingsContainer.innerHTML = "<p>Failed to load listings. Please try again later.</p>";
    return;
  }

  if (listings.length === 0) {
    listingsContainer.innerHTML = "<p>No listings available.</p>";
    return;
  }

  listingsContainer.innerHTML = ""; // Clear existing content

  listings.forEach((listing) => {
    const listingElement = document.createElement("div");
    listingElement.className = "listing";

    const mediaContent = listing.media?.length > 0 ? `<img src="${listing.media[0]}" alt="${listing.title}" />` : "";

    // Calculate the highest bid
    const highestBid = listing.bids?.length > 0
      ? Math.max(...listing.bids.map((bid) => bid.amount))
      : "No bids yet";

    listingElement.innerHTML = `
      <h3>${listing.title}</h3>
      ${mediaContent}
      <p>${listing.description || "No description available."}</p>
      <p>Ends At: ${new Date(listing.endsAt).toLocaleString()}</p>
      <p>Bids: ${listing._count?.bids || 0}</p>
      <p>Highest Bid: ${highestBid}</p>
      <button class="bid-button" data-id="${listing.id}">Place Bid</button>
    `;

    listingsContainer.appendChild(listingElement);
  });
}

// filepath: c:\Users\ADLAN\Documents\GitHub\Semester-Project-2\scripts\listings.js
export async function initializeListingsPage() {
  console.log("Initializing listings page...");

  let currentPage = 1; // Start on the first page
  const listingsPerPage = 10; // Number of listings per page

  // Initialize search functionality
  initializeSearch();

  async function loadPage(page) {
    try {
      const listingsContainer = document.getElementById("listingsContainer");
      listingsContainer.innerHTML = "<p>Loading...</p>"; // Show loading message

      const { data, meta } = await fetchListings(false, listingsPerPage, page); // Fetch paginated listings
      renderListings(data);

      console.log("Pagination Meta:", meta);

      document.getElementById("prevPage").disabled = meta.previousPage === null;
      document.getElementById("nextPage").disabled = meta.nextPage === null;

      currentPage = page;
    } catch (error) {
      console.error("Error loading page:", error);
      alert("Failed to load listings. Please try again later.");
    }
  }

  // Event listener for "Previous" button
  document.getElementById("prevPage").addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Previous button clicked");
    if (currentPage > 1) {
      loadPage(currentPage - 1); // Load the previous page
    }
  });

  // Event listener for "Next" button
  document.getElementById("nextPage").addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Next button clicked");
    loadPage(currentPage + 1); // Load the next page
  });

  // Load the first page
  loadPage(currentPage);
}

export function initializeBidModal() {
  const modal = document.getElementById("bidModal");
  const closeModalButton = document.getElementById("closeBidModal");
  const bidForm = document.getElementById("bidForm");

  let currentListingId = null; // Store the ID of the listing being bid on

  // Open the modal when a "Bid" button is clicked
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("bid-button")) {
      currentListingId = event.target.dataset.id;
      modal.style.display = "block";
    }
  });

  // Close the modal
  closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Handle form submission for placing a bid
  bidForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bidAmount = parseFloat(document.getElementById("bidAmount").value);

    if (isNaN(bidAmount) || bidAmount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiUrl = `https://v2.api.noroff.dev/auction/listings/${currentListingId}/bids`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
        },
        body: JSON.stringify({ amount: bidAmount }),
      });

      if (!response.ok) {
        throw new Error("Failed to place bid.");
      }

      alert("Bid placed successfully!");
      modal.style.display = "none";
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Please try again.");
    }
  });
}