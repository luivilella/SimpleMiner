import { NgModule } from '@angular/core';

import { UIRouterModule } from 'ui-router-ng2';

import { DashboardState, DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
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
