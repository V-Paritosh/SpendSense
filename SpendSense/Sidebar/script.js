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

async function profile() {
  const profileBtn = document.getElementById("profileBtn");
  if (!profileBtn) {
    console.error("Profile button not found.");
    return;
  }

  profileBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "editTransactionModal";
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Transaction</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editTransactionForm">
              <div class="mb-3">
                <label for="editAmount" class="form-label">Amount</label>
                <input type="number" class="form-control" id="editAmount" value="hi" step="0.01" required>
              </div>
              <div class="mb-3">
                <label for="editCategory" class="form-label">Hi</label>
                <input type="text" class="form-control" id="editCategory" value="Hi" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveChangesBtn">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener("hidden.bs.modal", () => {
      modal.remove();
    });

    modal.querySelector("#saveChangesBtn").addEventListener("click", () => {
      console.log("Save clicked!");
    });
  });
}
