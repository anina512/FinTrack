import { TestBed } from '@angular/core/testing';
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
});
