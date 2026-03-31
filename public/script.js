const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const cancelEditBtn = document.getElementById("cancel-edit");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

const totalExpensesEl = document.getElementById("total-expenses");
const totalEntriesEl = document.getElementById("total-entries");
const highestExpenseEl = document.getElementById("highest-expense");

const API_URL = "http://localhost:5000/expenses";

let editId = null;
let allExpenses = [];

async function fetchExpenses() {
  try {
    const response = await fetch(API_URL);
    const expenses = await response.json();

    allExpenses = expenses;
    renderExpenses();
    updateSummary();
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

function updateSummary() {
  const total = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const highest = allExpenses.length
    ? Math.max(...allExpenses.map((expense) => expense.amount))
    : 0;

  totalExpensesEl.textContent = `₹${total}`;
  totalEntriesEl.textContent = allExpenses.length;
  highestExpenseEl.textContent = `₹${highest}`;
}

function renderExpenses() {
  let filteredExpenses = [...allExpenses];

  const searchValue = searchInput.value.toLowerCase().trim();
  const sortValue = sortSelect.value;

  if (searchValue) {
    filteredExpenses = filteredExpenses.filter((expense) =>
      expense.title.toLowerCase().includes(searchValue) ||
      expense.category.toLowerCase().includes(searchValue) ||
      (expense.description || "").toLowerCase().includes(searchValue)
    );
  }

  if (sortValue === "newest") {
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortValue === "oldest") {
    filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortValue === "amount-high") {
    filteredExpenses.sort((a, b) => b.amount - a.amount);
  } else if (sortValue === "amount-low") {
    filteredExpenses.sort((a, b) => a.amount - b.amount);
  }

  expenseList.innerHTML = "";

  if (filteredExpenses.length === 0) {
    expenseList.innerHTML = `<div class="empty-state">No expenses found.</div>`;
    return;
  }

  filteredExpenses.forEach((expense) => {
    const expenseCard = document.createElement("div");
    expenseCard.classList.add("expense-card");

    expenseCard.innerHTML = `
      <h3>${expense.title}</h3>

      <div class="expense-meta">
        <p><strong>Amount:</strong> ₹${expense.amount}</p>
        <p><strong>Category:</strong> ${expense.category}</p>
        <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
      </div>

      <p class="expense-description">
        <strong>Description:</strong> ${expense.description || "No description"}
      </p>

      <div class="card-actions">
        <button class="icon-btn edit-btn" onclick="editExpense('${expense._id}')">
            ✎ Edit
        </button>
        <button class="icon-btn delete-btn" onclick="deleteExpense('${expense._id}')">
            🗑 Delete
        </button>
      </div>
    `;

    expenseList.appendChild(expenseCard);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expenseData = {
    title: document.getElementById("title").value,
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    description: document.getElementById("description").value,
  };

  try {
    let response;

    if (editId) {
      response = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      editId = null;
    } else {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });
    }

    if (!response.ok) {
      throw new Error("Request failed");
    }

    form.reset();
    fetchExpenses();
  } catch (error) {
    console.error("Error:", error);
  }
});

window.deleteExpense = async function (id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete expense");
    }

    if (editId === id) {
      editId = null;
      form.reset();
    }

    fetchExpenses();
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};

window.editExpense = function (id) {
  const expense = allExpenses.find((item) => item._id === id);
  if (!expense) return;

  document.getElementById("title").value = expense.title;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("category").value = expense.category;
  document.getElementById("date").value = expense.date.split("T")[0];
  document.getElementById("description").value = expense.description || "";

  editId = expense._id;
};

cancelEditBtn.addEventListener("click", () => {
  editId = null;
  form.reset();
});

searchInput.addEventListener("input", renderExpenses);
sortSelect.addEventListener("change", renderExpenses);

fetchExpenses();