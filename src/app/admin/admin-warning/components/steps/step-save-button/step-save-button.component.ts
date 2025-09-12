import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'aw-step-save-button',
  templateUrl: './step-save-button.component.html',
  styleUrls: ['./step-save-button.component.scss']
})
export class StepSaveButtonComponent {

  @Output() savePageButton = new EventEmitter<boolean>();

  protected save(): void {
    this.savePageButton.emit();
  }
}
