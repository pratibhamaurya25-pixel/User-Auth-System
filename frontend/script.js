
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// COMMON FUNCTION FOR REGISTER AND LOGIN
async function authenticate(url, form) {
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    // Safely read the server response
    const data = await response.json();

    // Handle errors such as 409, 400 and 401
    if (!response.ok) {
      alert(data.message || `Request failed: ${response.status}`);
      console.error("Authentication error:", response.status, data);
      return;
    }

    // Save JWT token
    if (!data.token) {
      alert("Authentication succeeded, but no token was received.");
      console.error("Missing token in response:", data);
      return;
    }

    localStorage.setItem("token", data.token);

    alert(data.message || "Success!");

    // Open dashboard
    window.location.href = "/profile.html";

  } catch (error) {
    console.error("Authentication error:", error);
    alert("Cannot connect to the server or read its response. Please try again.");
  }
}

// REGISTER
if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    authenticate("/api/auth/register", registerForm);
  });
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    authenticate("/api/auth/login", loginForm);
  });
}

// LOAD DASHBOARD DATA
if (window.location.pathname.endsWith("/profile.html")) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
  } else {
    loadDashboard(token);
  }
}

// FETCH PROFILE DATA

async function loadDashboard(token) {
  const statusElement = document.getElementById("status");
  const emailElement = document.getElementById("email");
  const accountStatusElement = document.getElementById("accountStatus");
  const loginStatusElement = document.getElementById("loginStatus");

  try {
    if (statusElement) {
      statusElement.textContent = "Loading your details...";
    }

    const response = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem("token");
      alert(data.message || "Please log in again.");
      window.location.href = "/login.html";
      return;
    }

    if (emailElement) {
      emailElement.textContent = data.user.email;
    }

    if (accountStatusElement) {
      accountStatusElement.textContent = "Registered";
    }

    if (loginStatusElement) {
      loginStatusElement.textContent = "Logged in";
    }

    if (statusElement) {
      statusElement.textContent = "Your details loaded successfully!";
    }

  } catch (error) {
    console.error("Profile error:", error);

    if (statusElement) {
      statusElement.textContent = "Unable to load your details.";
    }
  }
}

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}
