import { of, throwError } from 'rxjs';
import { IncomeComponent } from './income.component';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let mockTransactionsService: any;
  let incomeSavedEmitSpy: jest.SpyInstance;
  let closeModalEmitSpy: jest.SpyInstance;

  beforeEach(() => {
    mockTransactionsService = {
      addIncome: jest.fn()
    };

    component = new IncomeComponent(mockTransactionsService);

    incomeSavedEmitSpy = jest.spyOn(component.incomeSaved, 'emit');
    closeModalEmitSpy = jest.spyOn(component.closeModal, 'emit');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should emit closeModal when close() is called', () => {
    component.close();
    expect(closeModalEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('should not call addIncome if required income fields are missing', () => {
    component.income = {
      amount: '',
      category: '',
      date: '',
      description: ''
    };

    component.saveIncome();

    expect(mockTransactionsService.addIncome).not.toHaveBeenCalled();
  });

  it('should call addIncome and emit incomeSaved then close when saving valid income', () => {
    const testDate = '2023-01-01';
    const testDescription = 'Valid income';
    component.income = {
      amount: '200',
      category: 'Food',
      date: testDate,
      description: testDescription
    };

    const expectedFormattedDate = new Date(testDate).toISOString().split('T')[0];

    const mockResponse = { id: 123, ...component.income };
    mockTransactionsService.addIncome.mockReturnValue(of(mockResponse));

    component.saveIncome();

    expect(mockTransactionsService.addIncome).toHaveBeenCalledTimes(1);

    const newIncomeArg = mockTransactionsService.addIncome.mock.calls[0][0];

    expect(newIncomeArg.user_id).toBe(1);
    expect(newIncomeArg.amount).toBe(200); 
    expect(newIncomeArg.category).toBe('Food');
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
      description: 'Test error scenario'
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
});
