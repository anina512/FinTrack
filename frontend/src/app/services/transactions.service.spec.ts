import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
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

    service   = TestBed.inject(TransactionsService);
    httpMock  = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /* ────────────────  Income  ──────────────── */
  it('addIncome ⇒ POST /incomes', () => {
    const income = { amount: 1000, description: 'Salary' };

    service.addIncome(income).subscribe(r => expect(r).toEqual(income));

    const req = httpMock.expectOne(`${baseUrl}/incomes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(income);
    req.flush(income);
  });

  it('getIncomes ⇒ GET /incomes?user_id', () => {
    const userId = 1;
    const mock   = [{ amount: 1000, description: 'Salary' }];

    service.getIncomes(userId).subscribe(r => expect(r).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/incomes?user_id=${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deleteIncome ⇒ DELETE /incomes/:id', () => {
    const id = 1;

    service.deleteIncome(id).subscribe(r => expect(r).toBeNull());

    const req = httpMock.expectOne(`${baseUrl}/incomes/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  /* ────────────────  Expense  ─────────────── */
  it('addExpense ⇒ POST /expenses', () => {
    const exp = { amount: 500, description: 'Groceries' };

    service.addExpense(exp).subscribe(r => expect(r).toEqual(exp));

    const req = httpMock.expectOne(`${baseUrl}/expenses`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(exp);
    req.flush(exp);
  });

  it('getExpenses ⇒ GET /expenses?user_id', () => {
    const userId = 1;
    const mock   = [{ amount: 500, description: 'Groceries' }];

    service.getExpenses(userId).subscribe(r => expect(r).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/expenses?user_id=${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deleteExpense ⇒ DELETE /expenses/:id', () => {
    const id = 1;

    service.deleteExpense(id).subscribe(r => expect(r).toBeNull());

    const req = httpMock.expectOne(`${baseUrl}/expenses/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('updateExpense ⇒ PUT /expenses/:id/paid', () => {
    const exp = { id: 9, amount: 50, paid: true };

    service.updateExpense(exp).subscribe(r => expect(r).toEqual(exp));

    const req = httpMock.expectOne(`${baseUrl}/expenses/${exp.id}/paid`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(exp);
    req.flush(exp);
  });

  /* ────────────────  Budget  ──────────────── */
  it('addBudget ⇒ POST /budget', () => {
    const budget = { amount: 2000, category: 'Monthly Budget' };

    service.addBudget(budget).subscribe(r => expect(r).toEqual(budget));

    const req = httpMock.expectOne(`${baseUrl}/budget`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(budget);
    req.flush(budget);
  });

  it('getBudget ⇒ GET /budget?user_id', () => {
    const userId = 1;
    const mock   = { amount: 2000, category: 'Monthly Budget' };

    service.getBudget(userId).subscribe(r => expect(r).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/budget?user_id=${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deleteBudget ⇒ DELETE /budget/:id', () => {
    const id = 1;

    service.deleteBudget(id).subscribe(r => expect(r).toBeNull());

    const req = httpMock.expectOne(`${baseUrl}/budget/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  /* ────────────────  User  ─────────────── */
  it('getUser ⇒ GET /users?user_id', () => {
    const userId = 3;
    const mock   = { id: 3, name: 'Alice' };

    service.getUser(userId).subscribe(r => expect(r).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/users?user_id=${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
