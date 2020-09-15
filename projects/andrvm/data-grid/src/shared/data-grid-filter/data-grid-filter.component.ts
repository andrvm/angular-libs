import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TableColumn, TableColumnFilter } from '../../core/data.model';


@Component({
  selector: 'lib-data-grid-filter',
  templateUrl: './data-grid-filter.component.html',
  styleUrls: ['./data-grid-filter.component.scss']
})
export class DataGridFilterComponent implements OnInit, OnDestroy {

  @Input() column: TableColumn;
  @Input() idGrid = 'default';
  @Input() useCache = true;
  @Output() filterCondition = new EventEmitter<any>();
  formControl: FormControl;
  filterOutput$: Observable<TableColumnFilter>;

  private subscribers: Subscription;
  private filter: TableColumnFilter;


  ngOnInit() {

    this.formControl = new FormControl('');
    this.filterOutput$ = this.formControl.valueChanges
      .pipe(
        map( v => {
          const f = {} as TableColumnFilter;
          f.type = this.column.filter.type;
          f.column = this.column.sysName;
          // values
          f.condition = this.column.filter.type === 'string' ? '' : 'equal';
          f.value = (v === '-1' && this.filter.type === 'list') ? null : v;
          f.value = v && this.column.filter.type === 'date' ? v.toISOString().slice(0, 10) : v;
          return f;
        }),
        tap( (f: TableColumnFilter) => this.filter = f)
      );

    /*
      Get values from cache
     */
    if ( this.useCache ) {
      this.getFilterConditionFromCache();
    }

    if (this.filter && this.filter.value) {
      this.formControl.setValue(this.filter.value);
      this.filterCondition.emit(this.filter);
    }

    this.subscribers = this.filterOutput$
      .subscribe( f => this.filterCondition.emit(f));
  }

  // don't forget to unsubscribe!
  ngOnDestroy() {
    if ( this.useCache ) {
      this.saveFilterConditionToCache();
    }
    this.subscribers.unsubscribe();
  }

  clear() {
    this.formControl.setValue('');
    if ( this.useCache ) {
      this.clearFilterConditionCache();
    }
  }

  saveFilterConditionToCache() {
    if (this.filter) {
      localStorage.setItem('filter-' + this.idGrid + ' - ' + this.column.sysName, JSON.stringify(this.filter));
    }
  }

  getFilterConditionFromCache() {
    this.filter =  JSON.parse(localStorage.getItem('filter-' + this.idGrid + ' - ' + this.column.sysName)) as TableColumnFilter;
  }

  clearFilterConditionCache() {
    localStorage.removeItem('filter-' + this.idGrid + ' - ' + this.column.sysName);
  }

}
