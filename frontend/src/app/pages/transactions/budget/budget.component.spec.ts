import { of, throwError } from 'rxjs';
import { BudgetComponent } from './budget.component';
import { Budget } from '../../../models/transactions.model';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let mockTransactionsService: any;
  let mockAuthService: any;
  let budgetSavedEmitSpy: jest.SpyInstance;
  let closeModalEmitSpy: jest.SpyInstance;
  let mockBudgetData: Budget[];

  beforeEach(() => {
    mockBudgetData = [
      {
        id: '1',
        user_id: 1,
        budget_name: 'Test Budget',
        budget_amount: 5000, // Changed from monthly_income to budget_amount
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        notes: 'Test details', // Changed from details to notes
        created_at: new Date().toISOString()
      }
    ];

    mockTransactionsService = {
      addBudget: jest.fn(),
      getBudget: jest.fn().mockReturnValue(of(mockBudgetData)),
      deleteBudget: jest.fn().mockReturnValue(of({}))
    };

    mockAuthService = {
      getUserId: jest.fn().mockReturnValue(1)
    };

    component = new BudgetComponent(mockTransactionsService, mockAuthService);

    budgetSavedEmitSpy = jest.spyOn(component.budgetSaved, 'emit');
    closeModalEmitSpy = jest.spyOn(component.closeModal, 'emit');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should emit closeModal when close() is called', () => {
    component.close();
    expect(closeModalEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('should call loadBudget on initialization', () => {
    const loadBudgetSpy = jest.spyOn(component, 'loadBudget');
    component.ngOnInit();
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

    component.deleteBudget('1'); // Changed from deleteExpense to deleteBudget

    expect(mockTransactionsService.deleteBudget).toHaveBeenCalledWith('1');
    expect(component.budgetList.length).toBe(initialLength - 1);
    expect(component.budgetList.some(b => b.id === '1')).toBe(false);
  });

  it('should handle error when deleting budget fails', () => {
    const errorResponse = new Error('Deletion failed');
    mockTransactionsService.deleteBudget.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.deleteBudget('1'); // Changed from deleteExpense to deleteBudget

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting expense:', errorResponse);
    consoleErrorSpy.mockRestore();
  });

  it('should not call addBudget if required budget fields are missing', () => {
    component.budget = {
      name: '',
      budgetAmount: '', // Changed from monthlyIncome to budgetAmount
      month: 0, // Added missing required field
      year: 0,  // Added missing required field
      notes: 'Optional notes', // Changed from details to notes
      startDate: '',
      endDate: ''
    };

    component.saveBudget();
    expect(mockTransactionsService.addBudget).not.toHaveBeenCalled();
  });

  it('should call addBudget and emit budgetSaved then close when saving valid budget', () => {
    const testName = 'Monthly Budget';
    const testBudgetAmount = '5000'; // Changed from testMonthlyIncome to testBudgetAmount
    const testMonth = 1; // Added month
    const testYear = 2023; // Added year
    const testNotes = 'Budget details text'; // Changed from testDetails to testNotes
    component.loggedInUserId = 1;
    component.budget = {
      name: testName,
      budgetAmount: testBudgetAmount, // Changed from monthlyIncome to budgetAmount
      month: testMonth, // Added month
      year: testYear,   // Added year
      notes: testNotes, // Changed from details to notes
      startDate: '',    // Will be calculated
      endDate: ''       // Will be calculated
    };

    const expectedBudgetAmount = parseFloat(testBudgetAmount); // Changed from expectedMonthlyIncome

    const mockResponse = { id: '789', ...component.budget };
    mockTransactionsService.addBudget.mockReturnValue(of(mockResponse));

    component.saveBudget();

    expect(mockTransactionsService.addBudget).toHaveBeenCalledTimes(1);

    const newBudgetArg = mockTransactionsService.addBudget.mock.calls[0][0];
    expect(newBudgetArg.user_id).toBe(1);
    expect(newBudgetArg.budget_name).toBe(testName);
    expect(newBudgetArg.budget_amount).toBe(expectedBudgetAmount); // Changed from monthly_income
    expect(newBudgetArg.start_date).toBeDefined();
    expect(newBudgetArg.end_date).toBeDefined();
    expect(newBudgetArg.notes).toBe(testNotes); // Changed from details to notes
    expect(newBudgetArg.created_at).toBeDefined();

    expect(budgetSavedEmitSpy).toHaveBeenCalledWith(mockResponse);
    expect(closeModalEmitSpy).toHaveBeenCalled();
  });

  it('should log an error and not emit events when addBudget fails', () => {
    component.budget = {
      name: 'Test Budget',
      budgetAmount: '3000', // Changed from monthlyIncome to budgetAmount
      month: 5, // Added month
      year: 2023, // Added year
      notes: 'Failure test notes', // Changed from details to notes
      startDate: '', // Will be calculated
      endDate: ''    // Will be calculated
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
});