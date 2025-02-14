const waitForSidebar = setInterval(() => {
  const sidebar = document.getElementById("sidebar");

  if (sidebar) {
    clearInterval(waitForSidebar);

    // Highlight Active Navigation Link
    const currentPath = window.location.pathname;
    console.log("Current Path:", currentPath);

    const navLinks = {
      dashboard: "/SpendSense/Dashboard/index.html",
      budget: "/SpendSense/Budget/index.html",
      transactions: "/SpendSense/Transactions/index.html",
    };

    if (currentPath != "") {
      for (const id in navLinks) {
        if (currentPath.includes(navLinks[id])) {
          console.log(`Found active link: ${id}`);
          document.getElementById(id)?.classList.add("active");
        }
      }
    } else {
      document.getElementById("home")?.classList.add("active");
    }

    checkUserLoggedIn();
    setupSignOut();
  }
}, 100);

// Check if user is logged in
async function checkUserLoggedIn() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "../../Login/index.html";
  }
}

// Function to handle sign-out
async function setupSignOut() {
  const signoutBtn = document.getElementById("signoutBtn");
  if (!signoutBtn) {
    console.error("Sign-out button not found in sidebar.");
    return;
  }

  signoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("Sign-out button clicked");

    const { data: user } = await supabase.auth.getUser();
    console.log("User:", user);

    if (!user) {
      alert("No user logged in.");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error signing out: " + error.message);
    } else {
      window.location.href = "../../Login/index.html";
    }
  });
}
