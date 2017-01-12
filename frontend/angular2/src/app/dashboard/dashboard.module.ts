import { NgModule } from '@angular/core';

import { UIRouterModule } from 'ui-router-ng2';

import { MinerModule } from '../miner/miner.module';

import { DashboardState, DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    MinerModule,
    UIRouterModule.forChild({ 
        states: [
          DashboardState  
        ] 
    }),
  ],
  declarations: [
    DashboardComponent,
  ]
})
export class DashboardModule { }
