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
    .select("firstName")
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
  ).textContent = `Total Networth: $${networth.toFixed(2)}`;
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
    .select("type, amount")
    .eq("userId", userId);

  if (error) {
    console.error("Error fetching debts:", error);
    return;
  }

  const totalDebts = debtData.reduce((sum, record) => sum + record.amount, 0);
  document.getElementById(
    "debts"
  ).textContent = `Total Debts: $${totalDebts.toFixed(2)}`;
}

// Function to fetch and display upcoming payments
async function fetchPayments(userId) {
  const { data: paymentData, error } = await supabase
    .from("payments")
    .select("type, amount, date")
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
    // .slice(0, 5);

  upcomingPayments.forEach((payment) => {
    const timeDiff = payment.paymentDate - currentDate;
    const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let listItem = document.createElement("li");

    if (payment.paymentDate < currentDate) {
      listItem.style.color = "red";
      listItem.textContent = `${payment.type}: $${payment.amount} - Pay Now`;
    } else if (
      payment.paymentDate.toDateString() === currentDate.toDateString()
    ) {
      listItem.style.color = "green";
      listItem.textContent = `${payment.type}: $${payment.amount} - Pay Today`;
    } else {
      listItem.textContent = `${payment.type}: $${payment.amount} - Due in ${daysUntilDue} days`;
    }

    paymentsList.appendChild(listItem);
  });
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
    console.error("Error fetching financial data:", incomeError, expenseError, debtError);
    return;
  }

  // Calculate total income and expenses
  const totalIncome = incomeData.reduce((sum, record) => sum + record.amount, 0);
  const totalExpenses = expenseData.reduce((sum, record) => sum + record.amount, 0);

  // Prepare data for the charts
  const financialData = {
    labels: ["Income", "Expenses"],
    datasets: [{
      label: "Total Financial Overview",
      data: [totalIncome, totalExpenses],
      backgroundColor: ["#28a745", "#dc3545"], // Green for income, red for expenses
      borderColor: ["#218838", "#c82333"],
      borderWidth: 2,
      hoverBackgroundColor: ["#218838", "#c82333"],
      hoverBorderColor: ["#155724", "#721c24"],
    }]
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
            }
          }
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#fff",
          borderWidth: 1,
          cornerRadius: 4,
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Financial Categories",
            font: {
              size: 14,
              weight: "bold",
            }
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount ($)",
            font: {
              size: 14,
              weight: "bold",
            }
          }
        }
      }
    }
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
      datasets: [{
        data: debtAmounts,
        backgroundColor: ["#fd7e14", "#17a2b8", "#6f42c1"], // Orange, Blue, Purple for debts
        borderColor: "#fff",
        borderWidth: 2,
      }]
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
            }
          }
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#fff",
          borderWidth: 1,
          cornerRadius: 4,
        }
      }
    }
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
