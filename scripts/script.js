import { registerUser, loginUser } from "./auth.js";
import { initializeProfile } from "./profilePage.js";
import { initializeListingsPage } from "./listings.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event triggered");

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  // Handle registration form submission
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

  // Handle login form submission
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

          console.log("Access Token:", data.data.accessToken);

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

  // Initialize profile page
  if (window.location.pathname.includes("/pages/profile.html")) {
    console.log("Initializing profile page");
    initializeProfile();
  }

  // Initialize listings page
  if (window.location.pathname.includes("/pages/listings.html")) {
    console.log("Initializing listings page");
    initializeListingsPage();
  }
});

window.addEventListener("error", (event) => {
  console.error("Global Error Captured:", event.message, event);
});