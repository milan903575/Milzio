const CONFIG = {
  local: "http://localhost:3000",
  production: "https://milzio-backend.onrender.com"
};

export const API_BASE =
  location.hostname === "localhost"
    ? CONFIG.local
    : CONFIG.production;