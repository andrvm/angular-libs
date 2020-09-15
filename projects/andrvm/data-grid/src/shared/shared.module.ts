import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './paginator/paginator.component';
import { DataGridFilterComponent } from './data-grid-filter/data-grid-filter.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    PaginatorComponent,
    DataGridFilterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    PaginatorComponent,
    DataGridFilterComponent
  ]
})
export class SharedModule { }
