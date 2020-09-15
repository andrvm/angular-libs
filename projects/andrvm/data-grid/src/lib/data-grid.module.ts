import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DataGridComponent } from './data-grid.component';



@NgModule({
  declarations: [
    DataGridComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    DataGridComponent
  ]
})
export class DataGridModule { }
