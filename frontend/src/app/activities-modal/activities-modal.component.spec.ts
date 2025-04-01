import { ActivitiesModalComponent } from './activities-modal.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

describe('ActivitiesModalComponent', () => {
  let component: ActivitiesModalComponent;
  let fixture: ComponentFixture<ActivitiesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ActivitiesModalComponent // Moved from declarations to imports
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an empty combinedActivities array', () => {
    expect(component.combinedActivities).toEqual([]);
  });

  it('should emit closeModal event when close() is called', () => {
    const closeModalEmitSpy = jest.spyOn(component.closeModal, 'emit');
    component.close();
    expect(closeModalEmitSpy).toHaveBeenCalledTimes(1);
    expect(closeModalEmitSpy).toHaveBeenCalledWith();
  });

  describe('getActivityColor', () => {
    it('should return green (#2ecc71) for income type', () => {
      const color = component.getActivityColor('income');
      expect(color).toBe('#2ecc71');
    });

    it('should return red (#e74c3c) for expense type', () => {
      const color = component.getActivityColor('expense');
      expect(color).toBe('#e74c3c');
    });

    it('should return blue (#3498db) for budget type', () => {
      const color = component.getActivityColor('budget');
      expect(color).toBe('#3498db');
    });

    it('should return gray (#95a5a6) for an unknown type', () => {
      const color = component.getActivityColor('unknown');
      expect(color).toBe('#95a5a6');
    });

    it('should return gray (#95a5a6) when type is empty or undefined', () => {
      expect(component.getActivityColor('')).toBe('#95a5a6');
      expect(component.getActivityColor(undefined as any)).toBe('#95a5a6');
    });
  });

  it('should accept and store combinedActivities input', () => {
    const testActivities = [
      { type: 'income', amount: 100 },
      { type: 'expense', amount: 50 }
    ];
    component.combinedActivities = testActivities;
    fixture.detectChanges();
    expect(component.combinedActivities).toEqual(testActivities);
  });
});