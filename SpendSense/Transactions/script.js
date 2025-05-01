const SUPABASE_URL = "https://egzhuriimugvkjiauphl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnemh1cmlpbXVndmtqaWF1cGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzNjcsImV4cCI6MjAzOTY0NzM2N30.29e4s0hYCEB3e4m0GDB2WgSpEDbiJSSC4FOg5aU8ZOk";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

// Select elements
const incomeBtn = document.getElementById("incomeBtn");
const expenseBtn = document.getElementById("expenseBtn");
const debtBtn = document.getElementById("debtBtn");
const paymentBtn = document.getElementById("paymentBtn");

// Function to convert string to Title Case
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

// Income Insert
incomeBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const session = await getSession();

  const incomeForm = document.getElementById("incomeForm");
  const incomeSource = toTitleCase(
    document.getElementById("incomeSource").value.trim()
  );
  const incomeAmt = parseFloat(
    document.getElementById("incomeAmount").value.trim()
  );

  if (!incomeSource || isNaN(incomeAmt)) {
    showAlert("Please enter all information", "warning");
    return;
  }

  if (!validNum(incomeAmt)) {
    incomeForm.reset();
    return;
  }

  const { error: insertError } = await supabase.from("income").insert([
    {
      source: incomeSource,
      amount: incomeAmt,
    },
  ]);

  if (insertError) {
    showAlert("Error adding your income, Please try again.", "danger");
    console.log(insertError);
  } else {
    incomeForm.reset();
    fetchTransactions(session.user.id);
    showAlert("Income Added", "success");
  }
});

// Expense Insert
expenseBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const session = await getSession();

  const expenseForm = document.getElementById("expensesForm");
  const expenseCategory = toTitleCase(
    document.getElementById("expenseCategory").value.trim()
  );
  const expenseAmt = parseFloat(
    document.getElementById("expenseAmount").value.trim()
  );

  if (!expenseCategory || isNaN(expenseAmt)) {
    showAlert("Please enter all information", "warning");
    return;
  }

  if (!validNum(expenseAmt)) {
    expenseForm.reset();
    return;
  }

  const { error: insertError } = await supabase.from("expenses").insert([
    {
      category: expenseCategory,
      amount: expenseAmt,
    },
  ]);

  if (insertError) {
    showAlert("Error adding your expenses, Please try again.", "danger");
    console.log(insertError);
  } else {
    expenseForm.reset();
    fetchTransactions(session.user.id);
    showAlert("Expense Added", "success");
  }
});

// Debt Insert
debtBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const session = await getSession();

  const debtForm = document.getElementById("debtsForm");
  const debtType = toTitleCase(
    document.getElementById("debtType").value.trim()
  );
  const debtAmt = parseFloat(
    document.getElementById("debtAmount").value.trim()
  );

  if (!debtType || isNaN(debtAmt)) {
    showAlert("Please enter all information", "warning");
    return;
  }

  if (!validNum(debtAmt)) {
    debtForm.reset();
    return;
  }

  const { error: insertError } = await supabase.from("debts").insert([
    {
      type: debtType,
      amount: debtAmt,
    },
  ]);

  if (insertError) {
    showAlert("Error adding your debt, Please try again.", "danger");
    console.log(insertError);
  } else {
    debtForm.reset();
    fetchTransactions(session.user.id);
    showAlert("Debt Added", "success");
  }
});

function validateDate(dateString) {
  // Check if date is empty
  if (!dateString) {
    showAlert("Please select a date", "warning");
    return false;
  }

  // Create Date object from input
  const inputDate = new Date(dateString);

  // Check if date is valid
  if (isNaN(inputDate.getTime())) {
    showAlert("Invalid date format", "warning");
    return false;
  }

  // Get current date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if date is too far in the past (e.g., more than 10 years)
  const tenYearsFuture = new Date();
  tenYearsFuture.setFullYear(currentDate.getFullYear() + 10);
  tenYearsFuture.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (inputDate > tenYearsFuture) {
    showAlert(
      "Payment date cannot be more than 10 years in the future",
      "warning"
    );
    return false;
  }

  // Check if date is too far in the past (e.g., more than 10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(currentDate.getFullYear() - 10);
  tenYearsAgo.setHours(0, 0, 0, 0);

  if (inputDate < tenYearsAgo) {
    showAlert("Payment date cannot be more than 10 years old", "warning");
    return false;
  }

  return true;
}

// Payment Insert
paymentBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const session = await getSession();

  const paymentForm = document.getElementById("paymentsForm");
  const paymentType = toTitleCase(document.getElementById("paymentType").value);
  const paymentAmt = parseFloat(
    document.getElementById("paymentAmount").value.trim()
  );
  const paymentDate = document.getElementById("paymentDate").value;

  if (!paymentType || isNaN(paymentAmt) || !paymentDate) {
    showAlert("Please enter all information", "warning");
    return;
  }

  if (!validNum(paymentAmt) || !validateDate(paymentDate)) {
    return;
  }

  const [year, month, day] = paymentDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day); // create date in local time
  const formattedDate = localDate.toISOString(); // send this to DB or backend
  console.log("formattedDate", formattedDate);

  const { error: insertError } = await supabase.from("payments").insert([
    {
      type: paymentType,
      amount: paymentAmt,
      date: formattedDate, // Insert as ISO format
    },
  ]);

  if (insertError) {
    showAlert("Error adding your payment, Please try again.", "danger");
    console.log(insertError);
  } else {
    paymentForm.reset();
    fetchTransactions(session.user.id);
    showAlert("Payment Added", "success");
  }
});

// Function to fetch and display all transactions
async function fetchTransactions(userId) {
  try {
    // Fetch Income
    const { data: income, error: incomeError } = await supabase
      .from("income")
      .select("id, created_at, source, amount")
      .eq("userId", userId);
    if (incomeError) throw incomeError;

    // Fetch Expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, created_at, category, amount")
      .eq("userId", userId);
    if (expensesError) throw expensesError;

    // Fetch Debts
    const { data: debts, error: debtsError } = await supabase
      .from("debts")
      .select("id, created_at, type, amount")
      .eq("userId", userId);
    if (debtsError) throw debtsError;

    // Fetch Payments
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, created_at, date, type, amount")
      .eq("userId", userId);
    if (paymentsError) throw paymentsError;

    // Combine and sort transactions
    const transactions = [
      ...income.map((item) => ({
        id: item.id,
        table: "income",
        date: item.created_at,
        type: "Income",
        category: item.source,
        amount: item.amount,
      })),
      ...expenses.map((item) => ({
        id: item.id,
        table: "expenses",
        date: item.created_at,
        type: "Expense",
        category: item.category,
        amount: item.amount,
      })),
      ...debts.map((item) => ({
        id: item.id,
        table: "debts",
        date: item.created_at,
        type: "Debt",
        category: item.type,
        amount: item.amount,
      })),
      ...payments.map((item) => ({
        id: item.id,
        table: "payments",
        date: item.created_at,
        type: "Payment",
        category: item.type,
        amount: item.amount,
      })),
    ];

    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render transactions in table
    const transactionTable = document.getElementById("transaction-history");
    transactionTable.innerHTML = transactions
      .map(
        (transaction) => `
        <tr id="transaction-${transaction.id}">
          <td class="text-center">${new Date(
            transaction.date
          ).toLocaleDateString()}</td>
          <td class="text-center">${transaction.type}</td>
          <td class="text-center">${
            transaction.category || transaction.type
          }</td>
          <td class="text-center">$${formatNumber(transaction.amount)}</td>
          <td class="d-flex justify-content-center">
            <button class="btn btn-sm me-2" onclick="editTransaction('${
              transaction.id
            }', '${transaction.table}')">
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${
              transaction.id
            }', '${transaction.table}')">
              Delete
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

// Function to listen for new transactions and update the UI
function listenForNewTransactions(userId) {
  // Real-time subscription for income table
  supabase
    .from("income")
    .on("INSERT", (payload) => {
      console.log("New income added:", payload.new);
      fetchTransactions(userId); // Re-fetch transactions when a new one is added
    })
    .subscribe();

  // Real-time subscription for expenses table
  supabase
    .from("expenses")
    .on("INSERT", (payload) => {
      console.log("New expense added:", payload.new);
      fetchTransactions(userId); // Re-fetch transactions when a new one is added
    })
    .subscribe();

  // Real-time subscription for debts table
  supabase
    .from("debts")
    .on("INSERT", (payload) => {
      console.log("New debt added:", payload.new);
      fetchTransactions(userId); // Re-fetch transactions when a new one is added
    })
    .subscribe();

  // Real-time subscription for payments table
  supabase
    .from("payments")
    .on("INSERT", (payload) => {
      console.log("New payment added:", payload.new);
      fetchTransactions(userId); // Re-fetch transactions when a new one is added
    })
    .subscribe();
}

async function deleteTransaction(id, table) {
  showConfirmation(
    "Are you sure you want to delete this transaction?",
    async () => {
      try {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) {
          console.error("Error deleting transaction:", error);
          showAlert("Error deleting transaction. Please try again.", "danger");
          return;
        }

        document.getElementById(`transaction-${id}`).remove();
        showAlert("Transaction deleted successfully.", "success");
      } catch (err) {
        console.error("Error deleting transaction:", err);
        showAlert("Something went wrong!", "danger");
      }
    }
  );
}

function validNum(num) {
  // Check if num is a number and finite
  if (typeof num !== "number" || !isFinite(num)) {
    showAlert("Invalid number.", "warning");
    return false;
  }

  // Ensure it's non-negative and below some max
  if (num < 0 || num >= 1e8) {
    showAlert("Please enter a realistic cost value.", "warning");
    return false;
  }

  // Ensure it has at most two decimal places
  const parts = num.toString().split(".");
  if (parts[1] && parts[1].length > 2) {
    showAlert("Cost should have at most two decimal places.", "warning");
    return false;
  }

  return true;
}

function showAlert(message, type = "primary", timeout = 3500) {
  const container = document.getElementById("alert-container");
  const isModalOpen = !!document.querySelector(".modal.show");

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible alert-slide-in mb-2`;
  alert.setAttribute("role", "alert");

  // Apply fixed position & z-index if modal is open
  if (isModalOpen) {
    alert.style.position = "fixed";
    alert.style.top = "1rem";
    alert.style.right = "1rem";
    alert.style.zIndex = "1065";
  }

  const timerBar = document.createElement("div");
  timerBar.className = "alert-timer-bar";
  timerBar.style.animationDuration = `${timeout}ms`;

  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close small" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alert.appendChild(timerBar);
  container.appendChild(alert);

  setTimeout(() => {
    alert.classList.remove("alert-slide-in");
    alert.classList.add("alert-slide-out");
    setTimeout(() => alert.remove(), 400);
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

// Function to edit a transaction
async function editTransaction(id, table) {
  try {
    console.log("Editing transaction with:", { id, table });

    // Fetch the transaction details
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }

    console.log("Fetched transaction data:", data);

    // Create and show the edit modal
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
                <input type="number" class="form-control" id="editAmount" value="${
                  data.amount
                }" step="0.01" required>
              </div>
              <div class="mb-3">
                <label for="editCategory" class="form-label">${
                  table === "income" ? "Source" : "Category"
                }</label>
                <input type="text" class="form-control" id="editCategory" value="${
                  data.source || data.category || data.type
                }" required>
              </div>
              ${
                table === "payments"
                  ? `
                <div class="mb-3">
                  <label for="editDate" class="form-label">Date</label>
                  <input type="date" class="form-control" id="editDate" value="${
                    new Date(data.date).toISOString().split("T")[0]
                  }" required>
                </div>
              `
                  : ""
              }
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn" onclick="saveTransactionChanges('${id}', '${table}')">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Remove modal when hidden
    modal.addEventListener("hidden.bs.modal", () => {
      modal.remove();
    });
  } catch (error) {
    console.error("Error editing transaction:", error);
    showAlert("Error loading transaction details", "danger");
  }
}

// Function to save transaction changes
async function saveTransactionChanges(id, table) {
  try {
    const amount = parseFloat(
      document.getElementById("editAmount").value.trim()
    );
    const category = toTitleCase(
      document.getElementById("editCategory").value.trim()
    );
    const date =
      table === "payments" ? document.getElementById("editDate").value : null;

    if (!category || isNaN(amount) || table === "payments" ? !date : null) {
      showAlert("Please enter all information", "warning");
      return;
    }

    if (!validNum(amount)) {
      return;
    }

    if (table === "payments") {
      if (!validateDate(date)) {
        return;
      }
    }

    // Get the current user session
    const session = await getSession();
    if (!session || !session.user) {
      showAlert("User session not found", "danger");
      return;
    }

    const updateData = {
      amount: amount,
      ...(table === "income"
        ? { source: category }
        : table === "expenses"
        ? { category: category }
        : table === "debts"
        ? { type: category }
        : { type: category, date: date }),
    };

    console.log("Attempting to update transaction:", {
      table,
      id,
      updateData,
      userId: session.user.id,
    });

    // First verify the record exists
    const { data: existingData, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching existing record:", fetchError);
      throw fetchError;
    }

    console.log("Existing record:", existingData);

    // Now perform the update
    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    console.log("Update response:", data);

    // Close the modal
    bootstrap.Modal.getInstance(
      document.getElementById("editTransactionModal")
    ).hide();

    // Refresh the transactions list
    fetchTransactions(session.user.id);

    showAlert("Transaction updated successfully", "success");
  } catch (error) {
    console.error("Error saving transaction changes:", error);
    showAlert("Error updating transaction", "danger");
  }
}

function formatNumber(number, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

// Run the session check, load transactions, and start listening for new transactions
document.addEventListener("DOMContentLoaded", () => {
  getSession()
    .then((session) => {
      if (session && session.user) {
        const userId = session.user.id;
        fetchTransactions(userId); // Initial fetch
        listenForNewTransactions(userId); // Start listening for new transactions
      } else {
        console.log("No user session found.");
      }
    })
    .catch((error) => console.log("Error getting session: ", error));
});
