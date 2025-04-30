// Function to get the current user session
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.log("Error getting session:", error);
    return null;
  }
  console.log("Session data:", data);
  return data.session;
}

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
    profile();
  }
}, 100);

// Check if user is logged in
async function checkUserLoggedIn() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
      showAlert("No user logged in.", "warning");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      showAlert("Error signing out: " + error.message, "danger");
    } else {
      window.location.href = "../../Login/index.html";
    }
  });
}

async function profile() {
  let profileBtn = document.getElementById("profileBtn");
  if (!profileBtn) {
    console.error("Profile button not found.");
    return;
  }

  // Remove old event listeners by replacing the node
  const newProfileBtn = profileBtn.cloneNode(true);
  profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
  profileBtn = newProfileBtn;

  profileBtn.addEventListener("click", async (event) => {
    console.log("Profile button clicked");
    event.preventDefault();

    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "profileModal";
    modal.setAttribute("tabindex", "-1");
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Profile</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="profileForm">
              <div class="mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input type="text" class="form-control" id="firstName" required>
              </div>
              <div class="mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input type="text" class="form-control" id="lastName" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
              </div>
            </form>
          </div>
          <div class="modal-footer d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-danger" id="deleteAccountBtn">Delete Account</button>
            <button type="button" class="btn btnCustom" id="saveProfileBtn">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Fetch user profile from your users table
      const { data, error } = await supabase
        .from("users")
        .select("firstName, lastName, email")
        .eq("id", user.id)
        .single();

      if (data) {
        modal.querySelector("#firstName").value = data.firstName || "";
        modal.querySelector("#lastName").value = data.lastName || "";
        modal.querySelector("#email").value = data.email || "";
      }
    }

    modal.addEventListener("hidden.bs.modal", () => {
      modal.remove();
    });

    modal
      .querySelector("#saveProfileBtn")
      .addEventListener("click", async () => {
        const firstName = modal.querySelector("#firstName").value;
        const lastName = modal.querySelector("#lastName").value;
        const email = modal.querySelector("#email").value;

        if (!firstName || !lastName || !email) {
          showAlert("Please fill in all fields.", "warning");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("users")
            .update({ firstName, lastName, email })
            .eq("id", user.id);

          if (error) {
            showAlert("Error updating profile: " + error.message, "danger");
          } else {
            showAlert("Profile updated!", "success");
            modalInstance.hide();
          }
        }
      });

    // Add delete account logic
    modal
      .querySelector("#deleteAccountBtn")
      .addEventListener("click", async () => {
        if (
          !showConfirmation(
            "Are you sure you want to delete your account? This action cannot be undone."
          )
        ) {
          return;
        }
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Delete user from users table
          const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", user.id);
          if (error) {
            showAlert("Error deleting account: " + error.message, "danger");
            return;
          }
          // Sign out the user
          await supabase.auth.signOut();
          showAlert("Account deleted. Goodbye!", "success");
          window.location.href = "../../Login/index.html";
        }
      });
  });
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

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

function showConfirmation(message, onConfirm, onCancel = () => {}) {
  const container = document.getElementById("alert-container");

  const overlay = document.createElement("div");
  overlay.className = "confirmation-overlay";
  overlay.tabIndex = -1; // Make overlay focusable

  const confirmBox = document.createElement("div");
  confirmBox.className = `alert alert-warning alert-dismissible confirm-box`;
  confirmBox.setAttribute("role", "alert");

  confirmBox.innerHTML = `
    <div class="mb-2">${message}</div>
    <div class="d-flex justify-content-center gap-2">
      <button class="btn btn-sm btn-danger" id="confirmYes">Yes</button>
      <button class="btn btn-sm btn-secondary" id="confirmNo">No</button>
    </div>
  `;

  overlay.appendChild(confirmBox);
  container.appendChild(overlay);

  const yesBtn = confirmBox.querySelector("#confirmYes");
  const noBtn = confirmBox.querySelector("#confirmNo");

  // Focus the Yes button by default
  yesBtn.focus();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      yesBtn.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      noBtn.click();
    }
  };

  // Add keyboard event listener
  document.addEventListener("keydown", handleKeyDown);

  const cleanup = () => {
    // Remove keyboard event listener
    document.removeEventListener("keydown", handleKeyDown);
    confirmBox.classList.add("alert-slide-out");
    setTimeout(() => overlay.remove(), 400);
  };

  yesBtn.addEventListener("click", () => {
    onConfirm();
    cleanup();
  });

  noBtn.addEventListener("click", () => {
    onCancel();
    cleanup();
  });

  // Focus trap - prevent tabbing outside the confirmation box
  const focusableElements = [yesBtn, noBtn];
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }
  });
}