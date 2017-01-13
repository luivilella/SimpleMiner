import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";

import { MinerComponent } from './miner.component';
import { MinerService } from './miner.service';

import { MinerSearchComponent } from './search/miner-search.component';
import { NewFilterComponent } from './search/new-filter.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
  ],
  declarations: [
    MinerComponent,
    NewFilterComponent,
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
