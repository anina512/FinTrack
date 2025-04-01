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
        budget_amount: 5000,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        notes: 'Test notes',
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
    expect(mockAuthService.getUserId).toHaveBeenCalled();
    expect(component.loggedInUserId).toBe(1);
  });

  it('should load budget data successfully', () => {
    component.loggedInUserId = 1;
    component.loadBudget();
    expect(mockTransactionsService.getBudget).toHaveBeenCalledWith(1);
    expect(component.budgetList).toEqual(mockBudgetData);
  });

  it('should handle error when loading budget fails', () => {
    const errorResponse = new Error('Loading failed');
    mockTransactionsService.getBudget.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.loggedInUserId = 1;
    component.loadBudget();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching expenses:', errorResponse);
    consoleErrorSpy.mockRestore();
  });

  it('should delete budget successfully', () => {
    component.budgetList = mockBudgetData;
    const initialLength = component.budgetList.length;

    component.deleteBudget('1');

    expect(mockTransactionsService.deleteBudget).toHaveBeenCalledWith('1');
    expect(component.budgetList.length).toBe(initialLength - 1);
    expect(component.budgetList.some(b => b.id === '1')).toBe(false);
  });

  it('should handle error when deleting budget fails', () => {
    const errorResponse = new Error('Deletion failed');
    mockTransactionsService.deleteBudget.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.deleteBudget('1');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting expense:', errorResponse);
    consoleErrorSpy.mockRestore();
  });

  it('should not call addBudget if required budget fields are missing', () => {
    component.loggedInUserId = 1;
    component.budget = {
      name: '',
      budgetAmount: '',
      month: 0,
      year: 0,
      notes: '',
      startDate: '',
      endDate: ''
    };

    component.saveBudget();
    expect(mockTransactionsService.addBudget).not.toHaveBeenCalled();
  });

  it('should call addBudget and emit budgetSaved then close when saving valid budget', () => {
    const testName = 'Monthly Budget';
    const testBudgetAmount = '5000';
    const testMonth = 1;
    const testYear = 2023;
    const testNotes = 'Budget notes text';

    component.loggedInUserId = 1;
    component.budget = {
      name: testName,
      budgetAmount: testBudgetAmount,
      month: testMonth,
      year: testYear,
      notes: testNotes,
      startDate: '', // Will be calculated by calculateDates()
      endDate: ''    // Will be calculated by calculateDates()
    };

    const expectedBudget: Budget = {
      user_id: 1,
      budget_name: testName,
      budget_amount: parseFloat(testBudgetAmount),
      start_date: '2023-01-01', // Calculated based on month and year
      end_date: '2023-01-31',   // Calculated based on month and year
      notes: testNotes,
      created_at: expect.anything()
    };

    const mockResponse = { id: '789', ...expectedBudget };
    mockTransactionsService.addBudget.mockReturnValue(of(mockResponse));

    component.saveBudget();

    expect(mockTransactionsService.addBudget).toHaveBeenCalledTimes(1);

    const newBudgetArg = mockTransactionsService.addBudget.mock.calls[0][0];
    expect(newBudgetArg.user_id).toBe(1);
    expect(newBudgetArg.budget_name).toBe(testName);
    expect(newBudgetArg.budget_amount).toBe(5000);
    expect(newBudgetArg.start_date).toBe('2023-01-01');
    expect(newBudgetArg.end_date).toBe('2023-01-31');
    expect(newBudgetArg.notes).toBe(testNotes);
    expect(newBudgetArg.created_at).toBeDefined();

    expect(budgetSavedEmitSpy).toHaveBeenCalledWith(mockResponse);
    expect(closeModalEmitSpy).toHaveBeenCalled();
  });

  it('should log an error and not emit events when addBudget fails', () => {
    component.loggedInUserId = 1;
    component.budget = {
      name: 'Test Budget',
      budgetAmount: '3000',
      month: 5,
      year: 2023,
      notes: 'Failure test notes',
      startDate: '',
      endDate: ''
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