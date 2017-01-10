import { NgModule } from '@angular/core';

import { UIRouterModule } from 'ui-router-ng2';

import { AdminState, AdminComponent } from './admin.component';

@NgModule({
  imports: [
    UIRouterModule.forChild({ 
        states: [
          AdminState  
        ] 
    }),
  ],
  declarations: [
    AdminComponent,
  ]
})
export class AdminModule { }
