import { TestBed } from '@angular/core/testing'; // Fixed typo
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionsService]
    });

    service = TestBed.inject(TransactionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addIncome', () => {
    it('should send a POST request to add income', () => {
      const mockIncome = { amount: 1000, description: 'Salary' };

      service.addIncome(mockIncome).subscribe(response => {
        expect(response).toEqual(mockIncome);
      });

      const req = httpMock.expectOne(`${baseUrl}/incomes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockIncome);

      req.flush(mockIncome);
    });
  });

  describe('getIncomes', () => {
    it('should send a GET request to get incomes', () => {
      const userID = 1;
      const mockIncomes = [{ amount: 1000, description: 'Salary' }];
      const url = `${baseUrl}/incomes?user_id=${userID}`;

      service.getIncomes(userID).subscribe(response => {
        expect(response).toEqual(mockIncomes);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');

      req.flush(mockIncomes);
    });
  });

  describe('deleteIncome', () => {
    it('should send a DELETE request to delete income', () => {
      const incomeID = 1;

      service.deleteIncome(incomeID).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/incomes/${incomeID}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });

  describe('addExpense', () => {
    it('should send a POST request to add expense', () => {
      const mockExpense = { amount: 500, description: 'Groceries' };

      service.addExpense(mockExpense).subscribe(response => {
        expect(response).toEqual(mockExpense);
      });

      const req = httpMock.expectOne(`${baseUrl}/expenses`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockExpense);

      req.flush(mockExpense);
    });
  });

  describe('getExpenses', () => {
    it('should send a GET request to get expenses', () => {
      const userID = 1;
      const mockExpenses = [{ amount: 500, description: 'Groceries' }];
      const url = `${baseUrl}/expenses?user_id=${userID}`;

      service.getExpenses(userID).subscribe(response => {
        expect(response).toEqual(mockExpenses);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');

      req.flush(mockExpenses);
    });
  });

  describe('deleteExpense', () => {
    it('should send a DELETE request to delete expense', () => {
      const expenseID = 1;

      service.deleteExpense(expenseID).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/expenses/${expenseID}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });

  describe('updateExpense', () => {
    it('should send a PUT request to update expense', () => {
      const mockExpense = { id: 1, amount: 500, description: 'Groceries', Paid: true };

      service.updateExpense(mockExpense).subscribe(response => {
        expect(response).toEqual(mockExpense);
      });

      const req = httpMock.expectOne(`${baseUrl}/expenses/${mockExpense.id}/paid`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockExpense);

      req.flush(mockExpense);
    });
  });

  describe('addBudget', () => {
    it('should send a POST request to add budget', () => {
      const mockBudget = { amount: 2000, category: 'Monthly Budget' };

      service.addBudget(mockBudget).subscribe(response => {
        expect(response).toEqual(mockBudget);
      });

      const req = httpMock.expectOne(`${baseUrl}/budget`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBudget);

      req.flush(mockBudget);
    });
  });

  describe('getBudget', () => {
    it('should send a GET request to get budget', () => {
      const userID = 1;
      const mockBudget = { amount: 2000, category: 'Monthly Budget' };
      const url = `${baseUrl}/budget?user_id=${userID}`;

      service.getBudget(userID).subscribe(response => {
        expect(response).toEqual(mockBudget);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');

      req.flush(mockBudget);
    });
  });

  describe('deleteBudget', () => {
    it('should send a DELETE request to delete budget', () => {
      const budgetId = 1;

      service.deleteBudget(budgetId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/budget/${budgetId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });
});