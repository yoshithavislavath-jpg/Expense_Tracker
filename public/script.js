const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");

const API_URL = "http://localhost:5000/expenses";

let editId = null;
let allExpenses = [];

// Load all expenses
async function fetchExpenses() {
  try {
    const response = await fetch(API_URL);
    const expenses = await response.json();

    allExpenses = expenses;
    expenseList.innerHTML = "";

    expenses.forEach((expense) => {
      const expenseCard = document.createElement("div");
      expenseCard.classList.add("expense-card");

      expenseCard.innerHTML = `
          <h3>${expense.title}</h3>
          <p><strong>Amount:</strong> ₹${expense.amount}</p>
          <p><strong>Category:</strong> ${expense.category}</p>
          <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${expense.description || "No description"}</p>

          <button onclick="editExpense('${expense._id}')">Edit</button>
          <button onclick="deleteExpense('${expense._id}')">Delete</button>
      `;

      window.deleteExpense = async function (id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete expense");
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

      expenseList.appendChild(expenseCard);
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

// Add expense
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

// Load expenses on page load
fetchExpenses();