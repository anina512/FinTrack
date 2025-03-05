import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID } from '@angular/core';

jest.mock('@angular/router');

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const mockExpense = { category: 'Food', amount: 150 };
  const mockIncome = { source: 'Salary', amount: 3000 };
  const mockBudget = { category: 'Utilities', limit: 500 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        CommonModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Core Component Tests
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // Modal Visibility Tests
  it('should manage expense modal visibility', () => {
    component.openExpenseModal();
    expect(component.showExpenseModal).toBe(true);
    component.closeExpenseModal();
    expect(component.showExpenseModal).toBe(false);
  });

  it('should manage income modal visibility', () => {
    component.openIncomeModal();
    expect(component.showIncomeModal).toBe(true);
    component.closeIncomeModal();
    expect(component.showIncomeModal).toBe(false);
  });

  it('should manage budget modal visibility', () => {
    component.openBudgetModal();
    expect(component.showBudgetModal).toBe(true);
    component.closeBudgetModal();
    expect(component.showBudgetModal).toBe(false);
  });

  // View Mode Tests
  it('should activate view modes correctly', () => {
    component.viewExpenseDetails();
    expect(component.expenseMode).toBe('view');
    
    component.viewIncomeDetails();
    expect(component.incomeMode).toBe('view');
    
    component.viewBudgetDetails();
    expect(component.budgetMode).toBe('view');
  });

  // Data Operations Tests
  it('should handle financial data operations', () => {
    const expenseSpy = jest.spyOn(component.expenseInstance, 'saveExpense');
    const incomeSpy = jest.spyOn(component.incomeInstance, 'saveIncome');
    const budgetSpy = jest.spyOn(component.budgetInstance, 'saveBudget');

    component.onExpenseSaved(mockExpense);
    component.onIncomeSaved(mockIncome);
    component.onBudgetSaved(mockBudget);

    expect(expenseSpy).toHaveBeenCalled();
    expect(incomeSpy).toHaveBeenCalled();
    expect(budgetSpy).toHaveBeenCalled();
  });
});
