import { of, throwError } from 'rxjs';
import { IncomeComponent } from './income.component';
import { Income } from '../../../models/transactions.model';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let mockTx: any;
  let mockAuth: any;
  let savedSpy: jest.SpyInstance;
  let closeSpy: jest.SpyInstance;

  const mockIncomes: Income[] = [
    {
      id: '1',
      user_id: 1,
      amount: 1000,
      category: 'Food',
      date: '2023-01-01',
      description: 'Grocery income',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 1,
      amount: 2000,
      category: 'Transport',
      date: '2023-01-02',
      description: 'Transport allowance',
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    mockTx = {
      addIncome: jest.fn(),
      getIncomes: jest.fn().mockReturnValue(of(mockIncomes)),
      deleteIncome: jest.fn().mockReturnValue(of({}))
    };

    mockAuth = { getUserId: jest.fn().mockReturnValue(1) };

    component = new IncomeComponent(mockTx, mockAuth);
    savedSpy = jest.spyOn(component.incomeSaved, 'emit');
    closeSpy = jest.spyOn(component.closeModal, 'emit');
  });

  afterEach(() => jest.clearAllMocks());

  it('emits closeModal when close() is called', () => {
    component.close();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('does nothing when mandatory fields missing', () => {
    component.income = { amount: '', category: '', date: '', description: '' };
    component.saveIncome();
    expect(mockTx.addIncome).not.toHaveBeenCalled();
  });

  it('saves valid income, emits events and closes', () => {
    component.loggedInUserId = 1;
    component.income = {
      amount: '200',
      category: 'Food',
      date: '2023-03-03',
      description: 'Valid'
    };
    const resp = { id: '123', ...component.income };
    mockTx.addIncome.mockReturnValue(of(resp));

    component.saveIncome();

    const arg = mockTx.addIncome.mock.calls[0][0];
    expect(arg.user_id).toBe(1);
    expect(arg.amount).toBe(200);
    expect(arg.date).toBe('2023-03-03');
    expect(savedSpy).toHaveBeenCalledWith(resp);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('logs error when addIncome fails', () => {
    component.income = {
      amount: '150',
      category: 'Transport',
      date: '2023-04-04',
      description: 'err'
    };
    const err = new Error('net');
    mockTx.addIncome.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.saveIncome();
    expect(eSpy).toHaveBeenCalledWith('Error saving income:', err);
    expect(savedSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('loadIncomes populates list', () => {
    component.loadIncomes();
    expect(mockTx.getIncomes).toHaveBeenCalled();
    expect(component.incomeList).toEqual(mockIncomes);
  });

  it('handles loadIncomes error', () => {
    const err = new Error('load');
    mockTx.getIncomes.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.loadIncomes();
    expect(eSpy).toHaveBeenCalledWith('Error fetching incomes:', err);
  });

  it('deletes income and updates list', () => {
    component.incomeList = [...mockIncomes];
    component.deleteIncome('1');
    expect(mockTx.deleteIncome).toHaveBeenCalledWith('1');
    expect(component.incomeList.some(i => i.id === '1')).toBe(false);
  });

  it('handles delete error', () => {
    const err = new Error('del');
    mockTx.deleteIncome.mockReturnValue(throwError(() => err));
    const eSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.deleteIncome('1');
    expect(eSpy).toHaveBeenCalledWith('Error deleting income:', err);
  });

  it('ngOnInit calls loadIncomes', () => {
    const spy = jest.spyOn(component, 'loadIncomes');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('initializes category list correctly', () => {
    expect(component.categories).toEqual([
      'Salary', 'Freelance', 'Business', 'Investments',
      'Rent', 'Benefits', 'Gifts', 'Other'
    ]);
  });
});
