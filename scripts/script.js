import { registerUser, loginUser } from "./auth.js";
import { initializeProfile, displayMyListings, initializeEditModal } from "./profilePage.js";
import { initializeListingsPage, initializeBidModal } from "./listings.js";
import { initializeSearch } from "./search.js";
import { initializeCreateListingModal } from "./create-listing.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const data = await registerUser(name, email, password);
        if (data.data?.id) {
          alert("You are Registered! Log in now.");
          window.location.href = "login.html";
        } else {
          alert(
            "Registration failed: " +
              (data.errors?.[0]?.message || "Unknown error")
          );
        }
      } catch (error) {
        alert("Error during registration: " + error.message);
        console.error(error);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const data = await loginUser(email, password);
        if (data.data?.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("userName", data.data.name);

          alert("Login Successful!");
          window.location.href = "/pages/profile.html";
        } else {
          alert(
            "Login failed: " + (data.errors?.[0]?.message || "Unknown error")
          );
        }
      } catch (error) {
        alert("Error during login: " + error.message);
        console.error(error);
      }
    });
  }

  if (window.location.pathname.includes("/pages/profile.html")) {
    initializeProfile();
    displayMyListings();
    initializeEditModal(); // Initialize the edit modal
  }

  if (window.location.pathname.includes("/pages/listings.html")) {
    initializeListingsPage();
    initializeSearch();
    initializeCreateListingModal();
    initializeBidModal(); // Initialize the bid modal
  }
});

window.addEventListener("error", (event) => {
  console.error("Global Error Captured:", event.message, event);
});