import {
  AfterContentChecked, ChangeDetectorRef,
  Component, EventEmitter, Input,
  OnChanges, OnDestroy,
  OnInit, Output, SimpleChange
} from '@angular/core';
import { TableColumn, TableColumnColorCondition, TableColumnFilter } from '../core/data.model';
import { PageService } from '../core/page.service';



const deepObjClone2 = (obj: any) => JSON.parse(JSON.stringify(obj));

const sortDataByKey = (key: string, order: string = 'asc') => {
  return (a, b) => {

    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;

    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }

    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };

};

const toFixed = (num: number, precision: number = 2): number => Number(num.toFixed(precision));


interface SortData {
  key: string;
  order: string;
}

@Component({
  selector: 'lib-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
  providers: [PageService]
})
export class DataGridComponent implements OnInit, OnChanges, OnDestroy, AfterContentChecked {

  // system
  // @Input() isIdColumn = false;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[];
  @Input() isSort = true;
  @Input() isFilter = true;
  @Input() isPaginator = true;
  @Input() isTotal = false;
  @Input() canDeleteData = true;
  @Input() canEditData = true;
  @Input() canViewData = false;
  @Input() idGrid = 'default'; // for filter
  @Input() useCache = true;

  // interface
  @Input() leftPositionAddButton = false;
  @Input() isTableHeaderAlignCenter = false;
  @Input() isActionColumn = true;
  @Input() showAddButton = true;
  @Input() viewIconClass = '';
  @Input() editIconClass = '';
  @Input() deleteIconClass = '';

  // config
  @Input() addButtonText = 'Add';
  @Input() viewActionTitle = 'View';
  @Input() editActionTitle = 'Edit';
  @Input() deleteActionTitle = 'Delete';
  @Input() actionColumnTitle = 'Actions';
  @Input() totalText = 'Total';
  @Input() noDataMessage = 'There is no any data ...';

  // output
  @Output() removeId = new EventEmitter<string>();
  @Output() editObject = new EventEmitter<any>();
  @Output() viewObject = new EventEmitter<any>();
  @Output() addData = new EventEmitter<boolean>();

  total = 0;

  // dataCopy
  private copyData: any[];
  filterConditions: TableColumnFilter[] = [];

  // pager object
  pager: any = {};
  // paged items
  pagedItems: any[];
  //
  routeLink: string;
  // sorting
  sortKey = null;
  sortOrder = 'asc';
  //
  trColor = 'inherit';

  constructor(private pageService: PageService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initData();
  }

  ngOnDestroy() {
    if ( this.useCache ) {
      this.saveSortConditionToCache();
    }
  }

  /**
   * It's needed to catch 'data' property from app store
   */
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {

    this.initData();

    if ( this.useCache ) {
      this.getSortConditionFromCache();
    }

    if (this.sortKey) {
      this._sort();
    }

  }

  /**
   * To prevent ExpressionChangedAfterItHasBeenCheckedError
   */
  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  private initData() {

    this.copyData = deepObjClone2(this.data);

    if (Object.keys(this.filterConditions).length) {
      this.filterData();
    }
    this.setPage(1);
  }

  private countTotal() {
    this.total = 0;
    if (this.isTotal) {
      // get total column
      const totalColumn = this.columns.find( c => c.isTotal === true);
      // count total
      this.data.map ( d => {
        this.total += d[totalColumn.sysNameUser] || d[totalColumn.sysName];
      });
      this.total = toFixed(this.total);
    }
  }

  private _sort() {
    // sort data
    this.data.sort(sortDataByKey(this.sortKey, this.sortOrder));
    // set page
    this.setPage(1);
  }

  getFilterCondition(filter: TableColumnFilter) {

    if (!filter) {
      return;
    }

    // delete filter
    if (!filter.value && this.filterConditions[filter.column]) {
      delete this.filterConditions[filter.column];
    } else {
      // set filter
      this.filterConditions[filter.column] = filter;
    }
    // check conditions
    if (!Object.keys(this.filterConditions).length) {
      this.data = this.copyData;
    } else {
      this.filterData();
    }
    this.setPage(1);
  }

  filterData() {

    this.data = this.copyData.filter(d => {

      const dKeys = Object.keys(d);
      const fKeys = Object.keys(this.filterConditions);
      const conditions = [0, 0, 0, 0]; // init

      fKeys.forEach( f => {

        if (f in dKeys) {

          const filter = this.filterConditions[f] as TableColumnFilter;

          if (filter.type === 'string' && d[filter.column] && d[filter.column].toLowerCase().indexOf(filter.value) !== -1) {
            conditions[0]++;
          }

          if (filter.type === 'list' && d[filter.column] && d[filter.column] === filter.value) {
            conditions[1]++;
          }

          if (filter.type === 'boolean' && filter.condition === 'equal' && d[filter.column]) {
            if ( (filter.value && d[filter.column]) || (!filter.value && !d[filter.column]) ) {
              conditions[2]++;
            }
          }

          if (filter.type === 'date' && d[filter.column] && d[filter.column].slice(0, 10) === filter.value ) {
            conditions[3]++;
          }

        }
      });

      return conditions.reduce((a, b) => a + b, 0) === fKeys.length ? true : false;

    });

  }

  setPage(page: number) {
    if (this.data && this.data.length) {
      // get pager object from service
      this.pager = this.pageService.getPager(this.data.length, page);
      // get current page of items
      this.pagedItems = this.data.slice(this.pager.startIndex, this.pager.endIndex + 1);
      this.countTotal();
    } else {
      this.pagedItems = null;
    }
  }

  sort(key: string) {
    this.sortKey = key;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this._sort();
  }

  remove(id: string) {
    this.removeId.emit(id);
  }

  edit(item: any) {
    this.editObject.emit(item);
  }

  view(item: any) {
    this.viewObject.emit(item);
  }

  add() {
    this.addData.emit(true);
  }

  getTableColumnColor(tdCC: TableColumnColorCondition, value: any): string {

    if (!tdCC) {
      return ;
    }

    let color = 'inherit';

    switch (tdCC.condition) {
      case 'more':
        color = value > 0 ? tdCC.color : 'inherit';
        this.trColor = color;
        break;
      case 'equal':
        color = value === tdCC.conditionValue ? tdCC.color : 'inherit';
        this.trColor = color;
        break;
    }

    return color;
  }

  saveSortConditionToCache() {
    const sort: SortData = {} as SortData;
    sort.key = this.sortKey;
    sort.order = this.sortOrder;
    localStorage.setItem('sort-' + this.idGrid, JSON.stringify(sort));
  }

  getSortConditionFromCache() {
    const sort =  JSON.parse(localStorage.getItem('sort-' + this.idGrid)) as SortData;
    if (!sort) {
      return;
    }
    this.sortOrder = sort.order || 'desc';
    this.sortKey = sort.key || null;
  }

}
