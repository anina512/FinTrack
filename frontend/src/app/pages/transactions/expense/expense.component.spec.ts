import { of, throwError } from 'rxjs';
import { ExpenseComponent } from './expense.component';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let mockTransactionsService: any;
  let expenseSavedEmitSpy: jest.SpyInstance;
  let closeModalEmitSpy: jest.SpyInstance;

  beforeEach(() => {
    mockTransactionsService = {
      addExpense: jest.fn()
    };

    component = new ExpenseComponent(mockTransactionsService);

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
});
