import { API_BASE } from "./utils/config.js";

const token = localStorage.getItem("token");
const logoutBtn = document.querySelector(".logout");

function logout() {
  localStorage.removeItem("token");
  window.location = "authentication.html";
}

logoutBtn.addEventListener("click", logout);

async function loadProfile() {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const user = await res.json();

  if (!user || !user.name || !user.email) {
    document.getElementById("profileName").innerText = "Get started";
    document.getElementById("profileEmail").innerText = "Log in or sign up to access AI chat.";
    document.getElementById("avatar").innerText = "?";

    logoutBtn.innerText = "Login / Signup";
    return;
  }

  document.getElementById("profileName").innerText = user.name;
  document.getElementById("profileEmail").innerText = user.email;
  document.getElementById("avatar").innerText = user.name.charAt(0).toUpperCase();

  logoutBtn.innerText = "Logout";
}

loadProfile();