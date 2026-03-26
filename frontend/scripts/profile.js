const token = localStorage.getItem("token");

if (!token) {
  window.location = "authentication.html";
}

const API_URL = "http://localhost:3000";

// Fetch logged in user data
fetch(`${API_URL}/api/users/profile`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    const user = data;

    // Check if name or email is undefined
    if (!user || !user.name || !user.email) {
      document.getElementById("profileName").innerText = "You are not logged in";
      document.getElementById("profileEmail").innerText = "";
      document.getElementById("avatar").innerText = "?";
      return;
    }

    document.getElementById("profileName").innerText = user.name;
    document.getElementById("profileEmail").innerText = user.email;

    // Show first letter of name as avatar
    document.getElementById("avatar").innerText = user.name.charAt(0).toUpperCase();
  });

function logout() {
  localStorage.removeItem("token");
  window.location = "authentication.html";
}
