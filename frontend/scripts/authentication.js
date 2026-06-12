import { API_BASE } from "./utils/config.js";

const messageEl = document.getElementById("message");
const loginEmailEl = document.getElementById("loginEmail");

function showMessage(text, isError = false) {
  messageEl.innerText = text;
  messageEl.classList.add("show");
  messageEl.classList.toggle("error", isError);

  clearTimeout(messageEl.hideTimer);
  messageEl.hideTimer = setTimeout(() => {
    messageEl.classList.remove("show");
    messageEl.classList.remove("error");
  }, 2500);
}

// REGISTER
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch(`${API_BASE}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    showMessage(data.message || "Account created successfully");
    window.showForm("login");
    loginEmailEl.value = email;
    document.getElementById("loginPassword").focus();
    document.getElementById("registerForm").reset();
  } else {
    showMessage(data.message || "Registration failed", true);
  }
});

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    showMessage("Login successful");
    setTimeout(() => {
      window.location.href = "../profile.html";
    }, 800);
  } else {
    showMessage(data.message || "Invalid email or password", true);
  }
});