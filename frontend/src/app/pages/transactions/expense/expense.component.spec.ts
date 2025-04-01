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
        category: 'Food',
        date: '2025-03-30',
        description: 'Lunch',
        Paid: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 1,
        amount: 50,
        category: 'Transportation',
        date: '2025-04-01',
        description: 'Taxi',
        Paid: true,
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
      description: '',
      Paid: false
    };

    component.saveExpense();
    expect(mockTransactionsService.addExpense).not.toHaveBeenCalled();
  });

  it('should call addExpense and emit expenseSaved then close when saving valid expense', () => {
    const testDate = '2025-03-31';
    const testDescription = 'Test expense description';
    component.loggedInUserId = 1;
    component.expense = {
      amount: '300',
      category: 'Food',
      date: testDate,
      description: testDescription,
      Paid: false
    };

    const expectedFormattedDate = new Date(testDate).toISOString().split('T')[0];
    const mockResponse = { id: '456', ...component.expense };
    mockTransactionsService.addExpense.mockReturnValue(of(mockResponse));

    component.saveExpense();

    expect(mockTransactionsService.addExpense).toHaveBeenCalledTimes(1);
    const newExpenseArg = mockTransactionsService.addExpense.mock.calls[0][0];
    
    expect(newExpenseArg.user_id).toBe(1);
    expect(newExpenseArg.amount).toBe(300);
    expect(newExpenseArg.category).toBe('Food');
    expect(newExpenseArg.date).toBe(expectedFormattedDate);
    expect(newExpenseArg.description).toBe(testDescription);
    expect(newExpenseArg.Paid).toBe(false);
    expect(newExpenseArg.created_at).toBeDefined();

    expect(expenseSavedEmitSpy).toHaveBeenCalledWith(mockResponse);
    expect(closeModalEmitSpy).toHaveBeenCalled();
  });

  it('should log an error and not emit events when addExpense fails', () => {
    component.expense = {
      amount: '200',
      category: 'Transportation',
      date: '2025-03-31',
      description: 'Error scenario',
      Paid: false
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

  describe('loadExpenses()', () => {
    it('should fetch expenses and populate expensesList', () => {
      component.loadExpenses();
      expect(mockTransactionsService.getExpenses).toHaveBeenCalledWith(1);
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
      component.expensesList = [...mockExpenses];
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

  describe('ngOnInit()', () => {
    it('should set loggedInUserId and call loadExpenses on initialization', () => {
      const loadSpy = jest.spyOn(component, 'loadExpenses');
      component.ngOnInit();
      expect(mockAuthService.getUserId).toHaveBeenCalled();
      expect(component.loggedInUserId).toBe(1);
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getExpenseStatus()', () => {
    it('should return "Paid" if expense is marked as paid', () => {
      const expense: Expense = { ...mockExpenses[1], Paid: true };
      const status = component.getExpenseStatus(expense);
      expect(status).toBe('Paid');
    });

    it('should return "Due" if expense date is today or future and not paid', () => {
      const today = new Date('2025-03-31');
      jest.useFakeTimers().setSystemTime(today);
      const expense: Expense = { ...mockExpenses[0], date: '2025-04-01', Paid: false };
      const status = component.getExpenseStatus(expense);
      expect(status).toBe('Due');
      jest.useRealTimers();
    });

    it('should return "Overdue" if expense date is past and not paid', () => {
      const today = new Date('2025-03-31');
      jest.useFakeTimers().setSystemTime(today);
      const expense: Expense = { ...mockExpenses[0], date: '2025-03-30', Paid: false };
      const status = component.getExpenseStatus(expense);
      expect(status).toBe('Overdue');
      jest.useRealTimers();
    });
  });

  describe('Properties', () => {
    it('should initialize with correct categories', () => {
      expect(component.categories).toEqual([
        'Housing', 'Utilities', 'Food', 'Transportation',
        'Healthcare', 'Insurance', 'Bills', 'Education',
        'Entertainment', 'Fitness', 'Personal Care', 'Miscellaneous'
      ]);
    });

    it('should initialize expense object with default values', () => {
      expect(component.expense).toEqual({
        amount: '',
        category: '',
        date: '',
        description: '',
        Paid: false
      });
    });

    it('should reflect input mode', () => {
      component.mode = 'view';
      expect(component.mode).toBe('view');
      component.mode = 'add';
      expect(component.mode).toBe('add');
    });
  });
});