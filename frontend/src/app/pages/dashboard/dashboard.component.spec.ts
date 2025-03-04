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

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close expense modal', () => {
    component.openExpenseModal();
    expect(component.showExpenseModal).toBe(true);

    component.closeExpenseModal();
    expect(component.showExpenseModal).toBe(false);
  });

  it('should open and close income modal', () => {
    component.openIncomeModal();
    expect(component.showIncomeModal).toBe(true);

    component.closeIncomeModal();
    expect(component.showIncomeModal).toBe(false);
  });

  it('should open and close budget modal', () => {
    component.openBudgetModal();
    expect(component.showBudgetModal).toBe(true);

    component.closeBudgetModal();
    expect(component.showBudgetModal).toBe(false);
  });
});
