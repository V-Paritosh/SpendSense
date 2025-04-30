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

//Function to display user's name
async function usersName(userId) {
  const { data: userProfile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId);

  if (error) {
    console.log("Error getting user profile: ", error);
    return;
  }

  const title = document.getElementById("title");
  title.textContent = `Welcome, ${userProfile[0].firstName} ${userProfile[0].lastName}`;
}

// Function to fetch and calculate net worth
async function calculateNetworth(userId) {
  const { data: incomeData, error: incomeError } = await supabase
    .from("income")
    .select("amount")
    .eq("userId", userId);

  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("amount")
    .eq("userId", userId);

  if (incomeError || expenseError) {
    console.error("Error fetching financial data:", incomeError, expenseError);
    return;
  }

  const totalIncome = incomeData.reduce(
    (sum, record) => sum + record.amount,
    0
  );

  const totalExpenses = expenseData.reduce(
    (sum, record) => sum + record.amount,
    0
  );

  const networth = totalIncome - totalExpenses;

  document.getElementById(
    "networth"
  ).textContent = `Total Balance: $${networth.toFixed(2)}`;
}

// Function to fetch and display upcoming expenses
async function fetchExpenses(userId) {
  const { data: expensesData, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("userId", userId);

  if (error) {
    console.error("Error fetching expenses:", error);
    return;
  }

  let expensesList = document.getElementById("expenses");

  if (expensesData.length == 0 || expensesData == null) {
    return;
  } else {
    expensesList.innerHTML = "";
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const expensePayments = expensesData
    .map((expense) => {
      let expenseDate = new Date(expense.created_at);
      return { ...expense, expenseDate };
    })
    .sort((a, b) => a.expenseDate - b.expenseDate)
    .slice(0, 10);

  expensePayments.forEach((expense) => {
    let listItem = document.createElement("li");
    listItem.textContent = `${expense.category}: $${expense.amount.toFixed(2)}`;
    expensesList.appendChild(listItem);
  });
}

// Function to fetch and display debts
async function fetchDebts(userId) {
  const { data: debtData, error } = await supabase
    .from("debts")
    .select("id, type, amount")
    .eq("userId", userId);

  if (error) {
    console.error("Error fetching debts:", error);
    return;
  }

  const totalDebts = debtData.reduce((sum, record) => sum + record.amount, 0);
  document.getElementById(
    "debts"
  ).textContent = `Total Debts: $${totalDebts.toFixed(2)}`;

  let debtsList = document.getElementById("debtsList");
  if (!debtsList) {
    debtsList = document.createElement("ul");
    debtsList.id = "debtsList";
    debtsList.className = "list-unstyled";
    document.getElementById("debts").parentNode.appendChild(debtsList);
  } else {
    debtsList.innerHTML = "";
  }

  debtData.forEach((debt) => {
    let listItem = document.createElement("li");
    listItem.className =
      "d-flex justify-content-between align-items-center p-1";

    let debtInfo = document.createElement("span");
    debtInfo.textContent = `${debt.type}: $${debt.amount.toFixed(2)}`;

    let paymentContainer = document.createElement("div");
    paymentContainer.className = "d-flex align-items-center gap-2";

    let paymentInput = document.createElement("input");
    paymentInput.type = "number";
    paymentInput.className = "form-control form-control-sm";
    paymentInput.style.width = "100px";
    paymentInput.placeholder = "Amount";
    paymentInput.min = "0";
    paymentInput.max = debt.amount;
    paymentInput.step = "0.01";

    let payButton = document.createElement("button");
    payButton.className = "btn btn-sm btn-success";
    payButton.textContent = "Pay";
    payButton.onclick = () => {
      const paymentAmount = parseFloat(paymentInput.value);
      if (isNaN(paymentAmount)) {
        showAlert("Please enter a valid payment amount", "warning");
        return;
      }

      if (!validNum(paymentAmount)) {
        return;
      }

      if (paymentAmount > debt.amount) {
        showAlert("Payment amount cannot exceed debt amount", "warning");
        return;
      }
      completeDebtPayment(debt.id, debt.type, paymentAmount, userId);
    };

    paymentContainer.appendChild(paymentInput);
    paymentContainer.appendChild(payButton);
    listItem.appendChild(debtInfo);
    listItem.appendChild(paymentContainer);
    debtsList.appendChild(listItem);
  });
}

async function completeDebtPayment(debtId, type, amount, userId) {
  try {
    // Get current debt amount
    const { data: currentDebt, error: fetchError } = await supabase
      .from("debts")
      .select("amount")
      .eq("id", debtId)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = currentDebt.amount - amount;

    if (newAmount <= 0) {
      // If debt is fully paid, delete it
      const { error: deleteError } = await supabase
        .from("debts")
        .delete()
        .eq("id", debtId);

      if (deleteError) throw deleteError;
    } else {
      // Update remaining debt amount
      const { error: updateError } = await supabase
        .from("debts")
        .update({ amount: newAmount })
        .eq("id", debtId);

      if (updateError) throw updateError;
    }

    // Add the payment as an expense
    const { error: expenseError } = await supabase.from("expenses").insert([
      {
        category: "Debt Payment - " + type,
        amount: amount,
        userId: userId,
      },
    ]);

    if (expenseError) throw expenseError;

    // Refresh the debts list, expenses list, and net worth
    fetchDebts(userId);
    fetchExpenses(userId);
    calculateNetworth(userId);
    showAlert("Debt payment completed successfully!", "success");
  } catch (error) {
    console.error("Error completing debt payment:", error);
    showAlert("Error completing debt payment. Please try again.", "danger");
  }
}

// Function to fetch and display upcoming payments
async function fetchPayments(userId) {
  const { data: paymentData, error } = await supabase
    .from("payments")
    .select("id, type, amount, date")
    .eq("userId", userId);

  if (error) {
    console.error("Error fetching payments:", error);
    return;
  }

  let paymentsList = document.getElementById("payments");

  if (paymentData.length == 0 || paymentData == null) {
    return;
  } else {
    paymentsList.innerHTML = "";
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const upcomingPayments = paymentData
    .map((payment) => {
      let paymentDate = new Date(payment.date);
      return { ...payment, paymentDate };
    })
    .sort((a, b) => a.paymentDate - b.paymentDate);

  upcomingPayments.forEach((payment) => {
    const timeDiff = payment.paymentDate - currentDate;
    const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let listItem = document.createElement("li");
    listItem.className =
      "d-flex justify-content-between align-items-center p-1";

    let paymentInfo = document.createElement("span");
    if (payment.paymentDate < currentDate) {
      paymentInfo.style.color = "red";
      paymentInfo.textContent = `${payment.type}: $${payment.amount} - Pay Now`;
    } else if (
      payment.paymentDate.toDateString() === currentDate.toDateString()
    ) {
      paymentInfo.style.color = "green";
      paymentInfo.textContent = `${payment.type}: $${payment.amount} - Pay Today`;
    } else {
      paymentInfo.textContent = `${payment.type}: $${payment.amount} - Due in ${daysUntilDue} days`;
    }

    let payButton = document.createElement("button");
    payButton.className = "btn btn-sm btn-success";
    payButton.textContent = "Pay";
    payButton.onclick = () =>
      completePayment(payment.id, payment.type, payment.amount, userId);

    listItem.appendChild(paymentInfo);
    listItem.appendChild(payButton);
    paymentsList.appendChild(listItem);
  });
}

async function completePayment(paymentId, type, amount, userId) {
  try {
    // Add the payment as an expense
    const { error: expenseError } = await supabase.from("expenses").insert([
      {
        category: "Payment Paid - " + type,
        amount: amount,
        userId: userId,
      },
    ]);

    if (expenseError) {
      throw expenseError;
    }

    // Delete the payment
    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (deleteError) {
      throw deleteError;
    }

    // Refresh the payments list, expenses list, and net worth
    fetchPayments(userId);
    fetchExpenses(userId);
    calculateNetworth(userId);
    showAlert("Payment completed successfully!", "success");
  } catch (error) {
    console.error("Error completing payment:", error);
    showAlert("Error completing payment. Please try again.", "danger");
  }
}

// Function to fetch and display financial data in charts
async function displayCharts(userId) {
  // Fetch financial data (Income, Expenses, Debts)
  const { data: incomeData, error: incomeError } = await supabase
    .from("income")
    .select("amount")
    .eq("userId", userId);

  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("amount")
    .eq("userId", userId);

  const { data: debtData, error: debtError } = await supabase
    .from("debts")
    .select("type, amount")
    .eq("userId", userId);

  if (incomeError || expenseError || debtError) {
    console.error(
      "Error fetching financial data:",
      incomeError,
      expenseError,
      debtError
    );
    return;
  }

  // Calculate total income and expenses
  const totalIncome = incomeData.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const totalExpenses = expenseData.reduce(
    (sum, record) => sum + record.amount,
    0
  );

  // Prepare data for the charts
  const financialData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Total Financial Overview",
        data: [totalIncome, totalExpenses],
        backgroundColor: ["#28a745", "#dc3545"], // Green for income, red for expenses
        borderColor: ["#218838", "#c82333"],
        borderWidth: 2,
        hoverBackgroundColor: ["#218838", "#c82333"],
        hoverBorderColor: ["#155724", "#721c24"],
      },
    ],
  };

  // Create Bar chart for Income and Expenses
  const ctx = document.getElementById("financialChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: financialData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#fff",
          borderWidth: 1,
          cornerRadius: 4,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Financial Categories",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount ($)",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
      },
    },
  });

  // Prepare data for debts (Doughnut chart)
  const debtLabels = debtData.map((debt) => debt.type);
  const debtAmounts = debtData.map((debt) => debt.amount);

  // Create Doughnut chart for debts
  const debtCtx = document.getElementById("debtChart").getContext("2d");
  new Chart(debtCtx, {
    type: "doughnut",
    data: {
      labels: debtLabels,
      datasets: [
        {
          data: debtAmounts,
          backgroundColor: ["#fd7e14", "#17a2b8", "#6f42c1"], // Orange, Blue, Purple for debts
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#fff",
          borderWidth: 1,
          cornerRadius: 4,
        },
      },
    },
  });
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

  const confirmBox = document.createElement("div");
  confirmBox.className = `alert alert-warning alert-dismissible confirm-box`;
  confirmBox.setAttribute("role", "alert");

  confirmBox.innerHTML = `
    <div class="mb-2">${message}</div>
    <div class="d-flex justify-content-center gap-2">
      <button class="btn btn-sm btn-danger">Yes</button>
      <button class="btn btn-sm btn-secondary">No</button>
    </div>
  `;

  overlay.appendChild(confirmBox);
  container.appendChild(overlay);

  const yesBtn = confirmBox.querySelector("button.btn-danger");
  const noBtn = confirmBox.querySelector("button.btn-secondary");

  const cleanup = () => {
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
}

// Fetch and display charts on page load
document.addEventListener("DOMContentLoaded", () => {
  getSession()
    .then((session) => {
      if (session && session.user) {
        const userId = session.user.id;
        usersName(userId);
        calculateNetworth(userId);
        fetchExpenses(userId);
        fetchDebts(userId);
        fetchPayments(userId);
        displayCharts(userId); // Display charts
      } else {
        console.log("No user session found.");
      }
    })
    .catch((error) => console.log("Error getting session: ", error));
});
