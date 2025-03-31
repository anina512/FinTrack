import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ExpenseComponent } from '../transactions/expense/expense.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { IncomeComponent } from '../transactions/income/income.component';
import { BudgetComponent } from '../transactions/budget/budget.component';
import { TransactionsService } from '../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { startOfDay, subDays, isSameDay, format, parseISO } from 'date-fns';

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

  savings = 89236;
  income = 0;
  expenses = 0;
  loggedInUserId: number | null = null;
  incomeComparisonText = '';
  expenseComparisonText = '';

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

  expensesChartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Expenses by Category',
        data: [] as number[],
        backgroundColor: ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#1abc9c', '#2ecc71', '#34495e', '#95a5a6', '#e67e22'],
        borderWidth: 0,
      },
    ],
  };

  weeklyExpensesChartData: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Weekly Expenses',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#3498db',
      },
    ],
  };

  weeklyExpensesChart: Chart | null = null;
  incomeChart: Chart | null = null;
  expensesChart: Chart | null = null;

  incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Rent', 'Benefits', 'Gifts', 'Other'];

  expenseCategories = [
    'Housing',
    'Utilities',
    'Food',
    'Transportation',
    'Healthcare',
    'Insurance',
    'Bills',
    'Education',
    'Entertainment',
    'Fitness',
    'Personal Care',
    'Miscellaneous'
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
    if (this.loggedInUserId) {
      this.fetchIncomeData(this.loggedInUserId);
      this.fetchExpenseData(this.loggedInUserId);
    }
    this.fetchWeeklyExpenses(this.loggedInUserId);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cdr.detectChanges();
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

  fetchIncomeData(userId: number): void {
    this.transactionsService.getIncomes(userId).subscribe((incomes: any[]) => {
      let totalIncome = 0;
      let currentMonthTotal = 0;
      let previousMonthTotal = 0;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const categoryTotals: { [key: string]: number } = {};
      this.incomeCategories.forEach(cat => categoryTotals[cat] = 0);
      incomes.forEach(income => {
        totalIncome += income.amount;
        const incomeDate = parseISO(income.date);
        if (incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear) {
          currentMonthTotal += income.amount;
        } else if (incomeDate.getMonth() === previousMonth && incomeDate.getFullYear() === previousMonthYear) {
          previousMonthTotal += income.amount;
        }
        const cat = income.category;
        if (this.incomeCategories.includes(cat)) {
          categoryTotals[cat] += income.amount;
        } else {
          categoryTotals['Other'] += income.amount;
        }
      });
      this.income = totalIncome;
      let percentDiff = 0;
      if (previousMonthTotal > 0) {
        percentDiff = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      }
      this.incomeComparisonText = previousMonthTotal > 0 ? `${percentDiff.toFixed(1)}% compared to last month` : 'No data for previous month';
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

  fetchExpenseData(userId: number): void {
    this.transactionsService.getExpenses(userId).subscribe((expenses: any[]) => {
      let totalExpenses = 0;
      let currentMonthTotal = 0;
      let previousMonthTotal = 0;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const categoryTotals: { [key: string]: number } = {};
      this.expenseCategories.forEach(cat => categoryTotals[cat] = 0);
      expenses.forEach(expense => {
        totalExpenses += expense.amount;
        const expenseDate = parseISO(expense.date);
        if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
          currentMonthTotal += expense.amount;
        } else if (expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousMonthYear) {
          previousMonthTotal += expense.amount;
        }
        const cat = expense.category;
        if (this.expenseCategories.includes(cat)) {
          categoryTotals[cat] += expense.amount;
        } else {
          categoryTotals['Miscellaneous'] += expense.amount;
        }
      });
      this.expenses = totalExpenses;
      let percentDiff = 0;
      if (previousMonthTotal > 0) {
        percentDiff = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      }
      this.expenseComparisonText = previousMonthTotal > 0 ? `${percentDiff.toFixed(1)}% compared to last month` : 'No data for previous month';
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
