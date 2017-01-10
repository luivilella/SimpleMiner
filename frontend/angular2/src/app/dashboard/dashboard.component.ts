import { Component } from '@angular/core';
import { Ng2StateDeclaration } from "ui-router-ng2";




@Component({
  selector: 'dashboard-base',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent { }


export let DashboardState: Ng2StateDeclaration = {
  name: 'app.dashboard',
  url: '/dashboard',
  views: {
    $default: { component: DashboardComponent }
  }
}