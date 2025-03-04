import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseComponent } from './expense.component';
import { TransactionsService } from '../../../services/transactions.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Expense } from '../../../models/transactions.model';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule, 
        HttpClientTestingModule, 
        ExpenseComponent  // Adding ExpenseComponent here as it is standalone
      ], 
      providers: [TransactionsService],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseComponent);
    component = fixture.componentInstance;
    transactionsService = TestBed.inject(TransactionsService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal event when close() is called', () => {
    const closeModalEmit = jest.fn();
    component.closeModal.emit = closeModalEmit;  // Overriding the emit method with a Jest mock function
    
    component.close();
    
    expect(closeModalEmit).toHaveBeenCalled();
  });

//   it('should call saveExpense and emit expenseSaved event on successful save', () => {
//     const mockExpense: Expense = {
//       user_id: 1,
//       amount: 100,
//       category: 'food',
//       date: '2025-03-01',
//       description: 'Test expense',
//       created_at: new Date().toISOString(),
//     };

//     // Mock the addExpense method to return a mocked expense
//     const addExpenseMock = jest.fn().mockReturnValue(of(mockExpense));
//     transactionsService.addExpense = addExpenseMock;

//     const expenseSavedEmit = jest.fn();
//     component.expenseSaved.emit = expenseSavedEmit;  // Overriding the emit method with a Jest mock function

//     const closeMock = jest.fn();
//     component.close = closeMock;  // Overriding the close method with a Jest mock function

//     // Set valid expense values
//     component.expense = {
//       amount: '100',
//       category: 'food',
//       date: '2025-03-01',
//       description: 'Test expense'
//     };

//     // Call the saveExpense method
//     component.saveExpense();

//     // Ensure addExpense was called with correct parameters
//     expect(addExpenseMock).toHaveBeenCalledWith({
//       user_id: 1,
//       amount: 100,
//       category: 'food',
//       date: '2025-03-01',
//       description: 'Test expense',
//       created_at: expect.any(String),
//     });

//     // Ensure the expenseSaved and close methods were called
//     expect(expenseSavedEmit).toHaveBeenCalledWith(mockExpense);
//     expect(closeMock).toHaveBeenCalled();
//   });

  it('should not call saveExpense if required fields are missing', () => {
    // Mock addExpense
    const addExpenseMock = jest.fn();
    transactionsService.addExpense = addExpenseMock;

    // Set invalid expense values
    component.expense = {
      amount: '',
      category: '',
      date: '',
      description: ''
    };

    // Call the saveExpense method
    component.saveExpense();

    // Ensure addExpense was not called
    expect(addExpenseMock).not.toHaveBeenCalled();
  });
});
