import { Component, OnInit } from '@angular/core';
import { Ng2StateDeclaration, UIRouter } from "ui-router-ng2";


import { MinerViewComponent } from './miner-view.component'

@Component({
  selector: 'dashboard-base',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit{
    constructor(private _router: UIRouter) {
       
    }
    
    ngOnInit(): void{
      this._router.stateService.go('app.dashboard.miner');
    }

}


export let DashboardState: Ng2StateDeclaration = {
  name: 'app.dashboard',
  url: '/dashboard',
  views: {
    $default: { component: DashboardComponent }
  }
}