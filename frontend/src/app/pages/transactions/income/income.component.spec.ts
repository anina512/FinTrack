import { of, throwError } from 'rxjs';
import { IncomeComponent } from './income.component';
import { Income } from '../../../models/transactions.model';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let mockTransactionsService: any;
  let mockAuthService: any;
  let incomeSavedEmitSpy: jest.SpyInstance;
  let closeModalEmitSpy: jest.SpyInstance;
  let mockIncomes: Income[];

  beforeEach(() => {
    mockIncomes = [
      {
        id: '1',
        user_id: 1,
        amount: 1000,
        category: 'Salary',
        date: '2023-01-01',
        description: 'Grocery income',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 1,
        amount: 2000,
        category: 'Freelance',
        date: '2023-01-02',
        description: 'Transport allowance',
        created_at: new Date().toISOString(),
      },
    ];

    mockTransactionsService = {
      addIncome: jest.fn(),
      getIncomes: jest.fn().mockReturnValue(of(mockIncomes)),
      deleteIncome: jest.fn().mockReturnValue(of({})),
    };

    mockAuthService = {
      getUserId: jest.fn().mockReturnValue(1),
    };

    component = new IncomeComponent(mockTransactionsService, mockAuthService);

    incomeSavedEmitSpy = jest.spyOn(component.incomeSaved, 'emit');
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

  it('should not call addIncome if required income fields are missing', () => {
    component.income = {
      amount: '',
      category: '',
      date: '',
      description: '',
    };

    component.saveIncome();
    expect(mockTransactionsService.addIncome).not.toHaveBeenCalled();
  });

  it('should call addIncome and emit incomeSaved then close when saving valid income', () => {
    const testDate = '2023-01-01';
    const testDescription = 'Valid income';
    component.loggedInUserId = 1;
    component.income = {
      amount: '200',
      category: 'Salary',
      date: testDate,
      description: testDescription,
    };

    const expectedFormattedDate = new Date(testDate).toISOString().split('T')[0];
    const mockResponse = { id: 123, ...component.income };
    mockTransactionsService.addIncome.mockReturnValue(of(mockResponse));

    component.saveIncome();

    expect(mockTransactionsService.addIncome).toHaveBeenCalledTimes(1);
    const newIncomeArg = mockTransactionsService.addIncome.mock.calls[0][0];

    expect(newIncomeArg.user_id).toBe(1);
    expect(newIncomeArg.amount).toBe(200);
    expect(newIncomeArg.category).toBe('Salary');
    expect(newIncomeArg.date).toBe(expectedFormattedDate);
    expect(newIncomeArg.description).toBe(testDescription);
    expect(newIncomeArg.created_at).toBeDefined();

    expect(incomeSavedEmitSpy).toHaveBeenCalledWith(mockResponse);
    expect(closeModalEmitSpy).toHaveBeenCalled();
  });

  it('should log an error and not emit events when addIncome fails', () => {
    component.income = {
      amount: '150',
      category: 'Transport',
      date: '2023-02-01',
      description: 'Test error scenario',
    };

    const errorResponse = new Error('Network error');
    mockTransactionsService.addIncome.mockReturnValue(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.saveIncome();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving income:', errorResponse);
    expect(incomeSavedEmitSpy).not.toHaveBeenCalled();
    expect(closeModalEmitSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // New tests for untested methods
  describe('loadIncomes()', () => {
    it('should fetch incomes and populate incomeList', () => {
      component.loadIncomes();
      expect(mockTransactionsService.getIncomes).toHaveBeenCalled();
      expect(component.incomeList).toEqual(mockIncomes);
    });

    it('should handle error when loading incomes fails', () => {
      const error = new Error('Loading error');
      mockTransactionsService.getIncomes.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.loadIncomes();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching incomes:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteIncome()', () => {
    it('should delete income and update incomeList', () => {
      component.incomeList = mockIncomes;
      const initialLength = component.incomeList.length;

      component.deleteIncome('1');

      expect(mockTransactionsService.deleteIncome).toHaveBeenCalledWith('1');
      expect(component.incomeList.length).toBe(initialLength - 1);
      expect(component.incomeList.some((i) => i.id === '1')).toBe(false);
    });

    it('should handle error when deletion fails', () => {
      const error = new Error('Deletion error');
      mockTransactionsService.deleteIncome.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.deleteIncome('1');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting income:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  // Test for ngOnInit
  it('should call loadIncomes on initialization', () => {
    const loadSpy = jest.spyOn(component, 'loadIncomes');
    component.ngOnInit();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  // Test for categories initialization
  it('should initialize with correct categories', () => {
    expect(component.categories).toEqual(['Salary', 'Freelance', 'Business', 'Investments', 'Rent', 'Benefits', 'Gifts', 'Other']);
  });
});