const apiUrl = "https://v2.api.noroff.dev/auction/listings";

export async function fetchListings(limit = 10, offset = 0) {
  try {
    const response = await fetch(`${apiUrl}?limit=10&page=1`, {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const { data, meta } = await response.json();
    // Ensure no console.log for fetched listings
    return { data, meta };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: [], meta: { totalCount: 0 } };
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
    // Remove debugging log for rendering listings
    // console.log("Rendering Listing:", listing);

    const listingElement = document.createElement("div");
    listingElement.className = "listing";

    const mediaContent = listing.media?.length > 0 ? `<img src="${listing.media[0]}" alt="${listing.title}" />` : "";

    listingElement.innerHTML = `
      <h3>${listing.title}</h3>
      ${mediaContent}
      <p>${listing.description || "No description available."}</p>
      <p>Price: ${listing.price || "N/A"}</p>
      <p>Bids: ${listing._count?.bids || 0}</p>
    `;
    listingsContainer.appendChild(listingElement);
  });
}

// filepath: c:\Users\ADLAN\Documents\GitHub\Semester-Project-2\scripts\listings.js
export async function initializeListingsPage() {
  console.log("Initializing listings page...");

  let currentPage = 1; // Track the current page
  const listingsPerPage = 10; // Number of listings per page

  async function loadPage(page) {
    try {
        const offset = (page - 1) * listingsPerPage;
        const { data, meta } = await fetchListings(listingsPerPage, offset);
        renderListings(data);

        // Debugging log for meta
        console.log("Pagination Meta:", meta);

        document.getElementById("prevPage").disabled = page === 1;
        document.getElementById("nextPage").disabled = page >= Math.ceil(meta.totalCount / listingsPerPage);
    } catch (error) {
        console.error("Error loading page:", error);
        alert("Failed to load listings. Please try again later.");
    }
  }

  document.getElementById("prevPage").addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Previous button clicked");
    if (currentPage > 1) {
        currentPage--;
        console.log("Loading page:", currentPage);
        loadPage(currentPage);
    }
  });

  document.getElementById("nextPage").addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Next button clicked");
    currentPage++;
    console.log("Loading page:", currentPage);
    loadPage(currentPage);
  });

  loadPage(currentPage);
}