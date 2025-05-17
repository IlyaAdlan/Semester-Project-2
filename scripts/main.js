import { fetchListings } from "./listings.js";

async function displayFeaturedAuctions() {
  const container = document.getElementById("featuredAuctionsContainer");
  try {
    // Fetch auction listings
    const { data: listings } = await fetchListings(true);
    // Select the first 3 listings
    const featuredListings = listings.slice(0, 3);
    // Render the listings
    featuredListings.forEach((listing) => {
      const auctionItem = document.createElement("div");
      auctionItem.className = "auction-item";
      const mediaContent =
        listing.media && listing.media.length > 0
          ? `<img src="${listing.media[0].url}" alt="${listing.title}">`
          : `<div class="placeholder-media">No Image</div>`;
      auctionItem.innerHTML = `
        ${mediaContent}
        <div class="auction-details">
          <h3>${listing.title}</h3>
          <p>Starting Bid: $${listing.bids?.[0]?.amount || "0"}</p>
          <p>Ends At: ${new Date(listing.endsAt).toLocaleString()}</p>
        </div>
      `;
      container.appendChild(auctionItem);
    });
  } catch (error) {
    console.error("Error fetching featured auctions:", error);
    container.innerHTML = "<p>Failed to load featured auctions.</p>";
  }
}

document.addEventListener("DOMContentLoaded", displayFeaturedAuctions);