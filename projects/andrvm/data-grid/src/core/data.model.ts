export interface TableColumn {
  userName?: string;
  sysName?: string;
  sysNameUser?: string;
  isSort?: boolean;
  isView?: boolean;
  type: string;
  filter?: TableColumnFilter;
  colorCondition?: TableColumnColorCondition;
  isTotal?: boolean;
  dateFormat?: string;
}

export interface TableColumnFilter {
  type: string; // string | data | list
  filterValues?: any;
  column?: string;
  value: any;
  condition?: string; // less | more | equal | nqual
  on: boolean;
}

export interface TableColumnColorCondition {
  color: string;
  condition?: string; // less | more | equal | nqual
  conditionValue?: any;
}
