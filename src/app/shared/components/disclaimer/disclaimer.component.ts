import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'shared-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent implements OnInit {
  @Input() displayDisclaimer = false;
  @Input() header: string;
  @Input() content: string;
  @Output() closeDialog = new EventEmitter<boolean>();
  @Input() position = 'top';
  checked = false;

  constructor() { }

  ngOnInit(): void {
  }

  onClose(checked: boolean): void {
    this.closeDialog.emit(checked);
    this.checked = false;
  }
}
