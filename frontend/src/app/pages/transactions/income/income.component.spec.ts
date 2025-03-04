import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeComponent } from './income.component';
import { TransactionsService } from '../../../services/transactions.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Income } from '../../../models/transactions.model';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let fixture: ComponentFixture<IncomeComponent>;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule, 
        HttpClientTestingModule, 
        IncomeComponent // Since it's a standalone component
      ], 
      providers: [TransactionsService],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeComponent);
    component = fixture.componentInstance;
    transactionsService = TestBed.inject(TransactionsService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal event when close() is called', () => {
    const closeModalEmit = jest.fn();
    component.closeModal.emit = closeModalEmit;  

    component.close();
    
    expect(closeModalEmit).toHaveBeenCalled();
  });

//   it('should call saveIncome and emit incomeSaved event on successful save', () => {
//     const mockIncome: Income = {
//       user_id: 1,
//       amount: 500,
//       category: 'Housing',
//       date: '2025-03-01',
//       description: 'Test income',
//       created_at: 'Test',
//     };

//     const addIncomeMock = jest.fn().mockReturnValue(of(mockIncome));
//     transactionsService.addIncome = addIncomeMock;

//     const incomeSavedEmit = jest.fn();
//     component.incomeSaved.emit = incomeSavedEmit;  

//     const closeMock = jest.fn();
//     component.close = closeMock;  

//     component.income = {
//       amount: '500',
//       category: 'Housing',
//       date: '2025-03-01',
//       description: 'Test income'
//     };

//     component.saveIncome();

//     expect(transactionsService.addIncome).toHaveBeenCalledWith({
//       user_id: 1,
//       amount: 500,
//       category: 'Housing',
//       date: '2025-03-01',
//       description: 'Test income',
//       created_at: 'Test'
//     });

//     expect(incomeSavedEmit).toHaveBeenCalledWith(mockIncome);
//     expect(closeMock).toHaveBeenCalled();
//   });

  it('should not call saveIncome if required fields are missing', () => {
    const addIncomeMock = jest.fn();
    transactionsService.addIncome = addIncomeMock;

    component.income = {
      amount: '',
      category: '',
      date: '',
      description: ''
    };

    component.saveIncome();

    expect(addIncomeMock).not.toHaveBeenCalled();
  });
});
