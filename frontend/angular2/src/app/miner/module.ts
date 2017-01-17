import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";

import { MinerComponent } from './miner/miner.component';
import { MinerService } from './shared/service';

import { MinerSearchComponent } from './search/miner-search.component';
import { NewFilterComponent } from './new-filter/new-filter.component';
import { FilterComponent } from './filter/filter.component';
import { TableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
  ],
  declarations: [
    MinerComponent,
    NewFilterComponent,
    FilterComponent,
    TableComponent,
    MinerSearchComponent,
  ],
  exports: [
    MinerComponent,
  ],
  providers: [
    MinerService,
  ],
})
export class MinerModule { }
