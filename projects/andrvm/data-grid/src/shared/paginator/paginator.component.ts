import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'lib-grid-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent {

  @Input() pager: any;
  @Output() selectedPage = new EventEmitter<number>();


  getPage(page: number): void {
    this.selectedPage.emit(page);
  }

}
