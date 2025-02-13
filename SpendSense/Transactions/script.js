const SUPABASE_URL = "https://egzhuriimugvkjiauphl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnemh1cmlpbXVndmtqaWF1cGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzNjcsImV4cCI6MjAzOTY0NzM2N30.29e4s0hYCEB3e4m0GDB2WgSpEDbiJSSC4FOg5aU8ZOk";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Select elements
const incomeBtn = document.getElementById("incomeBtn");
const expenseBtn = document.getElementById("expenseBtn");
const debtBtn = document.getElementById("debtBtn");
const paymentBtn = document.getElementById("paymentBtn");

// Income Insert
incomeBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const incomeForm = document.getElementById("incomeForm");
  const incomeSource = document.getElementById("incomeSource").value;
  const incomeAmt = document.getElementById("incomeAmount").value;

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

// Function to convert string to Title Case
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
