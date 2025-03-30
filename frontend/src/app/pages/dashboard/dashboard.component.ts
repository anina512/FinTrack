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

  // Mock Data
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

  incomeChartData = {
    labels: ['Income', 'Other'],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ['#2ecc71', '#ecf0f1'],
        borderWidth: 0,
      },
    ],
  };

  expensesChartData = {
    labels: ['Expenses', 'Remaining'],
    datasets: [
      {
        data: [55, 45],
        backgroundColor: ['#e74c3c', '#ecf0f1'],
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

  // Store the weekly expenses chart instance so we can update it later.
  weeklyExpensesChart: Chart | null = null;

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
    this.fetchWeeklyExpenses(this.loggedInUserId);
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

          new Chart(incomeCanvas, {
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

          new Chart(expensesCanvas, {
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

      // Update chart labels dynamically using day abbreviations (e.g., Mon, Tue, etc.)
      this.weeklyExpensesChartData.labels = pastWeekDates.map(date => format(date, 'EEE'));

      // Initialize totals array for each day
      const weeklyTotals = new Array(7).fill(0);

      // Process expenses within the past week (from earliest date to today)
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

      // Update the chart data with computed totals
      this.weeklyExpensesChartData.datasets[0].data = weeklyTotals;
      this.cdr.detectChanges();

      // If the chart instance exists, update its data and redraw it.
      if (this.weeklyExpensesChart) {
        this.weeklyExpensesChart.data = this.weeklyExpensesChartData;
        this.weeklyExpensesChart.update();
      }
    }, error => {
      console.error('Error fetching expenses:', error);
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
  }

  onExpenseSaved(expenseData: any) {
    this.expenseInstance.saveExpense();
    console.log('New expense:', expenseData);
    this.fetchWeeklyExpenses(this.loggedInUserId);
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
  }

  closeBudgetModal() {
    this.showBudgetModal = false;
  }
  
  onBudgetSaved(budgetData: any) {
    this.budgetInstance.saveBudget();
    console.log('New budget:', budgetData);
  }
}
