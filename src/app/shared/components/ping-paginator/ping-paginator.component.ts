import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Page } from '@app/models/page.model';

export class EventPage {
  /** The current page index. */
  pageIndex: number;

  /** The current page size */
  pageSize: number;
}

@Component({
  selector: 'app-ping-paginator',
  templateUrl: './ping-paginator.component.html',
  styleUrls: ['./ping-paginator.component.scss']
})
export class PingPaginatorComponent {
  sizeAvailable = [ 5, 20, 100 ];

  /** Event emitted when the paginator changes the page size or page index. */
  @Output() readonly changePage: EventEmitter<EventPage> = new EventEmitter<EventPage>();

  // tslint:disable-next-line:variable-name
  _internalPage: Page<any>;
  @Input()
  get page(): Page<any> { return this._internalPage; }
  set page(newPage: Page<any> | null) {
    this._internalPage = newPage;
  }

  @Input() currentPage = 0;
  @Input() currentSize = 20;

  changePageSize(newSize: {originalEvent: any, value: number}): void {
    this.currentSize = newSize.value;
    this.currentPage = 0;
    this.emitPageEvent();
  }

  emitPageEvent(): void {
    this.changePage.emit({
      pageIndex: this.currentPage,
      pageSize: +this.currentSize,
    });
  }

  get firstElement(): number {
    return 1 + (this._internalPage?.pageable.pageNumber * this._internalPage?.pageable.pageSize);
  }

  get lastElement(): number {
    return Math.min((this._internalPage?.pageable.pageNumber + 1) * this._internalPage?.pageable.pageSize,
      this._internalPage?.totalElements); // pour le cas ou la page n'est pas entière
  }

  previous(): void {
    this.currentPage -=  1;
    if (this.currentPage < 0) { this.currentPage = 0; }
    this.emitPageEvent();
  }

  next(): void {
    this.currentPage += 1;
    this.emitPageEvent();
  }

  isFirstPage(): boolean {
    return this.page?.first;
  }

  isLastPage(): boolean {
    return this.page?.last;
  }
}
