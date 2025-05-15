import { initializeSearch } from "./search.js";

const apiUrl = "https://v2.api.noroff.dev/auction/listings";

export async function fetchListings(fetchAll = false, limit = 10, page = 1, sortBy = "", filters = {}) {
  try {
    let url = fetchAll
      ? `${apiUrl}?_bids=true`
      : `${apiUrl}?limit=${limit}&page=${page}&_bids=true`;

    // Apply filters
    if (filters.minBid) {
      url += `&minBid=${filters.minBid}`;
    }
    if (filters.maxBid) {
      url += `&maxBid=${filters.maxBid}`;
    }

    if (filters.status === "active") {
      url += `&endsAt_gte=${new Date().toISOString()}`; // Active auctions
    } else if (filters.status === "ended") {
      url += `&endsAt_lt=${new Date().toISOString()}`; // Ended auctions
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const { data, meta } = await response.json();
    return { data, meta };
  } catch (error) {
    return { data: [], meta: { nextPage: null, previousPage: null, totalCount: 0 } };
  }
}

export function renderListings(listings) {
  const listingsContainer = document.getElementById("listingsContainer");

  if (!Array.isArray(listings)) {
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
    listingElement.className = "listing-card";

    const validMedia = listing.media?.filter((media) => isValidUrl(media.url)) || [];
    const mediaContent = validMedia.length > 0
      ? `<img src="${validMedia[0].url}" alt="${listing.title}" />`
      : "";

    const highestBid = listing.bids?.length > 0
      ? Math.max(...listing.bids.map((bid) => bid.amount))
      : "No bids yet";

    listingElement.innerHTML = `
      <a href="item.html?id=${listing.id}" class="auction-link">
        <div class="listing-media">
          ${mediaContent}
        </div>
        <div class="listing-details">
          <h3>${listing.title}</h3>
          <p>${listing.description || "No description available."}</p>
          <p><strong>Ends At:</strong> ${new Date(listing.endsAt).toLocaleString()}</p>
          <p><strong>Bids:</strong> ${listing._count?.bids || 0}</p>
          <p><strong>Highest Bid:</strong> ${highestBid}</p>
        </div>
      </a>
      <button class="btn-primary bid-button" data-id="${listing.id}">Place Bid</button>
    `;

    listingsContainer.appendChild(listingElement);
  });
}

// filepath: c:\Users\ADLAN\Documents\GitHub\Semester-Project-2\scripts\listings.js
export async function initializeListingsPage() {

  let currentPage = 1; // Start on the first page
  const listingsPerPage = 10; // Number of listings per page
  let currentSort = ""; // Default sorting
  let currentFilters = {}; // Default filters
  let allListings = []; // Store all listings for client-side sorting and pagination

  // Initialize search functionality
  initializeSearch();

  async function loadPage(page, sortBy = currentSort, filters = currentFilters) {
    try {

      const listingsContainer = document.getElementById("listingsContainer");
      const loadingSpinner = document.getElementById("loadingSpinner");

      listingsContainer.innerHTML = ""; // Clear existing content
      loadingSpinner.style.display = "block"; // Show spinner

      // Fetch all listings if sorting or filtering is applied
      if (sortBy || Object.keys(filters).length > 0) {
        const { data } = await fetchListings(true, listingsPerPage, page, sortBy, filters); // Fetch all listings
        allListings = data;

        // Apply client-side filtering for Min Bid and Max Bid
        if (filters.minBid) {
          allListings = allListings.filter((listing) => {
            const highestBid = listing.bids?.length > 0 ? Math.max(...listing.bids.map((bid) => bid.amount)) : 0;
            return highestBid >= filters.minBid;
          });
        }
        if (filters.maxBid) {
          allListings = allListings.filter((listing) => {
            const highestBid = listing.bids?.length > 0 ? Math.max(...listing.bids.map((bid) => bid.amount)) : 0;
            return highestBid <= filters.maxBid;
          });
        }

        // Apply sorting
        if (sortBy === "highestBid") {
          allListings.sort((a, b) => {
            const highestBidA = a.bids?.length > 0 ? Math.max(...a.bids.map((bid) => bid.amount)) : 0;
            const highestBidB = b.bids?.length > 0 ? Math.max(...b.bids.map((bid) => bid.amount)) : 0;
            return highestBidB - highestBidA; // Descending order
          });
        } else if (sortBy === "mostRecent") {
          allListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Descending order
        } else if (sortBy === "endingSoon") {
          allListings.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt)); // Ascending order
        }
      } else {
        // Fetch only the current page if no sorting or filtering is applied
        const { data } = await fetchListings(false, listingsPerPage, page, sortBy, filters);
        allListings = data;
      }

      // Paginate the sorted and filtered data
      const startIndex = (page - 1) * listingsPerPage;
      const paginatedListings = allListings.slice(startIndex, startIndex + listingsPerPage);

      renderListings(paginatedListings);

      loadingSpinner.style.display = "none"; // Hide spinner

      // Update the current page and pagination controls
      currentPage = page;
      currentSort = sortBy;
      currentFilters = filters;
      document.getElementById("currentPage").textContent = `Page ${currentPage}`;
      document.getElementById("prevPage").disabled = currentPage === 1;
      document.getElementById("nextPage").disabled = startIndex + listingsPerPage >= allListings.length;
    } catch (error) {
      console.error("Error loading page:", error);
    }
  }

  // Event listener for sorting dropdown
  document.getElementById("sortOptions").addEventListener("change", (event) => {
    const sortBy = event.target.value;
    loadPage(1, sortBy); // Reload the first page with the selected sorting
  });

  // Event listener for filters
  document.getElementById("applyFilters").addEventListener("click", () => {
    const minBid = parseFloat(document.getElementById("minBid").value) || null;
    const maxBid = parseFloat(document.getElementById("maxBid").value) || null;
    const status = document.getElementById("auctionStatus").value;

    const filters = { minBid, maxBid, status };
    loadPage(1, currentSort, filters); // Reload the first page with filters
  });

  // Event listener for "Previous" button
  document.getElementById("prevPage").addEventListener("click", (event) => {
    event.preventDefault();
    if (currentPage > 1) {
      loadPage(currentPage - 1, currentSort, currentFilters); // Load the previous page
    }
  });

  // Event listener for "Next" button
  document.getElementById("nextPage").addEventListener("click", (event) => {
    event.preventDefault();
    loadPage(currentPage + 1, currentSort, currentFilters); // Load the next page
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

      const payload = { amount: bidAmount };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to place bid.");
      }

      alert("Bid placed successfully!");
      modal.style.display = "none";
    } catch (error) {
      alert("Failed to place bid. Please try again.");
    }
  });
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}