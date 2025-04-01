import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { IncomeComponent } from './income.component';
import { TransactionsService } from '../../../services/transactions.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Income } from '../../../models/transactions.model';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let fixture: ComponentFixture<IncomeComponent>;
  let mockTransactionsService: jest.Mocked<TransactionsService>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    mockTransactionsService = {
      addIncome: jest.fn(),
      getIncomes: jest.fn(),
      deleteIncome: jest.fn(),
    } as any;

    mockAuthService = {
      getUserId: jest.fn().mockReturnValue(1),
    } as any;

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, IncomeComponent], // Include standalone imports
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct categories', () => {
    expect(component.categories).toEqual([
      'Salary',
      'Freelance',
      'Business',
      'Investments',
      'Rent',
      'Benefits',
      'Gifts',
      'Other',
    ]);
  });

  it('should emit closeModal when close() is called', () => {
    const closeModalEmitSpy = jest.spyOn(component.closeModal, 'emit');
    component.close();
    expect(closeModalEmitSpy).toHaveBeenCalledTimes(1);
  });

});