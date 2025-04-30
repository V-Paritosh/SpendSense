const SUPABASE_URL = "https://egzhuriimugvkjiauphl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnemh1cmlpbXVndmtqaWF1cGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzNjcsImV4cCI6MjAzOTY0NzM2N30.29e4s0hYCEB3e4m0GDB2WgSpEDbiJSSC4FOg5aU8ZOk";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Select elements
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const passwordInput = document.getElementById("password");
const passwordToggleBtn = document.getElementById("passwordToggleBtn");

// Login event
loginBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("Please enter both email and password.", "warning");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showAlert(error, "danger")
  } else {
    window.location.href = "../SpendSense/Dashboard/index.html";
  }
});

// Signup event
signupBtn?.addEventListener("click", () => {
  window.location.href = "../Signup/index.html";
});

// Password Eye Toggle
passwordToggleBtn?.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordToggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
  } else {
    passwordInput.type = "password";
    passwordToggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
  }
});

function showAlert(message, type = "primary", timeout = 3500) {
  const container = document.getElementById("alert-container");

  // Create alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible alert-slide-in mb-2`;
  alert.setAttribute("role", "alert");

  const timerBar = document.createElement("div");
  timerBar.className = "alert-timer-bar";
  timerBar.style.animationDuration = `${timeout}ms`;

  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close small" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alert.appendChild(timerBar);
  container.appendChild(alert);

  // Auto-dismiss with slide-out
  setTimeout(() => {
    alert.classList.remove("alert-slide-in");
    alert.classList.add("alert-slide-out");

    setTimeout(() => {
      alert.remove();
    }, 400);
  }, timeout);
}
