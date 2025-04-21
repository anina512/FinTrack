import { of, throwError } from 'rxjs';
import { ExpenseComponent } from './expense.component';
import { Expense } from '../../../models/transactions.model';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let mockTx: any;
  let mockAuth: any;
  let savedSpy: jest.SpyInstance;
  let closeSpy: jest.SpyInstance;

  const mockExpenses: Expense[] = [
    {
      id: '1',
      user_id: 1,
      amount: 100,
      category: 'Food',
      date: '2099-01-01',
      description: 'Lunch',
      Paid: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 1,
      amount: 50,
      category: 'Transportation',
      date: '2000-01-01',
      description: 'Taxi',
      Paid: true,
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
<<<<<<< HEAD
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
=======
    mockTx = {
>>>>>>> 6b2ea79 (Updated user page with tests)
      addExpense: jest.fn(),
      getExpenses: jest.fn().mockReturnValue(of(mockExpenses)),
      deleteExpense: jest.fn().mockReturnValue(of({}))
    };
    mockAuth = { getUserId: jest.fn().mockReturnValue(1) };
    component = new ExpenseComponent(mockTx, mockAuth);
    savedSpy = jest.spyOn(component.expenseSaved, 'emit');
    closeSpy = jest.spyOn(component.closeModal, 'emit');
  });

  afterEach(() => jest.clearAllMocks());

<<<<<<< HEAD
  // Existing tests
  it('should emit closeModal when close() is called', () => {
=======
  it('emits closeModal when close() called', () => {
>>>>>>> 6b2ea79 (Updated user page with tests)
    component.close();
    expect(closeSpy).toHaveBeenCalled();
  });

<<<<<<< HEAD
  it('should not call addExpense if required expense fields are missing', () => {
    component.loggedInUserId = 1;
    component.expense = {
      amount: '',
      category: '',
      date: '',
      description: ''
    };

=======
  it('does nothing when mandatory fields missing', () => {
    component.expense = { amount: '', category: '', date: '', description: '', Paid: false };
>>>>>>> 6b2ea79 (Updated user page with tests)
    component.saveExpense();
    expect(mockTx.addExpense).not.toHaveBeenCalled();
  });

<<<<<<< HEAD
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
=======
  it('saves valid expense and emits events', () => {
    component.loggedInUserId = 1;
    component.expense = {
      amount: '300',
      category: 'Food',
      date: '2023-05-05',
      description: 'Groceries',
      Paid: false
    };
    const resp = { id: '55', ...component.expense };
    mockTx.addExpense.mockReturnValue(of(resp));
    component.saveExpense();
    const arg: Expense = mockTx.addExpense.mock.calls[0][0];
    expect(arg.user_id).toBe(1);
    expect(arg.amount).toBe(300);
    expect(arg.date).toBe('2023-05-05');
    expect(savedSpy).toHaveBeenCalledWith(resp);
    expect(closeSpy).toHaveBeenCalled();
>>>>>>> 6b2ea79 (Updated user page with tests)
  });

  it('logs error when addExpense fails', () => {
    component.expense = {
<<<<<<< HEAD
      amount: '200',
      category: 'trip',
      date: '2023-02-01',
      description: 'Error scenario'
=======
      amount: '10',
      category: 'Food',
      date: '2023-01-01',
      description: 'Fail',
      Paid: false
>>>>>>> 6b2ea79 (Updated user page with tests)
    };
    const err = new Error('fail');
    mockTx.addExpense.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.saveExpense();
    expect(eSpy).toHaveBeenCalledWith('Error saving expense:', err);
    expect(savedSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

<<<<<<< HEAD
  // New tests for untested methods
  describe('loadExpenses()', () => {
    it('should fetch expenses and populate expensesList', () => {
      component.loadExpenses();
      expect(mockTransactionsService.getExpenses).toHaveBeenCalled();
      expect(component.expensesList).toEqual(mockExpenses);
=======
  it('loadExpenses populates list', () => {
    component.loadExpenses();
    expect(mockTx.getExpenses).toHaveBeenCalled();
    expect(component.expensesList).toEqual(mockExpenses);
  });

  it('handles loadExpenses error', () => {
    const err = new Error('load');
    mockTx.getExpenses.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.loadExpenses();
    expect(eSpy).toHaveBeenCalledWith('Error fetching expenses:', err);
  });

  it('deletes expense and updates list', () => {
    component.expensesList = [...mockExpenses];
    component.deleteExpense('1');
    expect(mockTx.deleteExpense).toHaveBeenCalledWith('1');
    expect(component.expensesList.some(e => e.id === '1')).toBe(false);
  });

  it('handles delete error', () => {
    const err = new Error('del');
    mockTx.deleteExpense.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.deleteExpense('1');
    expect(eSpy).toHaveBeenCalledWith('Error deleting expense:', err);
  });

  describe('getExpenseStatus', () => {
    it('returns Paid', () => {
      expect(component.getExpenseStatus({ ...mockExpenses[0], Paid: true })).toBe('Paid');
>>>>>>> 6b2ea79 (Updated user page with tests)
    });
    it('returns Due for future unpaid', () => {
      expect(component.getExpenseStatus(mockExpenses[0])).toBe('Due');
    });
    it('returns Overdue for past unpaid', () => {
      expect(component.getExpenseStatus({ ...mockExpenses[0], date: '2000-01-01' })).toBe('Overdue');
    });
  });

<<<<<<< HEAD
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
=======
  it('ngOnInit calls loadExpenses', () => {
    const spy = jest.spyOn(component, 'loadExpenses');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('has correct categories', () => {
    expect(component.categories).toEqual([
      'Housing', 'Utilities', 'Food', 'Transportation', 'Healthcare',
      'Insurance', 'Bills', 'Education', 'Entertainment',
      'Fitness', 'Personal Care', 'Miscellaneous'
    ]);
  });
>>>>>>> 6b2ea79 (Updated user page with tests)
});
