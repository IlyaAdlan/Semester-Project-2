import { fetchListings, renderListings } from "./listings.js";

export async function initializeSearch() {
  const searchInput = document.getElementById("searchQuery");
  const listingsContainer = document.getElementById("listingsContainer");

  if (!searchInput || !listingsContainer) return;

  // Fetch all listings once for searching
  let allListings = [];
  try {
    const { data } = await fetchListings(true); // Fetch all listings
    allListings = data;
    console.log("All Listings for Search:", allListings); // Debugging log
  } catch (error) {
    console.error("Error fetching all listings for search:", error);
  }

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    // Filter listings based on the search term
    const filteredListings = allListings.filter((listing) => {
      const title = listing.title.toLowerCase();
      const description = listing.description?.toLowerCase() || "";
      return title.includes(searchTerm) || description.includes(searchTerm);
    });

    console.log("Filtered Listings:", filteredListings); // Debugging log

    // Render the filtered listings
    renderListings(filteredListings);
  });
}

/**
 * Highlights search terms in text
 * @param {HTMLElement} element - Element to highlight text in
 * @param {string} term - Search term to highlight
 */
function highlightText(element, term) {
  const regex = new RegExp(`(${term})`, "gi");
  ["h3", "p"].forEach((selector) => {
    const textElement = element.querySelector(selector);
    if (textElement) {
      const originalText = textElement.textContent;
      textElement.innerHTML = originalText.replace(
        regex,
        '<span class="highlight">$1</span>'
      );
    }
  });
}

/**
 * Removes highlighting from text
 * @param {HTMLElement} element - Element to remove highlights from
 */
function removeHighlight(element) {
  ["h3", "p"].forEach((selector) => {
    const textElement = element.querySelector(selector);
    if (textElement) {
      textElement.innerHTML = textElement.textContent;
    }
  });
}