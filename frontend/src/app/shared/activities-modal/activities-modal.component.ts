import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activities-modal',
  templateUrl: './activities-modal.component.html',
  styleUrls: ['./activities-modal.component.css'],
  imports: [CommonModule],
})
export class ActivitiesModalComponent {
  @Input() combinedActivities: any[] = [];
  @Output() closeModal = new EventEmitter<void>();

  getActivityColor(type: string): string {
    return {
      'income': '#2ecc71',    // Green
      'expense': '#e74c3c',   // Red
      'budget': '#3498db'     // Blue
    }[type] || '#95a5a6';
  }

  close() {
    this.closeModal.emit();
  }
}