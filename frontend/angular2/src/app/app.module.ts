import { NgModule } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';

import { UIRouterModule, UIView, Ng2StateDeclaration } from "ui-router-ng2";

import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/module';
import { AdminModule } from './admin/admin.module';

import 'material-design-lite/dist/material.min';

let states: Ng2StateDeclaration[] = [
    { name: 'app', component: AppComponent },
];

@NgModule({
  imports: [
    BrowserModule,
    UIRouterModule.forRoot({ 
      states: states,
      otherwise: { state: 'app.dashboard', params: {} },
      useHash: true       
    }),
    DashboardModule,
    AdminModule
  ],
  declarations: [AppComponent],
  providers: [
  ],
  bootstrap: [UIView]
})
export class AppModule { }
