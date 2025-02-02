const SUPABASE_URL = "https://egzhuriimugvkjiauphl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnemh1cmlpbXVndmtqaWF1cGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzNjcsImV4cCI6MjAzOTY0NzM2N30.29e4s0hYCEB3e4m0GDB2WgSpEDbiJSSC4FOg5aU8ZOk";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Select elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("password");
const passwordToggleBtn = document.getElementById("passwordToggleBtn");

// Login event
signupBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!firstName || !lastName || !email || !password) {
    alert("Please enter all information");
    return;
  }

  const { error: signUpError, user } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    alert(signUpError);
  } else {
    const { error: insertError } = await supabase.from("users").insert([
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
    ]);

    if (insertError) {
      alert(insertError);
    } else {
      window.location.href = "../Login/index.html";
    }
  }
});

// Signup event
loginBtn?.addEventListener("click", () => {
  window.location.href = "../Login/index.html";
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
