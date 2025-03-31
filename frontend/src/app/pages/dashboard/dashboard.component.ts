import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ExpenseComponent } from '../transactions/expense/expense.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { IncomeComponent } from '../transactions/income/income.component';
import { BudgetComponent } from '../transactions/budget/budget.component';
import { TransactionsService } from '../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { startOfDay, subDays, isSameDay, format, parseISO } from 'date-fns';

// Define an interface for chart data to ensure proper types.
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderWidth?: number;
  }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, ExpenseComponent, IncomeComponent, SideNavComponent, BudgetComponent, HttpClientModule],
  providers: [ExpenseComponent, IncomeComponent, BudgetComponent, TransactionsService, AuthService],
  standalone: true
})
export class DashboardComponent implements OnInit, AfterViewInit {

  showExpenseModal = false;
  expenseMode: 'add' | 'view' = 'add'; 
  showIncomeModal = false;
  incomeMode: 'add' | 'view' = 'add'; 
  showBudgetModal = false;
  budgetMode: 'add' | 'view' = 'add'; 

  // Mock Data for other charts remain as-is.
  savings = 89236;
  income = 27632;
  expenses = 27632;
  loggedInUserId: number | null = null;

  // Chart Data definitions
  savingsChartData = {
    labels: ['Saved', 'Remaining'],
    datasets: [
      {
        data: [82, 18],
        backgroundColor: ['#f1c40f', '#ecf0f1'],
        borderWidth: 0,
      },
    ],
  };

  // Initialize incomeChartData with empty arrays.
  incomeChartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Income by Category',
        data: [] as number[],
        backgroundColor: ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#34495e', '#e74c3c', '#95a5a6'],
        borderWidth: 0,
      },
    ],
  };

  // Updated expensesChartData for a pie chart by category.
  expensesChartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Expenses by Category',
        data: [] as number[],
        // Colors for each category. Adjust/expand as needed.
        backgroundColor: ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#1abc9c', '#2ecc71', '#34495e', '#95a5a6', '#e67e22'],
        borderWidth: 0,
      },
    ],
  };

  // Weekly expenses chart data with explicit type annotation.
  weeklyExpensesChartData: ChartData = {
    labels: [], // Will be populated dynamically
    datasets: [
      {
        label: 'Weekly Expenses',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#3498db',
      },
    ],
  };

  // Store chart instances so we can update them later.
  weeklyExpensesChart: Chart | null = null;
  incomeChart: Chart | null = null;
  // New chart instance for expenses pie chart.
  expensesChart: Chart | null = null;

  // Predefined income categories. Any income not matching these goes into "Other".
  incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Rent', 'Benefits', 'Gifts', 'Other'];

  // Predefined expense categories – expanded to be more exhaustive and include specific bill payment types.
  expenseCategories = [
    'Housing',        // e.g., mortgage or rent
    'Utilities',      // e.g., electricity, water, gas
    'Food',
    'Transportation',
    'Healthcare',
    'Insurance',
    'Bills',          // Generic bill payments (could include subscriptions, phone, internet, etc.)
    'Education',
    'Entertainment',
    'Fitness',
    'Personal Care',
    'Miscellaneous'   // For any uncategorized expenses
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    public expenseInstance: ExpenseComponent,
    public incomeInstance: IncomeComponent,
    public budgetInstance: BudgetComponent,
    private transactionsService: TransactionsService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loggedInUserId = this.authService.getUserId();
    // Fetch income data and update the pie chart
    if (this.loggedInUserId) {
      this.fetchIncomeData(this.loggedInUserId);
      this.fetchExpenseData(this.loggedInUserId);
      this.fetchWeeklyExpenses(this.loggedInUserId);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cdr.detectChanges();

      // Slight delay to ensure canvas elements are available
      setTimeout(() => {
        const savingsCanvas = document.getElementById('savingsChart') as HTMLCanvasElement;
        const incomeCanvas = document.getElementById('incomeChart') as HTMLCanvasElement;
        const expensesCanvas = document.getElementById('expensesChart') as HTMLCanvasElement;
        const weeklyExpensesCanvas = document.getElementById('weeklyExpensesChart') as HTMLCanvasElement;

        if (savingsCanvas && incomeCanvas && expensesCanvas && weeklyExpensesCanvas) {
          new Chart(savingsCanvas, {
            type: 'doughnut',
            data: this.savingsChartData,
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              cutout: '70%',
            },
          });

          // Create and store the income pie chart instance.
          this.incomeChart = new Chart(incomeCanvas, {
            type: 'doughnut',
            data: this.incomeChartData,
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              cutout: '70%',
            },
          });

          // Create and store the expenses pie chart instance.
          this.expensesChart = new Chart(expensesCanvas, {
            type: 'doughnut',
            data: this.expensesChartData,
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              cutout: '70%',
            },
          });

          // Create and store the weekly expenses chart instance.
          this.weeklyExpensesChart = new Chart(weeklyExpensesCanvas, {
            type: 'bar',
            data: this.weeklyExpensesChartData,
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#333' },
                },
                y: {
                  grid: { display: true },
                  ticks: {
                    color: '#333',
                    stepSize: 100,
                  },
                },
              },
            },
          });
        }
      }, 100);
    }
  }

  /**
   * Fetch income data from the database, aggregate amounts by category,
   * and update the income chart.
   */
  fetchIncomeData(userId: number): void {
    this.transactionsService.getIncomes(userId).subscribe((incomes: any[]) => {
      const categoryTotals: { [key: string]: number } = {};
      this.incomeCategories.forEach(cat => categoryTotals[cat] = 0);

      incomes.forEach(income => {
        const cat = income.category;
        if (this.incomeCategories.includes(cat)) {
          categoryTotals[cat] += income.amount;
        } else {
          categoryTotals['Other'] += income.amount;
        }
      });

      const labels = Object.keys(categoryTotals);
      const data = labels.map(label => categoryTotals[label]);

      this.incomeChartData.labels = labels;
      this.incomeChartData.datasets[0].data = data;
      this.cdr.detectChanges();

      if (this.incomeChart) {
        this.incomeChart.data = this.incomeChartData;
        this.incomeChart.update();
      }
    }, error => {
      console.error('Error fetching incomes:', error);
    });
  }

  /**
   * Fetch expense data from the database, aggregate amounts by category,
   * and update the expenses pie chart.
   */
  fetchExpenseData(userId: number): void {
    this.transactionsService.getExpenses(userId).subscribe((expenses: any[]) => {
      // Initialize totals for each expense category.
      const categoryTotals: { [key: string]: number } = {};
      this.expenseCategories.forEach(cat => categoryTotals[cat] = 0);

      expenses.forEach(expense => {
        const cat = expense.category;
        // If the category exists in our predefined list, add the amount; otherwise, add to 'Miscellaneous'
        if (this.expenseCategories.includes(cat)) {
          categoryTotals[cat] += expense.amount;
        } else {
          categoryTotals['Miscellaneous'] += expense.amount;
        }
      });

      const labels = Object.keys(categoryTotals);
      const data = labels.map(label => categoryTotals[label]);

      this.expensesChartData.labels = labels;
      this.expensesChartData.datasets[0].data = data;
      this.cdr.detectChanges();

      if (this.expensesChart) {
        this.expensesChart.data = this.expensesChartData;
        this.expensesChart.update();
      }
    }, error => {
      console.error('Error fetching expenses:', error);
    });
  }

  /**
   * Fetch expenses from the database for the past week (last 7 days) and update the chart.
   * Assumes expense.date is in "YYYY-MM-DD" format.
   */
  fetchWeeklyExpenses(userId: number | null): void {
    this.transactionsService.getExpenses(userId).subscribe((expenses: any[]) => {
      const today = startOfDay(new Date());
      const pastWeekDates: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        pastWeekDates.push(subDays(today, i));
      }

      this.weeklyExpensesChartData.labels = pastWeekDates.map(date => format(date, 'EEE'));

      const weeklyTotals = new Array(7).fill(0);

      expenses.forEach(expense => {
        const expenseDate = parseISO(expense.date);
        if (expenseDate >= pastWeekDates[0] && expenseDate <= today) {
          pastWeekDates.forEach((date, index) => {
            if (isSameDay(expenseDate, date)) {
              weeklyTotals[index] += expense.amount;
            }
          });
        }
      });

      this.weeklyExpensesChartData.datasets[0].data = weeklyTotals;
      this.cdr.detectChanges();

      if (this.weeklyExpensesChart) {
        this.weeklyExpensesChart.data = this.weeklyExpensesChartData;
        this.weeklyExpensesChart.update();
      }
    }, error => {
      console.error('Error fetching weekly expenses:', error);
    });
  }

  openExpenseModal() {
    this.expenseMode = 'add';
    this.showExpenseModal = true;
  }
  
  viewExpenseDetails() {
    this.expenseMode = 'view';
    this.showExpenseModal = true;
  }

  closeExpenseModal() {
    this.showExpenseModal = false;
    // Refresh both weekly and pie chart expenses.
    this.fetchWeeklyExpenses(this.loggedInUserId);
    if (this.loggedInUserId) {
      this.fetchExpenseData(this.loggedInUserId);
    }
  }

  onExpenseSaved(expenseData: any) {
    this.expenseInstance.saveExpense();
    console.log('New expense:', expenseData);
    this.fetchWeeklyExpenses(this.loggedInUserId);
    if (this.loggedInUserId) {
      this.fetchExpenseData(this.loggedInUserId);
    }
  }

  openIncomeModal() {
    this.incomeMode = 'add';
    this.showIncomeModal = true;
  }
  
  viewIncomeDetails() {
    this.incomeMode = 'view';
    this.showIncomeModal = true;
  }

  openBudgetModal() {
    this.budgetMode = 'add';
    this.showBudgetModal = true;
  }
  
  viewBudgetDetails() {
    this.budgetMode = 'view';
    this.showBudgetModal = true;
  }
  
  closeIncomeModal() {
    this.showIncomeModal = false;
  }
  
  onIncomeSaved(incomeData: any) {
    this.incomeInstance.saveIncome();
    console.log('New income:', incomeData);
    if (this.loggedInUserId) {
      this.fetchIncomeData(this.loggedInUserId);
    }
  }

  closeBudgetModal() {
    this.showBudgetModal = false;
  }
  
  onBudgetSaved(budgetData: any) {
    this.budgetInstance.saveBudget();
    console.log('New budget:', budgetData);
  }
}
