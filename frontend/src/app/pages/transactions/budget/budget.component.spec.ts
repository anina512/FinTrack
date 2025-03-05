import { of, throwError } from 'rxjs';
import { BudgetComponent } from './budget.component';
import { Budget } from '../../../models/transactions.model';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let mockTransactionsService: any;
  let budgetSavedEmitSpy: jest.SpyInstance;
  let closeModalEmitSpy: jest.SpyInstance;
  let mockBudgetData: Budget[];

  beforeEach(() => {
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
      addBudget: jest.fn(),
      getBudget: jest.fn().mockReturnValue(of(mockBudgetData)),
      deleteBudget: jest.fn().mockReturnValue(of({}))
    };

    component = new BudgetComponent(mockTransactionsService);

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
    expect(mockTransactionsService.getBudget).toHaveBeenCalledWith(1);
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
      startDate: '',
      endDate: '',
      details: 'Optional details'
    };

    component.saveBudget();
    expect(mockTransactionsService.addBudget).not.toHaveBeenCalled();
  });

  it('should call addBudget and emit budgetSaved then close when saving valid budget', () => {
    const testName = 'Monthly Budget';
    const testMonthlyIncome = '5000';
    const testStartDate = '2023-01-01';
    const testEndDate = '2023-12-31';
    const testDetails = 'Budget details text';

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
});
