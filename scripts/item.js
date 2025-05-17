const apiUrl = "https://v2.api.noroff.dev/auction/listings";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");

  if (!itemId) {
    document.getElementById("itemDetails").innerHTML = "<p>Invalid item ID.</p>";
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${itemId}?_bids=true&_seller=true`, {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch item details.");
    }

    const { data: item } = await response.json();

    // Populate item details
    document.getElementById("itemImage").src = item.media?.[0]?.url || "https://via.placeholder.com/300";
    document.getElementById("itemTitle").textContent = item.title || "No Title";
    document.getElementById("itemDescription").textContent = item.description || "No description available.";
    document.getElementById("itemEndsAt").textContent = item.endsAt ? new Date(item.endsAt).toLocaleString() : "Invalid Date";
    document.getElementById("itemBidsCount").textContent = item._count?.bids || 0;
    document.getElementById("itemHighestBid").textContent =
      item.bids?.length > 0 ? `$${Math.max(...item.bids.map((bid) => bid.amount))}` : "No bids yet";

    // Add this to display seller name
    document.getElementById("sellerName").textContent = item.seller?.name
      ? `Seller: ${item.seller.name}`
      : "Seller: Unknown";

    console.log(item.bids);

    // Populate bids section
    const bidsList = document.getElementById("bidsList");
    bidsList.innerHTML = ""; // Clear existing content

    if (item.bids?.length > 0) {
      item.bids.forEach((bid) => {
        const avatarUrl = bid.bidder.avatar?.url || "https://via.placeholder.com/40";
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <div class="bid-left">
            <img src="${avatarUrl}" 
                 alt="${bid.bidder.name}'s Profile Picture" 
                 class="profile-picture">
            <span class="username">${bid.bidder.name}</span>
          </div>
          <span class="bid-amount">$${bid.amount}</span>
        `;
        bidsList.appendChild(listItem);
      });
    } else {
      bidsList.innerHTML = "<li>No bids yet</li>";
    }

    // Handle "Place Bid" button
    const bidModal = document.getElementById("bidModal");
    const closeBidModal = document.getElementById("closeBidModal");
    const placeBidButton = document.getElementById("placeBidButton");
    const bidForm = document.getElementById("bidForm");

    placeBidButton.addEventListener("click", () => {
      bidModal.style.display = "block";
    });

    closeBidModal.addEventListener("click", () => {
      bidModal.style.display = "none";
    });

    bidForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const bidAmount = parseFloat(document.getElementById("bidAmount").value);

      if (isNaN(bidAmount) || bidAmount <= 0) {
        alert("Please enter a valid bid amount.");
        return;
      }

      try {
        const accessToken = localStorage.getItem("accessToken");
        const bidResponse = await fetch(`${apiUrl}/${itemId}/bids`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Noroff-API-Key": "97ff17b2-b2b3-419f-b421-537dd89f8294",
          },
          body: JSON.stringify({ amount: bidAmount }),
        });

        if (!bidResponse.ok) {
          throw new Error("Failed to place bid.");
        }

        alert("Bid placed successfully!");
        bidModal.style.display = "none";
        location.reload(); // Reload the page to update bid history
      } catch (error) {
        console.error("Error placing bid:", error);
        alert("Failed to place bid. Please try again.");
      }
    });
  } catch (error) {
    console.error("Error fetching item details:", error);
    document.getElementById("itemDetails").innerHTML = "<p>Failed to load item details.</p>";
  }
});