import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetComponent } from './budget.component';
import { TransactionsService } from '../../../services/transactions.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Budget } from '../../../models/transactions.model';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let fixture: ComponentFixture<BudgetComponent>;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule, 
        HttpClientTestingModule, 
        BudgetComponent  // Adding BudgetComponent here as it is standalone
      ], 
      providers: [TransactionsService],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetComponent);
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

//   it('should call saveBudget and emit budgetSaved event on successful save', () => {
//     const mockBudget: Budget = {
//       user_id: 1,
//       budget_name: 'Test Budget',
//       monthly_income: 5000,
//       start_date: '2025-03-01',
//       end_date: '2025-06-01',
//       details: 'Test details',
//       created_at: new Date().toISOString(),
//     };

//     // Mock the addBudget method to return a mocked budget
//     const addBudgetMock = jest.fn().mockReturnValue(of(mockBudget));
//     transactionsService.addBudget = addBudgetMock;

//     const budgetSavedEmit = jest.fn();
//     component.budgetSaved.emit = budgetSavedEmit;  // Overriding the emit method with a Jest mock function

//     const closeMock = jest.fn();
//     component.close = closeMock;  // Overriding the close method with a Jest mock function

//     // Set valid budget values
//     component.budget = {
//       name: 'Test Budget',
//       monthlyIncome: '5000',
//       startDate: '2025-03-01',
//       endDate: '2025-06-01',
//       details: 'Test details'
//     };

//     // Call the saveBudget method
//     component.saveBudget();

//     // Ensure addBudget was called with correct parameters
//     expect(addBudgetMock).toHaveBeenCalledWith({
//       user_id: 1,
//       budget_name: 'Test Budget',
//       monthly_income: 5000,
//       start_date: '2025-03-01',
//       end_date: '2025-06-01',
//       details: 'Test details',
//       created_at: expect.any(String),
//     });

//     // Ensure the budgetSaved and close methods were called
//     expect(budgetSavedEmit).toHaveBeenCalledWith(mockBudget);
//     expect(closeMock).toHaveBeenCalled();
//   });

  it('should not call saveBudget if required fields are missing', () => {
    // Mock addBudget
    const addBudgetMock = jest.fn();
    transactionsService.addBudget = addBudgetMock;

    // Set invalid budget values
    component.budget = {
      name: '',
      monthlyIncome: '',
      startDate: '',
      endDate: '',
      details: ''
    };

    // Call the saveBudget method
    component.saveBudget();

    // Ensure addBudget was not called
    expect(addBudgetMock).not.toHaveBeenCalled();
  });
});
