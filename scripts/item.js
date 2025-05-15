const apiUrl = "https://v2.api.noroff.dev/auction/listings";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");

  if (!itemId) {
    document.getElementById("itemDetails").innerHTML = "<p>Invalid item ID.</p>";
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${itemId}?_bids=true`, {
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

    // Populate bids section
    const bidsList = document.getElementById("bidsList");
    bidsList.innerHTML = ""; // Clear existing content

    if (item.bids?.length > 0) {
      item.bids.forEach((bid) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <span>${bid.bidder.name}</span>
          <span>$${bid.amount}</span>
        `;
        bidsList.appendChild(listItem);
      });
    } else {
      bidsList.innerHTML = "<li>No bids yet</li>";
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
    document.getElementById("itemDetails").innerHTML = "<p>Failed to load item details.</p>";
  }
});