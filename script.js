class ExpenseTracker {
	constructor() {
		this.transactions =
			JSON.parse(localStorage.getItem("transactions")) || [];
		this.isDarkMode = localStorage.getItem("darkMode") === "true" || false;
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.updateTheme();
		this.updateStats();
		this.renderTransactions();
		this.updateSelectStyles(); // Set initial select styles
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
			});
		});

		// Radio button interactions
		document.querySelectorAll('input[name="type"]').forEach((radio) => {
			radio.addEventListener("change", (e) => {
				document
					.querySelectorAll(".income-dot, .expense-dot")
					.forEach((dot) => dot.classList.add("hidden"));
				if (e.target.value === "income") {
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

		// Clear all transactions
		document.getElementById("clearAll").addEventListener("click", () => {
			if (confirm("Are you sure you want to clear all transactions?")) {
				this.clearAllTransactions();
			}
		});
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
		errorElement.classList.remove("hidden");

		// Add shake animation to the input
		const inputElement = document.getElementById(field);
		inputElement.classList.add("animate-shake");
		setTimeout(() => {
			inputElement.classList.remove("animate-shake");
		}, 500);
	}

	hideError(field) {
		const errorElement = document.getElementById(`${field}-error`);
		errorElement.classList.add("hidden");
	}

	toggleTheme() {
		this.isDarkMode = !this.isDarkMode;
		localStorage.setItem("darkMode", this.isDarkMode);
		this.updateTheme();
	}

	updateTheme() {
		const body = document.getElementById("body");
		const background = document.getElementById("background");
		const glassElements = document.querySelectorAll(".glass");
		const selectElements = document.querySelectorAll("select");
		const sunIcon = document.getElementById("sunIcon");
		const moonIcon = document.getElementById("moonIcon");

		if (this.isDarkMode) {
			body.className =
				"min-h-screen transition-all duration-500 bg-darkblack text-white";
			background.className =
				"min-h-screen p-4 sm:p-6 lg:p-8 gradient-bg-dark";
			glassElements.forEach((el) => {
				el.className =
					el.className
						.replace("glass-light", "")
						.replace("glass-dark", "") + " glass-dark";
			});
			selectElements.forEach((select) => {
				select.className =
					select.className.replace("glass-select-light", "") +
					" glass-select-dark";
			});
			sunIcon.classList.add("hidden");
			moonIcon.classList.remove("hidden");
		} else {
			body.className =
				"min-h-screen transition-all duration-500 bg-lightbg text-lighttext";
			background.className =
				"min-h-screen p-4 sm:p-6 lg:p-8 gradient-bg-light";
			glassElements.forEach((el) => {
				el.className =
					el.className
						.replace("glass-light", "")
						.replace("glass-dark", "") + " glass-light";
			});
			selectElements.forEach((select) => {
				select.className =
					select.className.replace("glass-select-dark", "") +
					" glass-select-light";
			});
			sunIcon.classList.remove("hidden");
			moonIcon.classList.add("hidden");
		}

		// Update select styles
		this.updateSelectStyles();
	}

	updateSelectStyles() {
		const select = document.getElementById("category");
		if (this.isDarkMode) {
			select.className =
				"w-full px-4 py-3 rounded-xl glass-select-dark border focus:ring-2 focus:ring-lightblue/50 transition-all duration-300 outline-none text-lighttext";
		} else {
			select.className =
				"w-full px-4 py-3 rounded-xl glass-select-light border focus:ring-2 focus:ring-lightblue/50 transition-all duration-300 outline-none text-lighttext";
		}
	}

	addTransaction() {
		const description = document.getElementById("description").value;
		const amount = parseFloat(document.getElementById("amount").value);
		const category = document.getElementById("category").value;
		const type = document.querySelector('input[name="type"]:checked').value;

		const transaction = {
			id: Date.now(),
			description,
			amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
			category,
			type,
			date: new Date().toLocaleDateString(),
			time: new Date().toLocaleTimeString(),
		};

		this.transactions.unshift(transaction);
		this.saveData();
		this.updateStats();
		this.renderTransactions();
		this.resetForm();

		// Add success animation
		const button = document.querySelector('button[type="submit"]');
		button.textContent = "✓ Added!";
		button.classList.remove("animate-pulse-soft");
		button.classList.add("bg-green-500", "from-green-500", "to-green-600");
		setTimeout(() => {
			button.textContent = "Add Transaction";
			button.classList.remove(
				"bg-green-500",
				"from-green-500",
				"to-green-600"
			);
			button.classList.add(
				"animate-pulse-soft",
				"from-lightblue",
				"to-lightpurple"
			);
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
		document.getElementById("transactionCount").textContent =
			this.transactions.length;

		const avgTransaction =
			this.transactions.length > 0
				? Math.abs(
						this.transactions.reduce(
							(sum, t) => sum + Math.abs(t.amount),
							0
						) / this.transactions.length
				  )
				: 0;
		document.getElementById(
			"avgTransaction"
		).textContent = `₹${avgTransaction.toFixed(0)}`;

		// Color code the balance
		const balanceElement = document.getElementById("netBalance");
		if (balance > 0) {
			balanceElement.className =
				"text-2xl font-bold text-green-400 transition-colors duration-300";
		} else if (balance < 0) {
			balanceElement.className =
				"text-2xl font-bold text-red-400 transition-colors duration-300";
		} else {
			balanceElement.className =
				"text-2xl font-bold text-lightblue transition-colors duration-300";
		}
	}

	renderTransactions() {
		const container = document.getElementById("transactionsList");

		if (this.transactions.length === 0) {
			container.innerHTML = `
                  <div class="text-center py-8 opacity-70 text-lighttext transition-colors duration-300">
                      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div class="glass rounded-xl p-4 hover:scale-102 transform transition-all duration-300 animate-fade-in" data-id="${
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
                                  ${
										transaction.category.split(" ")[0] ||
										transaction.category[0]
									}
                              </div>
                              <div>
                                  <p class="font-semibold text-lighttext transition-colors duration-300">${
										transaction.description
									}</p>
                                  <p class="text-sm opacity-80 text-lighttext transition-colors duration-300">${
										transaction.category
									} • ${transaction.date}</p>
                              </div>
                          </div>
                      </div>
                      <div class="text-right">
                          <p class="font-bold text-lg ${
								transaction.amount > 0
									? "text-green-400"
									: "text-red-400"
							} transition-colors duration-300">
                              ${transaction.amount > 0 ? "+" : "-"} ₹${Math.abs(
					transaction.amount
				).toFixed(2)}
                          </p>
                          <button onclick="tracker.deleteTransaction(${
								transaction.id
							})" 
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
		document
			.querySelectorAll(".income-dot, .expense-dot")
			.forEach((dot) => dot.classList.add("hidden"));

		// Hide all error messages
		document.querySelectorAll('[id$="-error"]').forEach((el) => {
			el.classList.add("hidden");
		});
	}

	saveData() {
		localStorage.setItem("transactions", JSON.stringify(this.transactions));
	}
}

// Initialize the app
const tracker = new ExpenseTracker();
