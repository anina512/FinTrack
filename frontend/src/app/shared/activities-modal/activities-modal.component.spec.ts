import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesModalComponent } from './activities-modal.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('ActivitiesModalComponent', () => {
  let component: ActivitiesModalComponent;
  let fixture: ComponentFixture<ActivitiesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal event when close is called', () => {
    jest.spyOn(component.closeModal, 'emit');

    component.close();

    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should return correct color for activity type', () => {
    expect(component.getActivityColor('income')).toBe('#2ecc71');
    expect(component.getActivityColor('expense')).toBe('#e74c3c');
    expect(component.getActivityColor('budget')).toBe('#3498db');
    expect(component.getActivityColor('unknown')).toBe('#95a5a6');
  });

  it('should receive combinedActivities input', () => {
    const mockActivities = [
      { type: 'income', amount: 100 },
      { type: 'expense', amount: 50 }
    ];
    component.combinedActivities = mockActivities;
    fixture.detectChanges();

    expect(component.combinedActivities.length).toBe(2);
    expect(component.combinedActivities[0].type).toBe('income');
  });
});
