/**
 * Registers a new user with the provided name, email, and password.
 * @param {string} name - The user's name
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<Object>} The response data from the API
 */
export async function registerUser(name, email, password) {
    // ...existing code...
    const apiUrl = "https://v2.api.noroff.dev/auth/register";
  
    const userDetails = {
      name: name,
      email: email,
      password: password,
    };
  
    try {
      // ...existing code...
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error(`Registration failed: ${response.status}`);
      }
  
      const data = await response.json();
      // ...existing code...
      return data;
    } catch (error) {
      console.error("Error during registration", error);
      throw error;
    }
  }
  
  /**
   * Logs in a user with the provided email and password.
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @returns {Promise<Object>} The response data from the API
   */
  export async function loginUser(email, password) {
    const apiUrl = "https://v2.api.noroff.dev/auth/login";
  
    const userDetails = {
      email: email,
      password: password,
    };
  
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });
  
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }
  
      const data = await response.json();
      // ...existing code...
  
      // Store the access token and username in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userName", data.name);
  
      return data;
    } catch (error) {
      console.error("Error during login", error);
      throw error;
    }
  }