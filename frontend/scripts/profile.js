import { API_BASE } from "./utils/config.js";

const token = localStorage.getItem("token");

const logoutBtn = document.querySelector(".logout");

// Fetch logged in user data
fetch(`${API_BASE}/api/users/profile`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    const user = data;

    // If user not valid
    if (!user || !user.name || !user.email) {
      document.getElementById("profileName").innerText = "Get started";
      document.getElementById("profileEmail").innerText = "Log in or sign up to access AI chat.";
      document.getElementById("avatar").innerText = "?";

      // Change button to Login
      logoutBtn.innerText = "Login / Signup";
      logoutBtn.onclick = logout;

      return;
    }

    // Logged in user
    document.getElementById("profileName").innerText = user.name;
    document.getElementById("profileEmail").innerText = user.email;
    document.getElementById("avatar").innerText = user.name.charAt(0).toUpperCase();

    logoutBtn.innerText = "Logout";
  });

function logout() {
  localStorage.removeItem("token");
  window.location = "authentication.html";
}