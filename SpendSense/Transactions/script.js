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

  const incomeForm = document.getElementById("incomeForm");
  const incomeSource = document.getElementById("incomeSource").value;
  const incomeAmt = document.getElementById("incomeAmount").value;

  if (!incomeSource || !incomeAmt) {
    alert("Please enter all information");
    return;
  }

  const { error: insertError } = await supabase.from("income").insert([
    {
      source: incomeSource,
      amount: incomeAmt,
    },
  ]);

  if (insertError) {
    alert("Error adding your income, Please try again.");
    console.log(insertError);
  } else {
    incomeForm.reset();
    alert("Income Added");
  }
});

// Expense Insert
expenseBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const expenseForm = document.getElementById("expensesForm");
  const expenseCategory = document.getElementById("expenseCategory").value;
  const expenseAmt = document.getElementById("expenseAmount").value;

  if (!expenseCategory || !expenseAmt) {
    alert("Please enter all information");
    return;
  }

  const { error: insertError } = await supabase.from("expenses").insert([
    {
      category: expenseCategory,
      amount: expenseAmt,
    },
  ]);

  if (insertError) {
    alert("Error adding your expenses, Please try again.");
    console.log(insertError);
  } else {
    expenseForm.reset();
    alert("Expense Added");
  }
});

// Debt Insert
debtBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const debtForm = document.getElementById("debtsForm");
  const debtType = document.getElementById("debtType").value;
  const debtAmt = document.getElementById("debtAmount").value;

  if (!debtType || !debtAmt) {
    alert("Please enter all information");
    return;
  }

  const { error: insertError } = await supabase.from("debts").insert([
    {
      type: debtType,
      amount: debtAmt,
    },
  ]);

  if (insertError) {
    alert("Error adding your debt, Please try again.");
    console.log(insertError);
  } else {
    debtForm.reset();
    alert("Debt Added");
  }
});

// Payment Insert
paymentBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const paymentForm = document.getElementById("paymentsForm");
  const paymentType = toTitleCase(document.getElementById("paymentType").value);
  const paymentAmt = document.getElementById("paymentAmount").value;
  const paymentDate = document.getElementById("paymentDate").value;

  if (!paymentType || !paymentAmt || !paymentDate) {
    alert("Please enter all information");
    return;
  }

  // Create a Date object with the local date
  const localDate = new Date(paymentDate); // This will be in the local timezone
  localDate.setHours(0, 0, 0, 0); // Set the time to midnight

  console.log(localDate); // Check if the date is formatted properly

  // Convert to ISO string before inserting (it will keep the local timezone time)
  const formattedDate = localDate.toISOString();

  const { error: insertError } = await supabase.from("payments").insert([
    {
      type: paymentType,
      amount: paymentAmt,
      date: formattedDate, // Insert as ISO format
    },
  ]);

  if (insertError) {
    alert("Error adding your payment, Please try again.");
    console.log(insertError);
  } else {
    paymentForm.reset();
    alert("Payment Added");
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
      .select("id, date, type, amount")
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
        date: item.date,
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
          <td>${new Date(transaction.date).toLocaleDateString()}</td>
          <td>${transaction.type}</td>
          <td>${transaction.category}</td>
          <td>$${transaction.amount.toFixed(2)}</td>
          <td>
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
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return; // Stop if user cancels
  }

  try {
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      alert("Error deleting transaction. Please try again.");
      return;
    }

    // Remove row from the table after deletion
    document.getElementById(`transaction-${id}`).remove();
    alert("Transaction deleted successfully!");
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("Something went wrong!");
  }
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
