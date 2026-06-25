import { API_BASE } from "./utils/config.js";

const messageEl = document.getElementById("message");
const loginEmailEl = document.getElementById("loginEmail");

function showMessage(text, isError = false) {
  messageEl.innerText = text;

  clearTimeout(messageEl.hideTimer);
  clearTimeout(messageEl.resetTimer);

  messageEl.classList.remove("show", "error", "success");

  void messageEl.offsetWidth;

  messageEl.classList.add(isError ? "error" : "success");
  messageEl.classList.add("show");

  messageEl.hideTimer = setTimeout(() => {
    messageEl.classList.remove("show");

    messageEl.resetTimer = setTimeout(() => {
      messageEl.classList.remove("error", "success");
    }, 300);
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