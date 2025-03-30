import { of, throwError } from 'rxjs';
import { ExpenseComponent } from './expense.component';
import { Expense } from '../../../models/transactions.model';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let mockTransactionsService: any;
  let mockAuthService: any;
  let expenseSavedEmitSpy: jest.SpyInstance;
  let closeModalEmitSpy: jest.SpyInstance;
  let mockExpenses: Expense[];

  beforeEach(() => {
    mockExpenses = [
      {
        id: '1',
        user_id: 1,
        amount: 100,
        category: 'food',
        date: '2023-01-01',
        description: 'Lunch',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 1,
        amount: 50,
        category: 'transportation',
        date: '2023-01-02',
        description: 'Taxi',
        created_at: new Date().toISOString()
      }
    ];

    mockTransactionsService = {
      addExpense: jest.fn(),
      getExpenses: jest.fn().mockReturnValue(of(mockExpenses)),
      deleteExpense: jest.fn().mockReturnValue(of({}))
    };

    mockAuthService = {
      getUserId: jest.fn().mockReturnValue(1)
    };

    component = new ExpenseComponent(mockTransactionsService, mockAuthService);

    expenseSavedEmitSpy = jest.spyOn(component.expenseSaved, 'emit');
    closeModalEmitSpy = jest.spyOn(component.closeModal, 'emit');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Existing tests
  it('should emit closeModal when close() is called', () => {
    component.close();
    expect(closeModalEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('should not call addExpense if required expense fields are missing', () => {
    component.loggedInUserId = 1;
    component.expense = {
      amount: '',
      category: '',
      date: '',
      description: ''
    };

    component.saveExpense();
    expect(mockTransactionsService.addExpense).not.toHaveBeenCalled();
  });

  it('should call addExpense and emit expenseSaved then close when saving valid expense', () => {
    const testDate = '2023-01-01';
    const testDescription = 'Test expense description';
    component.loggedInUserId = 1;
    component.expense = {
      amount: '300',
      category: 'food',
      date: testDate,
      description: testDescription
    };

    const expectedFormattedDate = new Date(testDate).toISOString().split('T')[0];
    const mockResponse = { id: 456, ...component.expense };
    mockTransactionsService.addExpense.mockReturnValue(of(mockResponse));

    component.saveExpense();

    expect(mockTransactionsService.addExpense).toHaveBeenCalledTimes(1);
    const newExpenseArg = mockTransactionsService.addExpense.mock.calls[0][0];
    
    expect(newExpenseArg.user_id).toBe(1);
    expect(newExpenseArg.amount).toBe(300);
    expect(newExpenseArg.category).toBe('food');
    expect(newExpenseArg.date).toBe(expectedFormattedDate);
    expect(newExpenseArg.description).toBe(testDescription);
    expect(newExpenseArg.created_at).toBeDefined();

    expect(expenseSavedEmitSpy).toHaveBeenCalledWith(mockResponse);
    expect(closeModalEmitSpy).toHaveBeenCalled();
  });

  it('should log an error and not emit events when addExpense fails', () => {
    component.expense = {
      amount: '200',
      category: 'trip',
      date: '2023-02-01',
      description: 'Error scenario'
    };

    const errorResponse = new Error('API failure');
    mockTransactionsService.addExpense.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.saveExpense();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving expense:', errorResponse);
    expect(expenseSavedEmitSpy).not.toHaveBeenCalled();
    expect(closeModalEmitSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // New tests for untested methods
  describe('loadExpenses()', () => {
    it('should fetch expenses and populate expensesList', () => {
      component.loadExpenses();
      expect(mockTransactionsService.getExpenses).toHaveBeenCalled();
      expect(component.expensesList).toEqual(mockExpenses);
    });

    it('should handle error when loading expenses fails', () => {
      const error = new Error('Loading error');
      mockTransactionsService.getExpenses.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.loadExpenses();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching expenses:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteExpense()', () => {
    it('should delete expense and update expensesList', () => {
      component.expensesList = mockExpenses;
      const initialLength = component.expensesList.length;

      component.deleteExpense('1');

      expect(mockTransactionsService.deleteExpense).toHaveBeenCalledWith('1');
      expect(component.expensesList.length).toBe(initialLength - 1);
      expect(component.expensesList.some(e => e.id === '1')).toBe(false);
    });

    it('should handle error when deletion fails', () => {
      const error = new Error('Deletion error');
      mockTransactionsService.deleteExpense.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.deleteExpense('1');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting expense:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for ngOnInit
  it('should call loadExpenses on initialization', () => {
    const loadSpy = jest.spyOn(component, 'loadExpenses');
    component.ngOnInit();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  // Test for categories initialization
  it('should initialize with correct categories', () => {
    expect(component.categories).toEqual([
      'bills', 'education', 'food', 'trip', 
      'transportation', 'gym', 'others'
    ]);
  });
});
