// DOM Elements
const expenseForm = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expensesTableBody = document.querySelector('#expenses-table tbody');

const monthlyGoalInput = document.getElementById('monthly-goal');
const saveGoalBtn = document.getElementById('save-goal');
const goalDisplay = document.getElementById('goal-display');
const totalDisplay = document.getElementById('total-display');
const remainingDisplay = document.getElementById('remaining-display');

const toggleThemeBtn = document.getElementById('toggle-theme');
const alertContainer = document.getElementById('alert-container');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let monthlyGoal = parseFloat(localStorage.getItem('monthlyGoal')) || 0;
let categoryChart, trendChart;

// Save expenses
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Show alert
function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.textContent = message;
    alertContainer.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 3500);
}

// Add expense
function addExpense(e) {
    e.preventDefault();
    const expense = {
        id: Date.now(),
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value
    };
    expenses.push(expense);
    saveExpenses();
    renderExpenses();
    updateCharts();
    updateGoal();
    expenseForm.reset();
}

// Delete expense
function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderExpenses();
    updateCharts();
    updateGoal();
}

// Render expenses
function renderExpenses() {
    expensesTableBody.innerHTML = '';
    expenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.description}</td>
            <td>R${exp.amount.toFixed(2)}</td>
            <td>${exp.category}</td>
            <td>${exp.date}</td>
            <td><button class="delete-btn" onclick="deleteExpense(${exp.id})">Delete</button></td>
        `;
        expensesTableBody.appendChild(row);

        // Swipe delete for mobile
        let startX = 0;
        row.addEventListener('touchstart', e => startX = e.touches[0].clientX);
        row.addEventListener('touchend', e => {
            let endX = e.changedTouches[0].clientX;
            if(startX - endX > 50) deleteExpense(exp.id);
        });
    });
}

// Update goal display
function updateGoal() {
    const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    goalDisplay.textContent = `Goal: R${monthlyGoal.toFixed(2)}`;
    totalDisplay.textContent = `Total Spent: R${total.toFixed(2)}`;
    remainingDisplay.textContent = `Remaining: R${(monthlyGoal - total).toFixed(2)}`;

    if(total > monthlyGoal && monthlyGoal > 0) {
        showAlert('⚠️ You exceeded your monthly goal!');
    }
}

// Update charts
function updateCharts() {
    const categories = {};
    const months = {};

    expenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
        const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        months[month] = (months[month] || 0) + exp.amount;
    });

    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Spending by Category',
                data: Object.values(categories),
                backgroundColor: ['#4CAF50','#FF9800','#2196F3','#9C27B0','#f44336','#607d8b']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    if(trendChart) trendChart.destroy();
    trendChart = new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: Object.keys(months),
            datasets: [{
                label: 'Monthly Spending',
                data: Object.values(months),
                fill: false,
                borderColor: '#4CAF50',
                tension: 0.3,
                pointBackgroundColor: '#4CAF50',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Save monthly goal
saveGoalBtn.addEventListener('click', () => {
    monthlyGoal = parseFloat(monthlyGoalInput.value) || 0;
    localStorage.setItem('monthlyGoal', monthlyGoal);
    updateGoal();
});

// Theme toggle
toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if(document.body.classList.contains('dark')) {
        toggleThemeBtn.textContent = '☀️ Light Mode';
    } else {
        toggleThemeBtn.textContent = '🌙 Dark Mode';
    }
});

// Events
expenseForm.addEventListener('submit', addExpense);

// Initialize
renderExpenses();
updateCharts();
updateGoal();