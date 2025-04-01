import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { TransactionsService } from '../../services/transactions.service';
import { AuthService } from '../../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js';
import { Budget } from '../../models/transactions.model';

// Mock Chart.js to avoid canvas issues in JSDOM
jest.mock('chart.js', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {},
  }));
});

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockTransactionsService: jest.Mocked<TransactionsService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockCdr: jest.Mocked<ChangeDetectorRef>;

  beforeEach(async () => {
    // Mock services
    mockTransactionsService = {
      getIncomes: jest.fn(),
      getExpenses: jest.fn(),
      getBudget: jest.fn(),
      updateExpense: jest.fn(),
    } as any;

    mockAuthService = {
      getUserId: jest.fn().mockReturnValue(1),
    } as any;

    mockCdr = {
      detectChanges: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardComponent], // Standalone component
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user ID and fetch data on ngOnInit', fakeAsync(() => {
    // Mock responses
    mockTransactionsService.getIncomes.mockReturnValue(of([]));
    mockTransactionsService.getExpenses.mockReturnValue(of([]));
    mockTransactionsService.getBudget.mockReturnValue(of([]));

    // Spy on fetch methods
    const fetchIncomeSpy = jest.spyOn(component, 'fetchIncomeData');
    const fetchExpenseSpy = jest.spyOn(component, 'fetchExpenseData');
    const fetchWeeklySpy = jest.spyOn(component, 'fetchWeeklyExpenses');
    const fetchUpcomingSpy = jest.spyOn(component, 'fetchUpcomingPayments');
    const fetchAllIncomesSpy = jest.spyOn(component, 'fetchAllIncomes');
    const fetchAllExpensesSpy = jest.spyOn(component, 'fetchAllExpenses');
    const fetchBudgetSpy = jest.spyOn(component, 'fetchBudgetData');

    component.ngOnInit();
    tick();

    expect(mockAuthService.getUserId).toHaveBeenCalled();
    expect(component.loggedInUserId).toBe(1);
    expect(fetchIncomeSpy).toHaveBeenCalledWith(1);
    expect(fetchExpenseSpy).toHaveBeenCalledWith(1);
    expect(fetchWeeklySpy).toHaveBeenCalledWith(1);
    expect(fetchUpcomingSpy).toHaveBeenCalledWith(1);
    expect(fetchAllIncomesSpy).toHaveBeenCalledWith(1);
    expect(fetchAllExpensesSpy).toHaveBeenCalledWith(1);
    expect(fetchBudgetSpy).toHaveBeenCalledWith(1);
  }));

  it('should mark payment as paid and refresh upcoming payments', fakeAsync(() => {
    const payment = { id: 1, Paid: false, amount: 100, date: '2025-03-01' };
    mockTransactionsService.updateExpense.mockReturnValue(of({}));
    const fetchUpcomingSpy = jest.spyOn(component, 'fetchUpcomingPayments');

    component.loggedInUserId = 1;
    component.markAsPaid(payment);
    tick();

    expect(mockTransactionsService.updateExpense).toHaveBeenCalledWith({ ...payment, Paid: true });
    expect(fetchUpcomingSpy).toHaveBeenCalledWith(1);
  }));

  it('should fetch and process income data', fakeAsync(() => {
    const mockIncomes = [
      { amount: 1000, date: '2025-03-01', category: 'Salary' },
      { amount: 2000, date: '2025-02-01', category: 'Freelance' },
    ];
    mockTransactionsService.getIncomes.mockReturnValue(of(mockIncomes));

    component.loggedInUserId = 1;
    component.fetchIncomeData(component.loggedInUserId);
    tick();

    expect(mockTransactionsService.getIncomes).toHaveBeenCalledWith(1);
    expect(component.income).toBe(3000);
    expect(component.incomeChartData.labels).toContain('Salary');
    expect(component.incomeChartData.labels).toContain('Freelance');
    expect(component.incomeChartData.datasets[0].data).toContain(1000);
    expect(component.incomeChartData.datasets[0].data).toContain(2000);
  }));

  it('should fetch and process expense data', fakeAsync(() => {
    const mockExpenses = [
      { amount: 500, date: '2025-03-01', category: 'Food', Paid: false },
      { amount: 700, date: '2025-02-01', category: 'Utilities', Paid: false },
    ];
    mockTransactionsService.getExpenses.mockReturnValue(of(mockExpenses));

    component.loggedInUserId = 1;
    component.fetchExpenseData(component.loggedInUserId);
    tick();

    expect(mockTransactionsService.getExpenses).toHaveBeenCalledWith(1);
    expect(component.expenses).toBe(1200);
    expect(component.currentMonthExpenses).toBe(500);
    expect(component.expensesChartData.labels).toContain('Food');
    expect(component.expensesChartData.datasets[0].data).toContain(500);
  }));

  it('should fetch and process budget data', fakeAsync(() => {
    const mockBudgets: Budget[] = [
      {
        id: '1',
        user_id: 1,
        budget_name: 'March Budget',
        budget_amount: 2000,
        start_date: '2025-03-01',
        end_date: '2025-03-31',
        notes: '',
        created_at: '2025-03-01T00:00:00Z',
      },
    ];
    mockTransactionsService.getBudget.mockReturnValue(of(mockBudgets));

    // Mock current date as March 31, 2025
    jest.useFakeTimers().setSystemTime(new Date('2025-03-31'));

    component.loggedInUserId = 1;
    component.fetchBudgetData(component.loggedInUserId);
    tick();

    expect(mockTransactionsService.getBudget).toHaveBeenCalledWith(1);
    expect(component.currentMonthBudget).toBe(2000);
    jest.useRealTimers();
  }));

  it('should handle error when fetching incomes', fakeAsync(() => {
    mockTransactionsService.getIncomes.mockReturnValue(throwError(() => new Error('API error')));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    component.loggedInUserId = 1;
    component.fetchIncomeData(component.loggedInUserId);
    tick();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching incomes:', expect.anything() as any);
    consoleErrorSpy.mockRestore();
  }));

  it('should update savings chart when expenses and budget are fetched', fakeAsync(() => {
    const mockExpenses = [{ amount: 500, date: '2025-03-01', category: 'Food', Paid: false }];
    const mockBudgets: Budget[] = [
      {
        id: '1',
        user_id: 1,
        budget_name: 'March Budget',
        budget_amount: 2000,
        start_date: '2025-03-01',
        end_date: '2025-03-31',
        notes: '',
        created_at: '2025-03-01T00:00:00Z',
      },
    ];
    mockTransactionsService.getExpenses.mockReturnValue(of(mockExpenses));
    mockTransactionsService.getBudget.mockReturnValue(of(mockBudgets));

    jest.useFakeTimers().setSystemTime(new Date('2025-03-31'));

    component.loggedInUserId = 1;
    component.fetchExpenseData(component.loggedInUserId);
    tick();
    component.fetchBudgetData(component.loggedInUserId);
    tick();

    expect(component.savingsChartData.labels).toEqual(['Used', 'Remaining']);
    expect(component.savingsChartData.datasets[0].data).toEqual([500, 1500]);
    expect(component.savingsChartData.datasets[0].backgroundColor).toEqual(['#FF6B6B', '#FFD166']);

    jest.useRealTimers();
  }));

  it('should fetch weekly expenses', fakeAsync(() => {
    const mockExpenses = [
      { amount: 100, date: '2025-03-30', category: 'Food', Paid: false },
      { amount: 200, date: '2025-03-29', category: 'Utilities', Paid: false },
    ];
    mockTransactionsService.getExpenses.mockReturnValue(of(mockExpenses));

    jest.useFakeTimers().setSystemTime(new Date('2025-03-31'));

    component.loggedInUserId = 1;
    component.fetchWeeklyExpenses(component.loggedInUserId);
    tick();

    expect(mockTransactionsService.getExpenses).toHaveBeenCalledWith(1);
    expect(component.weeklyExpensesChartData.labels.length).toBe(7);
    expect(component.weeklyExpensesChartData.datasets[0].data).toContain(100);
    expect(component.weeklyExpensesChartData.datasets[0].data).toContain(200);

    jest.useRealTimers();
  }));

  it('should fetch upcoming payments', fakeAsync(() => {
    const mockExpenses = [
      { id: 1, amount: 100, date: '2025-04-01', Paid: false },
      { id: 2, amount: 200, date: '2025-04-02', Paid: true },
    ];
    mockTransactionsService.getExpenses.mockReturnValue(of(mockExpenses));

    component.loggedInUserId = 1;
    component.fetchUpcomingPayments(component.loggedInUserId);
    tick();

    expect(mockTransactionsService.getExpenses).toHaveBeenCalledWith(1);
    expect(component.upcomingPayments).toEqual([{ id: 1, amount: 100, date: '2025-04-01', Paid: false }]);
  }));
});