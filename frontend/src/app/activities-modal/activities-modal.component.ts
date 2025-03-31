import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activities-modal',
  templateUrl: './activities-modal.component.html',
  styleUrls: ['./activities-modal.component.scss'],
  imports: [
      CommonModule,      
    ],
})
export class ActivitiesModalComponent {
  @Input() allIncomes: any[] = [];
  @Input() allExpenses: any[] = [];
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}
