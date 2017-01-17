import { NgModule } from '@angular/core';

import { UIRouterModule } from 'ui-router-ng2';

import { MinerModule } from '../miner/module';

import { DashboardState, DashboardComponent } from './dashboard.component';
import { MinerViewState, MinerViewComponent } from './miner-view.component';

@NgModule({
  imports: [
    MinerModule,
    UIRouterModule.forChild({ 
        states: [
          DashboardState,
          MinerViewState
        ] 
    }),
  ],
  declarations: [
    DashboardComponent,
    MinerViewComponent
  ]
})
export class DashboardModule { }
