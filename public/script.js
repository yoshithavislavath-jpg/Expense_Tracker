const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const cancelEditBtn = document.getElementById("cancel-edit");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

const totalExpensesEl = document.getElementById("total-expenses");
const totalEntriesEl = document.getElementById("total-entries");
const highestExpenseEl = document.getElementById("highest-expense");

const thisMonthTotalEl = document.getElementById("this-month-total");
const topCategoryEl = document.getElementById("top-category");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const API_URL = "http://localhost:5000/expenses";

let editId = null;
let allExpenses = [];
let expenseChart = null;

/* ---------------- TAB SWITCHING ---------------- */
function switchTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.tab === tabName) {
      button.classList.add("active");
    }
  });

  tabContents.forEach((section) => {
    section.classList.remove("active");
  });

  const activeTab = document.getElementById(`${tabName}-tab`);
  if (activeTab) {
    activeTab.classList.add("active");
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

/* ---------------- FETCH EXPENSES ---------------- */
async function fetchExpenses() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch expenses");
    }

    const expenses = await response.json();
    allExpenses = expenses;

    renderExpenses();
    updateSummary();
    renderChart();
    renderCategoryTotals();
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

/* ---------------- FORMATTERS ---------------- */
function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString("en-AU")}`;
}

function formatDate(dateString) {
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate)) return dateString;
  return parsedDate.toLocaleDateString();
}

/* ---------------- SUMMARY ---------------- */
function updateSummary() {
  const total = allExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const highest = allExpenses.length
    ? Math.max(...allExpenses.map((expense) => Number(expense.amount)))
    : 0;

  totalExpensesEl.textContent = formatCurrency(total);
  totalEntriesEl.textContent = allExpenses.length;
  highestExpenseEl.textContent = formatCurrency(highest);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = allExpenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      !isNaN(expenseDate) &&
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  thisMonthTotalEl.textContent = formatCurrency(thisMonthTotal);

  const categoryTotals = {};
  allExpenses.forEach((expense) => {
    const category = (expense.category || "").trim() || "Uncategorized";
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
  });

  let topCategory = "—";
  let topCategoryAmount = 0;

  for (const category in categoryTotals) {
    if (categoryTotals[category] > topCategoryAmount) {
      topCategoryAmount = categoryTotals[category];
      topCategory = category;
    }
  }

  topCategoryEl.textContent = topCategory;
}

/* ---------------- CATEGORY TOTALS ---------------- */
function renderCategoryTotals() {
  const categoryTotalsList = document.getElementById("category-totals-list");
  if (!categoryTotalsList) return;

  const categoryTotals = {};

  allExpenses.forEach((expense) => {
    const category = (expense.category || "").trim() || "Uncategorized";
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length === 0) {
    categoryTotalsList.innerHTML = `
      <div class="category-total-item">
        <span class="category-total-name">No categories yet</span>
        <span class="category-total-amount">₹0</span>
      </div>
    `;
    return;
  }

  categoryTotalsList.innerHTML = sortedCategories
    .map(([category, total]) => {
      return `
        <div class="category-total-item">
          <span class="category-total-name">${category}</span>
          <span class="category-total-amount">${formatCurrency(total)}</span>
        </div>
      `;
    })
    .join("");
}

/* ---------------- FILTER + SORT ---------------- */
function getFilteredExpenses() {
  let filteredExpenses = [...allExpenses];

  const searchValue = searchInput.value.toLowerCase().trim();
  const sortValue = sortSelect.value;

  if (searchValue) {
    filteredExpenses = filteredExpenses.filter((expense) =>
      (expense.title || "").toLowerCase().includes(searchValue) ||
      (expense.category || "").toLowerCase().includes(searchValue) ||
      (expense.description || "").toLowerCase().includes(searchValue)
    );
  }

  if (sortValue === "newest") {
  filteredExpenses.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date).getTime();
    const timeB = new Date(b.createdAt || b.date).getTime();
    return timeB - timeA;
  });
} else if (sortValue === "oldest") {
  filteredExpenses.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date).getTime();
    const timeB = new Date(b.createdAt || b.date).getTime();
    return timeA - timeB;
  });
} else if (sortValue === "amount-high") {
    filteredExpenses.sort((a, b) => Number(b.amount) - Number(a.amount));
  } else if (sortValue === "amount-low") {
    filteredExpenses.sort((a, b) => Number(a.amount) - Number(b.amount));
  }

  return filteredExpenses;
}

/* ---------------- RENDER EXPENSES ---------------- */
function renderExpenses() {
  const filteredExpenses = getFilteredExpenses();

  expenseList.innerHTML = "";

  if (filteredExpenses.length === 0) {
    expenseList.innerHTML = `<div class="empty-state">No expenses found.</div>`;
    return;
  }

  filteredExpenses.forEach((expense) => {
    const expenseCard = document.createElement("div");
    expenseCard.classList.add("expense-card");

    expenseCard.innerHTML = `
      <div class="expense-card-top">
        <div>
          <h3>${expense.title}</h3>
          <p class="expense-meta">${expense.category} • ${formatDate(expense.date)}</p>
        </div>
        <h3>${formatCurrency(expense.amount)}</h3>
      </div>

      <p class="expense-description">
        ${expense.description || "No description added."}
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

/* ---------------- CHART ---------------- */
function renderChart() {
  const canvas = document.getElementById("expenseChart");
  if (!canvas) return;

  const categoryTotals = {};

  allExpenses.forEach((expense) => {
    const category = (expense.category || "").trim() || "Uncategorized";
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["No Data"],
      datasets: [
        {
          label: "Expenses by Category",
          data: data.length ? data : [1],
          backgroundColor: [
            "#ff8fab",
            "#ffc2d1",
            "#cdb4db",
            "#bde0fe",
            "#a2d2ff",
            "#d8f3dc",
            "#ffd6a5",
            "#fdffb6"
          ],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#cfcfc2",
            boxWidth: 14,
            padding: 16,
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

/* ---------------- FORM SUBMIT ---------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expenseData = {
    title: document.getElementById("title").value.trim(),
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value.trim(),
    date: document.getElementById("date").value,
    description: document.getElementById("description").value.trim(),
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
    await fetchExpenses();
    switchTab("expenses");
  } catch (error) {
    console.error("Error:", error);
  }
});

/* ---------------- DELETE ---------------- */
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

    await fetchExpenses();
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};

/* ---------------- EDIT ---------------- */
window.editExpense = function (id) {
  const expense = allExpenses.find((item) => item._id === id);
  if (!expense) return;

  document.getElementById("title").value = expense.title || "";
  document.getElementById("amount").value = expense.amount || "";
  document.getElementById("category").value = expense.category || "";
  document.getElementById("date").value = expense.date ? expense.date.split("T")[0] : "";
  document.getElementById("description").value = expense.description || "";

  editId = expense._id;
  switchTab("form");
};

/* ---------------- CANCEL EDIT ---------------- */
cancelEditBtn.addEventListener("click", () => {
  editId = null;
  form.reset();
});

/* ---------------- SEARCH + SORT ---------------- */
searchInput.addEventListener("input", renderExpenses);
sortSelect.addEventListener("change", renderExpenses);

/* ---------------- INITIAL LOAD ---------------- */
switchTab("overview");
fetchExpenses();