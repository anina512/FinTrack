import { of, throwError } from 'rxjs';
import { BudgetComponent } from './budget.component';
import { Budget } from '../../../models/transactions.model';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let mockTx: any;
  let mockAuth: any;
  let savedSpy: jest.SpyInstance;
  let closeSpy: jest.SpyInstance;

  const mockBudgets: Budget[] = [
    {
      id: '1',
      user_id: 1,
      budget_name: '2024 Budget',
      budget_amount: 5000,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      notes: 'note',
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
<<<<<<< HEAD
    mockBudgetData = [
      {
        id: '1',
        user_id: 1,
        budget_name: 'Test Budget',
        monthly_income: 5000,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        details: 'Test details',
        created_at: new Date().toISOString()
      }
    ];

    mockTransactionsService = {
=======
    mockTx = {
>>>>>>> 6b2ea79 (Updated user page with tests)
      addBudget: jest.fn(),
      getBudget: jest.fn().mockReturnValue(of(mockBudgets)),
      deleteBudget: jest.fn().mockReturnValue(of({}))
    };
    mockAuth = { getUserId: jest.fn().mockReturnValue(1) };
    component = new BudgetComponent(mockTx, mockAuth);
    savedSpy = jest.spyOn(component.budgetSaved, 'emit');
    closeSpy = jest.spyOn(component.closeModal, 'emit');
  });

  afterEach(() => jest.clearAllMocks());

  it('close() emits closeModal', () => {
    component.close();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('ngOnInit calls loadBudget', () => {
    const spy = jest.spyOn(component, 'loadBudget');
    component.ngOnInit();
<<<<<<< HEAD
    expect(loadBudgetSpy).toHaveBeenCalledTimes(1);
  });

  it('should load budget data successfully', () => {
    component.loadBudget();
    expect(mockTransactionsService.getBudget).toHaveBeenCalled();
    expect(component.budgetList).toEqual(mockBudgetData);
  });

  it('should handle error when loading budget fails', () => {
    const errorResponse = new Error('Loading failed');
    mockTransactionsService.getBudget.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    component.loadBudget();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching expenses:', errorResponse);
    consoleErrorSpy.mockRestore();
  });

  it('should delete budget successfully', () => {
    component.budgetList = mockBudgetData;
    const initialLength = component.budgetList.length;
    
    component.deleteExpense('1');
    
    expect(mockTransactionsService.deleteBudget).toHaveBeenCalledWith('1');
    expect(component.budgetList.length).toBe(initialLength - 1);
    expect(component.budgetList.some(b => b.id === '1')).toBe(false);
  });

  it('should handle error when deleting budget fails', () => {
    const errorResponse = new Error('Deletion failed');
    mockTransactionsService.deleteBudget.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    component.deleteExpense('1');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting expense:', errorResponse);
    consoleErrorSpy.mockRestore();
  });

  it('should not call addBudget if required budget fields are missing', () => {
    component.budget = {
      name: '',
      monthlyIncome: '',
=======
    expect(spy).toHaveBeenCalled();
  });

  it('loadBudget fills list', () => {
    component.loadBudget();
    expect(mockTx.getBudget).toHaveBeenCalled();
    expect(component.budgetList).toEqual(mockBudgets);
  });

  it('handles loadBudget error', () => {
    const err = new Error('load');
    mockTx.getBudget.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.loadBudget();
    expect(eSpy).toHaveBeenCalledWith('Error fetching expenses:', err);
  });

  it('deleteBudget updates list', () => {
    component.budgetList = [...mockBudgets];
    component.deleteBudget('1');
    expect(mockTx.deleteBudget).toHaveBeenCalledWith('1');
    expect(component.budgetList.length).toBe(0);
  });

  it('handles delete error', () => {
    const err = new Error('del');
    mockTx.deleteBudget.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.deleteBudget('1');
    expect(eSpy).toHaveBeenCalledWith('Error deleting expense:', err);
  });

  it('calculateDates sets correct start and end', () => {
    component.budget.month = 2;
    component.budget.year = 2025;
    component.calculateDates();
    expect(component.budget.startDate).toBe('2025-02-01');
    expect(component.budget.endDate).toBe('2025-02-28');
  });

  it('does not add budget when mandatory fields missing', () => {
    component.budget = { name: '', budgetAmount: '', month: 0, year: 0, notes: '', startDate: '', endDate: '' };
    component.saveBudget();
    expect(mockTx.addBudget).not.toHaveBeenCalled();
  });

  it('adds valid budget, emits and closes', () => {
    component.loggedInUserId = 1;
    component.budget = {
      name: 'May 25',
      budgetAmount: '3000',
      month: 5,
      year: 2025,
      notes: 'note',
      startDate: '',
      endDate: ''
    };
    const resp = { id: '55', ...component.budget };
    mockTx.addBudget.mockReturnValue(of(resp));

    component.saveBudget();

    const arg: Budget = mockTx.addBudget.mock.calls[0][0];
    expect(arg.user_id).toBe(1);
    expect(arg.budget_name).toBe('May 25');
    expect(arg.budget_amount).toBe(3000);
    expect(arg.start_date).toBe('2025-05-01');
    expect(arg.end_date).toBe('2025-05-31');
    expect(savedSpy).toHaveBeenCalledWith(resp);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('handles addBudget error', () => {
    component.budget = {
      name: 'Bad',
      budgetAmount: '1',
      month: 1,
      year: 2025,
      notes: '',
>>>>>>> 6b2ea79 (Updated user page with tests)
      startDate: '',
      endDate: '',
      details: 'Optional details'
    };
    const err = new Error('api');
    mockTx.addBudget.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.saveBudget();
    expect(eSpy).toHaveBeenCalledWith('Error saving budget:', err);
    expect(savedSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

<<<<<<< HEAD
  it('should call addBudget and emit budgetSaved then close when saving valid budget', () => {
    const testName = 'Monthly Budget';
    const testMonthlyIncome = '5000';
    const testStartDate = '2023-01-01';
    const testEndDate = '2023-12-31';
    const testDetails = 'Budget details text';
    component.loggedInUserId = 1;
    component.budget = {
      name: testName,
      monthlyIncome: testMonthlyIncome,
      startDate: testStartDate,
      endDate: testEndDate,
      details: testDetails
    };

    const expectedStartDate = new Date(testStartDate).toISOString().split('T')[0];
    const expectedEndDate = new Date(testEndDate).toISOString().split('T')[0];
    const expectedMonthlyIncome = parseFloat(testMonthlyIncome);

    const mockResponse = { id: 789, ...component.budget };
    mockTransactionsService.addBudget.mockReturnValue(of(mockResponse));

    component.saveBudget();

    expect(mockTransactionsService.addBudget).toHaveBeenCalledTimes(1);

    const newBudgetArg = mockTransactionsService.addBudget.mock.calls[0][0];
    expect(newBudgetArg.user_id).toBe(1);
    expect(newBudgetArg.budget_name).toBe(testName);
    expect(newBudgetArg.monthly_income).toBe(expectedMonthlyIncome);
    expect(newBudgetArg.start_date).toBe(expectedStartDate);
    expect(newBudgetArg.end_date).toBe(expectedEndDate);
    expect(newBudgetArg.details).toBe(testDetails);
    expect(newBudgetArg.created_at).toBeDefined();

    expect(budgetSavedEmitSpy).toHaveBeenCalledWith(mockResponse);
    expect(closeModalEmitSpy).toHaveBeenCalled();
  });

  it('should log an error and not emit events when addBudget fails', () => {
    component.budget = {
      name: 'Test Budget',
      monthlyIncome: '3000',
      startDate: '2023-05-01',
      endDate: '2023-09-01',
      details: 'Failure test details'
    };

    const errorResponse = new Error('API Error');
    mockTransactionsService.addBudget.mockReturnValue(throwError(() => errorResponse));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.saveBudget();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving budget:', errorResponse);
    expect(budgetSavedEmitSpy).not.toHaveBeenCalled();
    expect(closeModalEmitSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
=======
  it('months array contains all 12 months', () => {
    expect(component.months.map(m => m.value)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  });
>>>>>>> 6b2ea79 (Updated user page with tests)
});
