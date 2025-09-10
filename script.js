class ExpenseTracker {
	constructor() {
		this.transactions =
			JSON.parse(localStorage.getItem("transactions")) || [];
		this.isDarkMode = localStorage.getItem("darkMode") === "true" || false;
		this.currentPeriod = "daily";
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.updateTheme();
		this.updateStats();
		this.renderTransactions();
		this.renderExpenseTracking();
		// Set default date to today
		document.getElementById("date").valueAsDate = new Date();
	}

	setupEventListeners() {
		// Theme toggle
		document.getElementById("themeToggle").addEventListener("click", () => {
			this.toggleTheme();
		});

		// Form submission
		document
			.getElementById("expenseForm")
			.addEventListener("submit", (e) => {
				e.preventDefault();
				if (this.validateForm()) {
					this.addTransaction();
				}
			});

		// Tab buttons
		document.querySelectorAll(".tab-button").forEach((button) => {
			button.addEventListener("click", (e) => {
				this.setActiveTab(e.target.dataset.period);
			});
		});

		// Clear all transactions
		document.getElementById("clearAll").addEventListener("click", () => {
			if (confirm("Are you sure you want to clear all transactions?")) {
				this.clearAllTransactions();
			}
		});

		// Input validation on change
		document.getElementById("description").addEventListener("input", () => {
			this.hideError("description");
		});

		document.getElementById("amount").addEventListener("input", () => {
			this.hideError("amount");
		});

		document.getElementById("category").addEventListener("change", () => {
			this.hideError("category");
		});

		document.querySelectorAll('input[name="type"]').forEach((radio) => {
			radio.addEventListener("change", () => {
				this.hideError("type");
				document
					.querySelectorAll(".income-dot, .expense-dot")
					.forEach((dot) => dot.classList.add("hidden"));
				if (radio.value === "income") {
					document
						.querySelector(".income-dot")
						.classList.remove("hidden");
				} else {
					document
						.querySelector(".expense-dot")
						.classList.remove("hidden");
				}
			});
		});
	}

	setActiveTab(period) {
		this.currentPeriod = period;

		// Update UI
		document.querySelectorAll(".tab-button").forEach((button) => {
			button.classList.remove("active");
		});
		document
			.querySelector(`[data-period="${period}"]`)
			.classList.add("active");

		// Update expense tracking
		this.renderExpenseTracking();
	}

	validateForm() {
		let isValid = true;
		const description = document.getElementById("description").value.trim();
		const amount = document.getElementById("amount").value;
		const category = document.getElementById("category").value;
		const type = document.querySelector('input[name="type"]:checked');

		// Validate description
		if (!description) {
			this.showError("description", "Please enter a description");
			isValid = false;
		}

		// Validate amount
		if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
			this.showError("amount", "Please enter a valid amount");
			isValid = false;
		}

		// Validate category
		if (!category) {
			this.showError("category", "Please select a category");
			isValid = false;
		}

		// Validate type
		if (!type) {
			this.showError("type", "Please select a type");
			isValid = false;
		}

		return isValid;
	}

	showError(field, message) {
		const errorElement = document.getElementById(`${field}-error`);
		errorElement.textContent = message;
		errorElement.style.display = "block";

		// Add shake animation to the input
		const inputElement = document.getElementById(field);
		inputElement.classList.add("animate-shake");
		setTimeout(() => {
			inputElement.classList.remove("animate-shake");
		}, 500);
	}

	hideError(field) {
		const errorElement = document.getElementById(`${field}-error`);
		errorElement.style.display = "none";
	}

	toggleTheme() {
		this.isDarkMode = !this.isDarkMode;
		localStorage.setItem("darkMode", this.isDarkMode);
		this.updateTheme();
	}

	updateTheme() {
		const body = document.getElementById("body");
		const background = document.getElementById("background");
		const glassElements = document.querySelectorAll(
			".glass-light, .glass-dark"
		);
		const errorMessages = document.querySelectorAll(".error-message");
		const inputs = document.querySelectorAll(
			"input, select, textarea, button"
		);
		const sunIcon = document.getElementById("sunIcon");
		const moonIcon = document.getElementById("moonIcon");
		const scrollbars = document.querySelectorAll(".custom-scrollbar");

		if (this.isDarkMode) {
			// Body / background
			body.classList.remove("bg-lightbg", "text-lighttext");
			body.classList.add("bg-darkblack", "text-white");

			background.classList.remove("gradient-bg-light");
			background.classList.add("gradient-bg-dark");

			// Glass elements (cards, inputs, selects)
			glassElements.forEach((el) => {
				el.classList.remove("glass-light");
				el.classList.add("glass-dark");
			});

			// Error message style
			errorMessages.forEach((el) => {
				el.classList.remove("error-message-light");
				el.classList.add("error-message-dark");
			});

			// Inputs that originally used glass-light
			inputs.forEach((input) => {
				if (input.classList.contains("glass-light")) {
					input.classList.remove("glass-light");
					input.classList.add("glass-dark");
				}
			});

			// Scrollbars
			scrollbars.forEach((el) => {
				el.classList.remove("custom-scrollbar-light");
				el.classList.add("custom-scrollbar-dark");
			});

			sunIcon.classList.add("hidden");
			moonIcon.classList.remove("hidden");
		} else {
			// Light theme
			body.classList.remove("bg-darkblack", "text-white");
			body.classList.add("bg-lightbg", "text-lighttext");

			background.classList.remove("gradient-bg-dark");
			background.classList.add("gradient-bg-light");

			glassElements.forEach((el) => {
				el.classList.remove("glass-dark");
				el.classList.add("glass-light");
			});

			errorMessages.forEach((el) => {
				el.classList.remove("error-message-dark");
				el.classList.add("error-message-light");
			});

			inputs.forEach((input) => {
				if (input.classList.contains("glass-dark")) {
					input.classList.remove("glass-dark");
					input.classList.add("glass-light");
				}
			});

			scrollbars.forEach((el) => {
				el.classList.remove("custom-scrollbar-dark");
				el.classList.add("custom-scrollbar-light");
			});

			sunIcon.classList.remove("hidden");
			moonIcon.classList.add("hidden");
		}

		// Re-render dynamic pieces so newly-created elements also match theme
		this.renderTransactions();
		this.renderExpenseTracking();
	}

	addTransaction() {
		const description = document.getElementById("description").value;
		const amount = parseFloat(document.getElementById("amount").value);
		const category = document.getElementById("category").value;
		const type = document.querySelector('input[name="type"]:checked').value;
		const date = document.getElementById("date").value;

		const transaction = {
			id: Date.now(),
			description,
			amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
			category,
			type,
			date,
		};

		this.transactions.unshift(transaction);
		this.saveData();
		this.updateStats();
		this.renderTransactions();
		this.renderExpenseTracking();
		this.resetForm();

		// Add success animation
		const button = document.querySelector('button[type="submit"]');
		const originalText = button.textContent;
		button.textContent = "✓ Added!";
		button.classList.remove("animate-pulse-soft");
		button.classList.add("bg-green-500");
		setTimeout(() => {
			button.textContent = originalText;
			button.classList.remove("bg-green-500");
			button.classList.add("animate-pulse-soft");
		}, 1000);
	}

	deleteTransaction(id) {
		// Add delete animation
		const element = document.querySelector(`[data-id="${id}"]`);
		if (element) {
			element.classList.add("opacity-0", "transform", "-translate-x-10");
			setTimeout(() => {
				this.transactions = this.transactions.filter(
					(t) => t.id !== id
				);
				this.saveData();
				this.updateStats();
				this.renderTransactions();
				this.renderExpenseTracking();
			}, 300);
		}
	}

	clearAllTransactions() {
		// Add clear animation
		const container = document.getElementById("transactionsList");
		container.classList.add("opacity-0");
		setTimeout(() => {
			this.transactions = [];
			this.saveData();
			this.updateStats();
			this.renderTransactions();
			this.renderExpenseTracking();
			container.classList.remove("opacity-0");
		}, 300);
	}

	updateStats() {
		const income = this.transactions
			.filter((t) => t.amount > 0)
			.reduce((sum, t) => sum + t.amount, 0);

		const expenses = Math.abs(
			this.transactions
				.filter((t) => t.amount < 0)
				.reduce((sum, t) => sum + t.amount, 0)
		);

		const balance = income - expenses;

		document.getElementById("totalIncome").textContent = `₹${income.toFixed(
			2
		)}`;
		document.getElementById(
			"totalExpenses"
		).textContent = `₹${expenses.toFixed(2)}`;
		document.getElementById("netBalance").textContent = `₹${balance.toFixed(
			2
		)}`;

		// Update time period expenses
		this.updateTimePeriodExpenses();

		// Color code the balance
		const balanceElement = document.getElementById("netBalance");
		if (balance > 0) {
			balanceElement.classList.add("text-green-400");
			balanceElement.classList.remove("text-red-400", "text-lightblue");
		} else if (balance < 0) {
			balanceElement.classList.add("text-red-400");
			balanceElement.classList.remove("text-green-400", "text-lightblue");
		} else {
			balanceElement.classList.add("text-lightblue");
			balanceElement.classList.remove("text-green-400", "text-red-400");
		}
	}

	updateTimePeriodExpenses() {
		const now = new Date();
		const today = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);
		const weekStart = new Date(today);
		weekStart.setDate(today.getDate() - today.getDay());
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const yearStart = new Date(now.getFullYear(), 0, 1);

		const dailyExpenses = Math.abs(
			this.transactions
				.filter((t) => t.amount < 0 && new Date(t.date) >= today)
				.reduce((sum, t) => sum + t.amount, 0)
		);

		const weeklyExpenses = Math.abs(
			this.transactions
				.filter((t) => t.amount < 0 && new Date(t.date) >= weekStart)
				.reduce((sum, t) => sum + t.amount, 0)
		);

		const monthlyExpenses = Math.abs(
			this.transactions
				.filter((t) => t.amount < 0 && new Date(t.date) >= monthStart)
				.reduce((sum, t) => sum + t.amount, 0)
		);

		const yearlyExpenses = Math.abs(
			this.transactions
				.filter((t) => t.amount < 0 && new Date(t.date) >= yearStart)
				.reduce((sum, t) => sum + t.amount, 0)
		);

		document.getElementById(
			"dailyExpenses"
		).textContent = `₹${dailyExpenses.toFixed(2)}`;
		document.getElementById(
			"weeklyExpenses"
		).textContent = `₹${weeklyExpenses.toFixed(2)}`;
		document.getElementById(
			"monthlyExpenses"
		).textContent = `₹${monthlyExpenses.toFixed(2)}`;
		document.getElementById(
			"yearlyExpenses"
		).textContent = `₹${yearlyExpenses.toFixed(2)}`;
	}

	renderExpenseTracking() {
		const container = document.getElementById("expenseTracking");

		if (this.transactions.length === 0) {
			container.innerHTML = `
        <div class="text-center py-8 opacity-50">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p>No transactions yet</p>
          <p class="text-sm">Add your first transaction to get started!</p>
        </div>
      `;
			return;
		}

		let filteredTransactions = [];
		const now = new Date();

		switch (this.currentPeriod) {
			case "daily":
				const today = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate()
				);
				filteredTransactions = this.transactions.filter(
					(t) => t.amount < 0 && new Date(t.date) >= today
				);
				break;
			case "weekly":
				const weekStart = new Date(now);
				weekStart.setDate(now.getDate() - now.getDay());
				weekStart.setHours(0, 0, 0, 0);
				filteredTransactions = this.transactions.filter(
					(t) => t.amount < 0 && new Date(t.date) >= weekStart
				);
				break;
			case "monthly":
				const monthStart = new Date(
					now.getFullYear(),
					now.getMonth(),
					1
				);
				filteredTransactions = this.transactions.filter(
					(t) => t.amount < 0 && new Date(t.date) >= monthStart
				);
				break;
			case "yearly":
				const yearStart = new Date(now.getFullYear(), 0, 1);
				filteredTransactions = this.transactions.filter(
					(t) => t.amount < 0 && new Date(t.date) >= yearStart
				);
				break;
			case "lifetime":
				filteredTransactions = this.transactions.filter(
					(t) => t.amount < 0
				);
				break;
		}

		if (filteredTransactions.length === 0) {
			container.innerHTML = `
        <div class="text-center py-8 opacity-50">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p>No expenses for this period</p>
        </div>
      `;
			return;
		}

		const total = Math.abs(
			filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
		);

		// Group by category
		const categories = {};
		filteredTransactions.forEach((t) => {
			if (!categories[t.category]) {
				categories[t.category] = 0;
			}
			categories[t.category] += Math.abs(t.amount);
		});

		// Sort categories by amount
		const sortedCategories = Object.entries(categories).sort(
			(a, b) => b[1] - a[1]
		);

		container.innerHTML = `
      <div class="mb-4">
        <p class="text-sm opacity-70">Total ${this.currentPeriod} expenses</p>
        <p class="text-2xl font-bold text-lightblue">₹${total.toFixed(2)}</p>
      </div>
      <div class="space-y-3">
        ${sortedCategories
			.map(
				([category, amount]) => `
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-lightblue"></div>
              <span class="text-sm">${category}</span>
            </div>
            <div class="text-right">
              <p class="font-medium">₹${amount.toFixed(2)}</p>
              <p class="text-xs opacity-70">${((amount / total) * 100).toFixed(
					1
				)}%</p>
            </div>
          </div>
        `
			)
			.join("")}
      </div>
    `;
	}

	renderTransactions() {
		const container = document.getElementById("transactionsList");

		if (this.transactions.length === 0) {
			container.innerHTML = `
        <div class="text-center py-8 opacity-50">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.5a2.5 2.5 0 00-2.5 2.5v2.5a2.5 2.5 0 002.5 2.5H20V13z"></path>
          </svg>
          <p>No transactions yet</p>
          <p class="text-sm">Add your first transaction to get started!</p>
          </div>
      `;
			return;
		}

		container.innerHTML = this.transactions
			.map(
				(transaction) => `
      <div class="glass-light rounded-xl p-4 hover:scale-102 transform transition-all duration-300 animate-fade-in" data-id="${
			transaction.id
		}">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <div class="w-14 h-10 rounded-lg bg-gradient-to-r text-xs p-5 ${
					transaction.amount > 0
						? "from-green-500 to-green-400"
						: "from-red-500 to-red-400"
				} flex items-center justify-center text-white font-bold transition-all duration-300">
                ${transaction.category.charAt(0)}
              </div>
              <div>
                <p class="font-semibold">${transaction.description}</p>
                <p class="text-sm opacity-80">${transaction.category} • ${
					transaction.date
				}</p>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-lg ${
				transaction.amount > 0 ? "text-green-400" : "text-red-400"
			}">
              ${transaction.amount > 0 ? "+" : "-"} ₹${Math.abs(
					transaction.amount
				).toFixed(2)}
            </p>
            <button onclick="tracker.deleteTransaction(${transaction.id})" 
              class="text-red-400 hover:bg-red-500/20 px-2 py-1 rounded text-sm mt-1 transition-all duration-300">
              Delete
            </button>
          </div>
        </div>
      </div>
    `
			)
			.join("");
	}

	resetForm() {
		document.getElementById("expenseForm").reset();
		document.getElementById("date").valueAsDate = new Date();
		document
			.querySelectorAll(".income-dot, .expense-dot")
			.forEach((dot) => dot.classList.add("hidden"));

		// Hide all error messages
		document.querySelectorAll(".error-message").forEach((el) => {
			el.style.display = "none";
		});
	}

	saveData() {
		localStorage.setItem("transactions", JSON.stringify(this.transactions));
	}
}

// Initialize the app
const tracker = new ExpenseTracker();
