import { Component } from '@angular/core';
import { Ng2StateDeclaration } from "ui-router-ng2";




@Component({
  selector: 'miner-view',
  templateUrl: './miner-view.component.html'
})
export class MinerViewComponent {
  minerSearch: string = 'miner';
}


export let MinerViewState: Ng2StateDeclaration = {
  name: 'app.dashboard.miner',
  url: '/miner',
  views: {
    $default: { component: MinerViewComponent }
  }  
}