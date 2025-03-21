import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ExpenseComponent } from '../transactions/expense/expense.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { IncomeComponent } from '../transactions/income/income.component';
import { BudgetComponent } from '../transactions/budget/budget.component';
import { TransactionsService } from '../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, ExpenseComponent, IncomeComponent, SideNavComponent, BudgetComponent, HttpClientModule],
  providers: [ExpenseComponent, IncomeComponent, BudgetComponent, TransactionsService],
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

  // Chart Data
  savingsChartData = {
    labels: ['Saved', 'Remaining'],
    datasets: [
      {
        data: [82, 18], // Mock percentage data
        backgroundColor: ['#f1c40f', '#ecf0f1'],
        borderWidth: 0,
      },
    ],
  };

  incomeChartData = {
    labels: ['Income', 'Other'],
    datasets: [
      {
        data: [70, 30], // Mock percentage data
        backgroundColor: ['#2ecc71', '#ecf0f1'],
        borderWidth: 0,
      },
    ],
  };

  expensesChartData = {
    labels: ['Expenses', 'Remaining'],
    datasets: [
      {
        data: [55, 45], // Mock percentage data
        backgroundColor: ['#e74c3c', '#ecf0f1'],
        borderWidth: 0,
      },
    ],
  };

  weeklyExpensesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Expenses',
        data: [200, 150, 300, 250, 400, 100, 50], // Mock daily expenses
        backgroundColor: '#3498db',
      },
    ],
  };
 

  constructor(
    private cdr: ChangeDetectorRef,
    public expenseInstance: ExpenseComponent,
    public incomeInstance: IncomeComponent,
    public budgetInstance: BudgetComponent,
    private transactionsService: TransactionsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Initialization logic
  }

  ngAfterViewInit(): void {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.cdr.detectChanges(); // Trigger change detection

      // Wait for a slight delay to ensure canvas elements are available
      setTimeout(() => {
        // Check if canvas elements exist
        const savingsCanvas = document.getElementById('savingsChart') as HTMLCanvasElement;
        const incomeCanvas = document.getElementById('incomeChart') as HTMLCanvasElement;
        const expensesCanvas = document.getElementById('expensesChart') as HTMLCanvasElement;
        const weeklyExpensesCanvas = document.getElementById('weeklyExpensesChart') as HTMLCanvasElement;

        // Check if all canvas elements are available before initializing charts
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

          new Chart(weeklyExpensesCanvas, {
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
      }, 100); // Slight delay to ensure elements are available
    }
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
  }
  onExpenseSaved(expenseData: any) {
    this.expenseInstance.saveExpense();
    console.log('New expense:', expenseData);
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
