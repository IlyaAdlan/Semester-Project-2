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

    // Filter by status
    const now = new Date().toISOString();
    if (filters.status === "active") {
      url += `&endsAt_gte=${now}`; // Only include items with future end dates
    } else if (filters.status === "ended") {
      url += `&endsAt_lt=${now}`; // Only include items with past end dates
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
    console.error("Error fetching listings:", error);
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
      : `<img src="https://via.placeholder.com/300x200?text=No+Image" alt="No Image" />`;

    const highestBid = listing.bids?.length > 0
      ? Math.max(...listing.bids.map((bid) => bid.amount))
      : "No bids yet";

    console.log("Listing endsAt:", listing.endsAt);

    listingElement.innerHTML = `
      <a href="item.html?id=${listing.id}" class="auction-link">
        <div class="listing-media">
          ${mediaContent}
        </div>
        <div class="listing-details">
          <h3>${listing.title}</h3>
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
  let currentPage = 1;
  const listingsPerPage = 10;
  let currentSort = "";
  let currentFilters = {};
  let allListings = [];

  // Initialize search functionality
  initializeSearch();

  async function loadPage(page, sortBy = currentSort, filters = currentFilters) {
    try {
      const listingsContainer = document.getElementById("listingsContainer");
      const loadingSpinner = document.getElementById("loadingSpinner");

      listingsContainer.innerHTML = "";
      loadingSpinner.style.display = "block";

      let paginatedListings = [];
      let totalCount = 0;

      // If sorting or filtering, fetch all and paginate client-side
      if (sortBy || (filters && Object.keys(filters).length > 0 && Object.values(filters).some(v => v))) {
        const { data } = await fetchListings(true, listingsPerPage, page, sortBy, filters);
        allListings = data;

        // --- Filter by status client-side ---
        if (filters && filters.status && filters.status !== "all") {
          const now = new Date();
          if (filters.status === "active") {
            allListings = allListings.filter(listing => new Date(listing.endsAt) > now);
          } else if (filters.status === "ended") {
            allListings = allListings.filter(listing => new Date(listing.endsAt) <= now);
          }
        }
        // --- End status filter ---

        // --- Sorting block ---
        if (sortBy) {
          if (sortBy === "highestBid") {
            allListings.sort((a, b) => {
              const aBid = a.bids?.length ? Math.max(...a.bids.map(bid => bid.amount)) : 0;
              const bBid = b.bids?.length ? Math.max(...b.bids.map(bid => bid.amount)) : 0;
              return bBid - aBid;
            });
          } else if (sortBy === "mostRecent") {
            allListings.sort((a, b) => new Date(b.created) - new Date(a.created));
          } else if (sortBy === "endingSoon") {
            allListings.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
          }
        }
        // --- End sorting block ---

        totalCount = allListings.length;
        const startIndex = (page - 1) * listingsPerPage;
        paginatedListings = allListings.slice(startIndex, startIndex + listingsPerPage);
      } else {
        // Server-side pagination
        const { data, meta } = await fetchListings(false, listingsPerPage, page, sortBy, filters);
        paginatedListings = data;
        totalCount = meta?.totalCount || 0;
      }

      renderListings(paginatedListings);

      loadingSpinner.style.display = "none";

      // Update pagination controls
      currentPage = page;
      currentSort = sortBy;
      currentFilters = filters;
      document.getElementById("currentPage").textContent = `Page ${currentPage}`;
      document.getElementById("prevPage").disabled = currentPage === 1;
      document.getElementById("nextPage").disabled = paginatedListings.length < listingsPerPage || (totalCount && currentPage * listingsPerPage >= totalCount);
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