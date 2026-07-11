// Check auth session
const currentUser = Api.currentUser();

function requireAuth(role) {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  if (role && currentUser.role !== role) {
    if (currentUser.role === "doctor") {
      window.location.href = "doctor-dashboard.html";
    } else {
      window.location.href = "patient-dashboard.html";
    }
    return;
  }
  return currentUser;
}

function initials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Render dynamic navbar user info / actions
document.addEventListener("DOMContentLoaded", () => {
  const slot = document.getElementById("navUserSlot");
  if (!slot) return;

  if (currentUser) {
    const dashboardLink = currentUser.role === "doctor" ? "doctor-dashboard.html" : "patient-dashboard.html";
    slot.innerHTML = `
      <div class="user-info-badge">
        <a href="${dashboardLink}" class="nav-user-name">Hi, ${currentUser.name}</a>
        <button class="btn btn-sm btn-outline btn-logout" id="logoutBtn">Logout</button>
      </div>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      Api.clearSession();
      window.location.href = "index.html";
    });
  } else {
    slot.innerHTML = `
      <a href="login.html" class="nav-link">Login</a>
      <a href="register.html" class="btn btn-coral btn-sm">Sign up</a>
    `;
  }
});
