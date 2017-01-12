import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";

import { MinerComponent } from './miner.component';
import { MinerService } from './miner.service';

import { MinerSearchComponent } from './search/miner-search.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  declarations: [
    MinerComponent,
    MinerSearchComponent
  ],
  exports: [
    MinerComponent
  ],
  providers: [
    MinerService
  ],
})
export class MinerModule { }
